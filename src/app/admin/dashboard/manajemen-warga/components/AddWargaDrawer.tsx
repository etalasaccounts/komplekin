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
import { Plus, ArrowRight, ArrowLeft, Send, Loader2 } from "lucide-react";
import { SingleDatePicker } from "@/components/input/singleDatePicker";
import { ChooseFile } from "@/components/input/chooseFile";
import { wargaMagicService, CreateWargaMagicData } from "@/services/wargaMagic";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function AddWargaDrawer() {
  const [step, setStep] = useState(1);
  const [tanggalTinggal, setTanggalTinggal] = useState<Date | undefined>();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // File upload states
  const [fotoKTP, setFotoKTP] = useState<File | null>(null);
  const [fotoKK, setFotoKK] = useState<File | null>(null);
  


  // Get cluster info from admin
  const { clusterId, clusterName, loading: clusterLoading } = useAuth();

  // Form data state (reorganized according to screenshot)
  const [formData, setFormData] = useState<Partial<CreateWargaMagicData>>({
    email: '',
    fullname: '',
    role: 'user', // Default role
    noTelp: '', // HP Aktif
    address: '',
    houseType: '',
    houseNumber: '',
    ownershipStatus: 'unknown',
    headOfFamily: '',
    emergencyJob: '',
    movingDate: '',
    citizenStatus: 'Warga Baru'
  });

  // Reset form and state when drawer opens/closes
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset form when closed
      setStep(1);
      setFormData({
        email: '',
        fullname: '',
        role: 'user',
        noTelp: '',
        address: '',
        houseType: '',
        houseNumber: '',
        ownershipStatus: 'unknown',
        headOfFamily: '',
        emergencyJob: '',
        movingDate: '',
        citizenStatus: 'Warga Baru'
      });
      setTanggalTinggal(undefined);
      setFotoKTP(null);
      setFotoKK(null);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!clusterId) {
      toast.error('Cluster ID tidak ditemukan. Pastikan Anda memiliki akses cluster.');
      return;
    }

    // Validation
    if (!formData.email || !formData.fullname) {
      toast.error('Email dan nama lengkap wajib diisi');
      return;
    }

    // Siapkan data untuk create warga dengan magic link
    const wargaData: CreateWargaMagicData = {
      email: formData.email!,
      fullname: formData.fullname!,
      clusterId: clusterId,
      role: formData.role || 'user',
      noTelp: formData.noTelp || '',
      address: formData.address || '',
      houseType: formData.houseType || '',
      houseNumber: formData.houseNumber || '',
      ownershipStatus: formData.ownershipStatus || 'unknown',
      headOfFamily: formData.headOfFamily || '', 
      emergencyJob: formData.emergencyJob || '',
      movingDate: tanggalTinggal ? tanggalTinggal.toISOString().split('T')[0] : undefined,
      citizenStatus: formData.citizenStatus || 'Warga Baru'
    };

    const validation = wargaMagicService.validateWargaData(wargaData);
    if (!validation.success) {
      toast.error(validation.error || 'Validasi gagal');
      return;
    }

    setIsLoading(true);

    try {
      const result = await wargaMagicService.createWargaWithMagicLink(wargaData);

      if (result.success && result.data) {
        // Copy important data to clipboard automatically
        const credentialsText = `
Akun KomplekIn berhasil dibuat!

Nama: ${result.data.fullname}
Email: ${result.data.email}
Cluster: ${result.data.cluster || clusterName || 'Unknown'}
Role: ${result.data.roleInfo?.title}

Password Sementara: ${result.data.temporaryPassword}
Magic Link: ${result.data.magicLink}

Instruksi:
1. Bagikan magic link dan password sementara kepada user
2. User klik magic link → masukkan password sementara
3. User buat password baru → bisa mulai menggunakan sistem
        `.trim();

        // Auto copy to clipboard
        try {
          await navigator.clipboard.writeText(credentialsText);
          
          // Show success toast with green background and white text  
          toast.success(`✅ Warga ${result.data.fullname} berhasil dibuat!
📋 Kredensial telah disalin ke clipboard
📧 Bagikan magic link & password sementara secara manual`, {
            style: {
              background: '#22c55e',
              color: 'white',
              border: 'none'
            },
            duration: 5000
          });
        } catch {
          // Fallback if clipboard fails
          toast.success(`✅ Warga ${result.data.fullname} berhasil dibuat!
Password sementara: ${result.data.temporaryPassword}
Bagikan kredensial secara manual`, {
            style: {
              background: '#22c55e', 
              color: 'white',
              border: 'none'
            },
            duration: 5000
          });
        }
        
        // Close drawer immediately
        handleOpenChange(false);
      } else {
        toast.error(result.error || 'Gagal membuat warga');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan tidak terduga';
      toast.error(errorMessage);
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

  // Step 1: Basic Information
  const Step1Form = (
    <div className="grid gap-4 pt-4">
      {/* Cluster Info Display */}
      {clusterId && clusterName && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
          Warga akan ditambahkan ke cluster: <strong>{clusterName}</strong>
        </div>
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
        <Label htmlFor="hp">Nomor HP Aktif *</Label>
        <Input 
          id="hp" 
          placeholder="089534924330"
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
        <Label htmlFor="alamat">Alamat Rumah *</Label>
        <Input 
          id="alamat" 
          placeholder="Komplek Mahata Margonda No12 Blok A"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
          disabled={isLoading}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="tipe-rumah">Tipe Rumah *</Label>
        <Input 
          id="tipe-rumah" 
          placeholder="42 B"
          value={formData.houseType}
          onChange={(e) => setFormData({...formData, houseType: e.target.value})}
          disabled={isLoading}
        />
      </div>

      <div className="grid gap-2 w-full">
        <Label htmlFor="status-kepemilikan">Status Kepemilikan *</Label>
        <Select 
          value={formData.ownershipStatus} 
          onValueChange={(value) => setFormData({...formData, ownershipStatus: value as CreateWargaMagicData['ownershipStatus']})}
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

  // Step 2: Documents & Additional Details  
  const Step2Form = (
    <div className="grid gap-4 pt-4">
      <div className="grid gap-2">
        <ChooseFile
          label="Foto KTP"
          id="foto-ktp"
          accept="image/*"
          value={fotoKTP}
          onChange={setFotoKTP}
          placeholder="Mathew Alexander"
          disabled={isLoading}
          maxSizeInMB={5}
        />
      </div>

      <div className="grid gap-2">
        <ChooseFile
          label="Foto Kartu keluarga"
          id="foto-kk"
          accept="image/*"
          value={fotoKK}
          onChange={setFotoKK}
          placeholder="Mathew Alexander"
          disabled={isLoading}
          maxSizeInMB={5}
        />
      </div>

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
          placeholder="CEO Figma"
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
        <Label htmlFor="citizen-status">Status Warga</Label>
        <Select 
          value={formData.citizenStatus} 
          onValueChange={(value: 'Pindah' | 'Warga Baru') => setFormData({...formData, citizenStatus: value})}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Pilih status warga" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Warga Baru">Warga Baru</SelectItem>
            <SelectItem value="Pindah">Pindah</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const footerContent = (
    <div className="flex justify-between">
      {step === 2 && (
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
      {step === 2 && (
        <Button onClick={handleSubmit} disabled={isLoading || !clusterId}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menambah Warga...
            </>
          ) : (
            <>
              Tambah Warga
              <Send className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      )}
    </div>
  );

  return (
    <>
      <Drawer
        trigger={triggerButton}
        title="Form Pendaftaran Warga baru"
        description="Isi data warga baru untuk menambahkan mereka ke dalam sistem."
        steps={`Step ${step}/2`}
        footer={footerContent}
        open={isOpen}
        onOpenChange={handleOpenChange}
      >
        {step === 1 ? Step1Form : Step2Form}
      </Drawer>
    </>
  );
} 