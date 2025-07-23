"use client";

import React, { useState } from "react";
import Drawer from "../../components/Drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, ArrowRight, ArrowLeft, Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { SingleDatePicker } from "@/components/input/singleDatePicker";
import { invitationService, InvitationData } from "@/services/invitation";
import { useAdminCluster } from "@/hooks/useAdminCluster";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AddWargaDrawer() {
  const [step, setStep] = useState(1);
  const [tanggalTinggal, setTanggalTinggal] = useState<Date | undefined>();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Get cluster info from admin
  const { clusterId, clusterName, loading: clusterLoading, error: clusterError } = useAdminCluster();

  // Form data state
  const [formData, setFormData] = useState<Partial<InvitationData>>({
    email: '',
    fullname: '',
    role: 'warga',
    noTelp: '',
    address: '',
    houseType: '',
    houseNumber: '',
    ownershipStatus: 'unknown',
    headOfFamily: '',
    emergencyJob: '',
    movingDate: '',
    citizenStatus: 'new_citizen'
  });

  // Reset form and state when drawer opens/closes
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset form when closed
      setStep(1);
      setError(null);
      setSuccess(false);
      setFormData({
        email: '',
        fullname: '',
        role: 'warga',
        noTelp: '',
        address: '',
        houseType: '',
        houseNumber: '',
        ownershipStatus: 'unknown',
        headOfFamily: '',
        emergencyJob: '',
        movingDate: '',
        citizenStatus: 'new_citizen'
      });
      setTanggalTinggal(undefined);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!clusterId) {
      setError('Cluster ID tidak ditemukan. Pastikan Anda memiliki akses cluster.');
      return;
    }

    // Validation
    if (!formData.email || !formData.fullname) {
      setError('Email dan nama lengkap wajib diisi');
      return;
    }

    // Client-side validation terlebih dahulu
    const invitationData: InvitationData = {
      email: formData.email!,
      fullname: formData.fullname!,
      clusterId: clusterId,
      role: formData.role || 'warga',
      noTelp: formData.noTelp || '',
      address: formData.address || '',
      houseType: formData.houseType || '',
      houseNumber: formData.houseNumber || '',
      ownershipStatus: formData.ownershipStatus || 'unknown',
      headOfFamily: formData.headOfFamily || '',
      emergencyJob: formData.emergencyJob || '',
      movingDate: tanggalTinggal ? tanggalTinggal.toISOString().split('T')[0] : undefined,
      citizenStatus: formData.citizenStatus || 'new_citizen'
    };

    const validation = invitationService.validateInvitationData(invitationData);
    if (!validation.success) {
      setError(validation.error || 'Validasi gagal');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await invitationService.sendInvitation(invitationData);

      if (result.success) {
        setSuccess(true);
        // Auto close after 2 seconds
        setTimeout(() => {
          handleOpenChange(false);
        }, 2000);
      } else {
        setError(result.error || 'Gagal mengirim undangan');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan tidak terduga';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerButton = (
    <Button className="bg-foreground text-background hover:bg-foreground/90" disabled={clusterLoading}>
      <Plus className="h-4 w-4 mr-2" />
      {clusterLoading ? 'Loading...' : 'Tambah Warga'}
    </Button>
  );

  const Step1Form = (
    <div className="grid gap-4 pt-4">
      {/* Cluster Info Display */}
      {clusterId && clusterName && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Warga akan ditambahkan ke cluster: <strong>{clusterName}</strong>
          </AlertDescription>
        </Alert>
      )}

      {/* Cluster Error */}
      {clusterError && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-600">
            {clusterError}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-2">
        <Label htmlFor="nama">Nama Lengkap *</Label>
        <Input 
          id="nama" 
          placeholder="Mathew Alexander"
          value={formData.fullname}
          onChange={(e) => setFormData({...formData, fullname: e.target.value})}
          disabled={isLoading}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="hp">Nomor HP Aktif</Label>
        <Input 
          id="hp" 
          placeholder="0895349243330"
          value={formData.noTelp}
          onChange={(e) => setFormData({...formData, noTelp: e.target.value})}
          disabled={isLoading}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email *</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder="mathewa@gmail.com"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          disabled={isLoading}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="alamat">Alamat Rumah</Label>
        <Input 
          id="alamat" 
          placeholder="Komplek Mahata Margonda No12 Blok A"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
          disabled={isLoading}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="tipe-rumah">Tipe Rumah</Label>
        <Input 
          id="tipe-rumah" 
          placeholder="42 B"
          value={formData.houseType}
          onChange={(e) => setFormData({...formData, houseType: e.target.value})}
          disabled={isLoading}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="nomor-rumah">Nomor Rumah</Label>
        <Input 
          id="nomor-rumah" 
          placeholder="12A"
          value={formData.houseNumber}
          onChange={(e) => setFormData({...formData, houseNumber: e.target.value})}
          disabled={isLoading}
        />
      </div>
      <div className="grid gap-2 w-full">
        <Label htmlFor="status-kepemilikan">Status Kepemilikan</Label>
        <Select 
          value={formData.ownershipStatus} 
          onValueChange={(value) => setFormData({...formData, ownershipStatus: value as InvitationData['ownershipStatus']})}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Pilih status kepemilikan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sewa">Sewa</SelectItem>
            <SelectItem value="milik-sendiri">Milik Sendiri</SelectItem>
            <SelectItem value="milik-orang-tua">Milik Orang Tua</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const Step2Form = (
    <div className="grid gap-4 pt-4">
      <div className="grid gap-2">
        <Label htmlFor="nama-kepala-keluarga">Nama Kepala Keluarga</Label>
        <Input 
          id="nama-kepala-keluarga" 
          placeholder="Mathew Alexander"
          value={formData.headOfFamily}
          onChange={(e) => setFormData({...formData, headOfFamily: e.target.value})}
          disabled={isLoading}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="pekerjaan">Pekerjaan</Label>
        <Input 
          id="pekerjaan" 
          placeholder="Software Engineer"
          value={formData.emergencyJob}
          onChange={(e) => setFormData({...formData, emergencyJob: e.target.value})}
          disabled={isLoading}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="tanggal-tinggal">Tanggal Tinggal</Label>
        <SingleDatePicker
          id="tanggal-tinggal"
          placeholder="20/06/2025"
          value={tanggalTinggal}
          onChange={setTanggalTinggal}
          buttonClassName="w-full"
          disabled={isLoading}
        />
      </div>
      <div className="grid gap-2 w-full">
        <Label htmlFor="role">Role</Label>
        <Select 
          value={formData.role} 
          onValueChange={(value: 'admin' | 'warga') => setFormData({...formData, role: value})}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Pilih role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="warga">Warga</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">
            ✅ Undangan berhasil dikirim! Drawer akan tertutup otomatis.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-600">
            ❌ {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  const footerContent = (
    <div className="flex justify-between">
      {step === 2 && !success && (
        <Button variant="outline" onClick={() => setStep(1)} disabled={isLoading}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Sebelumnya
        </Button>
      )}
      <div className="flex-grow"></div>
      {step === 1 && (
        <Button 
          onClick={() => setStep(2)} 
          disabled={isLoading || !formData.email || !formData.fullname}
        >
          Selanjutnya
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
      {step === 2 && !success && (
        <Button onClick={handleSubmit} disabled={isLoading || !clusterId}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Mengirim...
            </>
          ) : (
            <>
              Kirim Undangan
              <Send className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      )}
    </div>
  );

  return (
    <Drawer
      trigger={triggerButton}
      title={success ? "Undangan Berhasil Dikirim!" : "Form Pendaftaran Warga Baru"}
      description={success 
        ? `Undangan telah dikirim ke ${formData.email}. Mereka akan menerima email untuk bergabung.`
        : "Isi data warga baru untuk mengirim undangan bergabung ke sistem."
      }
      steps={success ? "" : `Step ${step}/2`}
      footer={footerContent}
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      {step === 1 ? Step1Form : Step2Form}
    </Drawer>
  );
} 