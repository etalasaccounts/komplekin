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

interface WargaCreationData {
  fullname: string;
  email: string;
  temporaryPassword: string;
  magicLink: string | null;
  cluster?: string;
  roleInfo?: {
    title: string;
  };
}

interface AddWargaDrawerProps {
  refetch?: () => void;
}

export default function AddWargaDrawer({ refetch }: AddWargaDrawerProps) {
  const [step, setStep] = useState(1);
  const [tanggalTinggal, setTanggalTinggal] = useState<Date | undefined>();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // File upload states
  const [fotoKTP, setFotoKTP] = useState<File | null>(null);
  const [fotoKK, setFotoKK] = useState<File | null>(null);
  


  // Get cluster info from admin
  const { clusterId, clusterName, loading: clusterLoading } = useAuth();

  // Helper function untuk handle email failure dengan WhatsApp fallback
  const handleEmailFailureWithWhatsApp = (wargaData: WargaCreationData, whatsappMessage: string) => {
    toast.warning(`Warga ${wargaData.fullname} berhasil dibuat!

Email gagal dikirim
Password: ${wargaData.temporaryPassword}

Klik untuk copy pesan WhatsApp`, {
      style: {
        background: '#fed7aa',
        color: '#9a3412',
        border: '1px solid #fb923c'
      },
      duration: 15000,
      action: {
        label: 'Copy WhatsApp',
        onClick: () => {
          navigator.clipboard.writeText(whatsappMessage);
          toast.success('Pesan WhatsApp disalin! Paste ke chat warga', { duration: 3000 });
        }
      }
    });
  };

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
        // Kirim email undangan otomatis
        try {
          const emailResponse = await fetch('/api/send-email/resend-invitation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userName: result.data.fullname,
              email: result.data.email,
              temporaryPassword: result.data.temporaryPassword,
              magicLink: result.data.magicLink,
              clusterName: clusterName || 'Komplek Anda',
              role: result.data.roleInfo?.title || 'Warga'
            }),
          });

          const emailResult = await emailResponse.json();
          console.log('Email API response:', emailResult);
          
          if (emailResult.success) {
            if (emailResult.development) {
              // Development mode - email disimulasikan dengan opsi WhatsApp
              toast.success(`Warga ${result.data?.fullname} berhasil dibuat!

Mode Development: Email disimulasikan
Password: ${result.data?.temporaryPassword}

Klik untuk copy pesan WhatsApp`, {
                style: {
                  background: '#dbeafe',
                  color: '#1e40af',
                  border: '1px solid #60a5fa'
                },
                duration: 15000,
                action: {
                  label: 'Copy WhatsApp',
                  onClick: () => {
                    navigator.clipboard.writeText(emailResult.whatsappMessage);
                    toast.success('Pesan WhatsApp disalin!', { duration: 3000 });
                  }
                }
              });
            } else {
              // Email berhasil dikirim
              const isTestMode = emailResult.isTestEmail;
              const actualEmail = emailResult.actualEmail || result.data.email;
              
              const successMessage = isTestMode 
                ? `Warga ${result.data.fullname} berhasil dibuat!

MODE TEST: Email dikirim ke ${actualEmail}
(Email asli warga: ${result.data.email})
Password sementara ada di email test`
                : `Warga ${result.data.fullname} berhasil dibuat!

Email undangan telah dikirim ke ${result.data.email}
Password sementara akan diterima via email
Mohon periksa inbox dan folder spam`;

              toast.success(successMessage, {
                style: {
                  background: isTestMode ? '#3b82f6' : '#22c55e',
                  color: 'white',
                  border: 'none'
                },
                duration: 10000,
                action: {
                  label: 'Copy WhatsApp',
                  onClick: () => {
                    navigator.clipboard.writeText(emailResult.whatsappMessage);
                    toast.success('Pesan WhatsApp disalin sebagai backup!', { duration: 3000 });
                  }
                }
              });
            }
          } else {
            // Email gagal, tapi warga sudah dibuat - fallback ke WhatsApp
            console.error('Email failed:', emailResult);
            handleEmailFailureWithWhatsApp(result.data, emailResult.whatsappMessage || 'WhatsApp message not available');
          }
        } catch (emailError) {
          // Error saat kirim email - fallback ke WhatsApp dengan generic message
          console.error('Email service error:', emailError);
          const fallbackMessage = `
*Selamat Datang di KomplekIn!*

Halo *${result.data.fullname}*, akun KomplekIn Anda telah dibuat.

*Detail Akun:*
- Email: ${result.data.email}
- Password Sementara: *${result.data.temporaryPassword}*

*Link Verifikasi:*
${result.data.magicLink || 'Tidak tersedia'}

Silakan gunakan kredensial di atas untuk login.
          `.trim();
          
          handleEmailFailureWithWhatsApp(result.data, fallbackMessage);
        }
        
        // Refresh data untuk menampilkan data terbaru tanpa reload halaman
        if (refetch) {
          setTimeout(() => {
            refetch();
          }, 500);
        }
        
        // Close drawer immediately
        handleOpenChange(false);
            } else {
        toast.error(`${result.error || 'Gagal membuat warga'}`, {
          style: {
            background: '#ef4444',
            color: 'white',
            border: 'none'
          },
          duration: 5000
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan tidak terduga';
      console.error('Warga creation error:', err);
      toast.error(`${errorMessage}`, {
        style: {
          background: '#ef4444',
          color: 'white',
          border: 'none'
        },
        duration: 5000
      });
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
        <p className="text-xs text-gray-500">
          Semua status warga akan diarahkan ke halaman verifikasi yang sama
        </p>
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