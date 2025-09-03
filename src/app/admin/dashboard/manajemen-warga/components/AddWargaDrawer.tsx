"use client";

import React, { useState } from "react";

import Drawer from "../../components/Drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


import { Plus, Send, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { wargaMagicService, CreateWargaMagicData } from "@/services/wargaMagic";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface WargaCreationData {
  fullname: string;
  email: string;
  temporaryPassword: string;
  cluster?: string;
  roleInfo?: {
    title: string;
  };
}

interface AddWargaDrawerProps {
  refetch?: () => void;
}

export default function AddWargaDrawer({ refetch }: AddWargaDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // File upload states - dihapus karena field KTP dan KK dihapus
  // const [fotoKTP, setFotoKTP] = useState<File | null>(null);
  // const [fotoKK, setFotoKK] = useState<File | null>(null);
  


  // Get cluster info from admin
  const { clusterId, clusterName, loading: clusterLoading } = useAuth();

  // Helper function untuk handle email failure
  const handleEmailFailure = (wargaData: WargaCreationData) => {
    toast.warning(`Warga ${wargaData.fullname} berhasil ditambahkan, tapi email tidak terkirim`, {
      style: {
        background: '#f59e0b',
        color: 'white',
        border: 'none'
      },
      duration: 6000,
    });
  };

  // Form data state (simplified for MVP)
  const [formData, setFormData] = useState<Partial<CreateWargaMagicData>>({
    email: '',
    fullname: '',
    role: 'user', // Default role
    houseNumber: '',
    ownershipStatus: 'milik-sendiri'
  });

  // Reset form and state when drawer opens/closes
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset form when closed
      setFormData({
        email: '',
        fullname: '',
        role: 'user',
        houseNumber: '',
        ownershipStatus: 'milik-sendiri'
      });
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
      houseNumber: formData.houseNumber || '',
      ownershipStatus: formData.ownershipStatus || 'milik-sendiri'
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
              clusterName: clusterName || 'Komplek Anda',
              role: result.data.roleInfo?.title || 'Warga'
            }),
          });

          const emailResult = await emailResponse.json();

          
          if (emailResult.success) {
            // Email berhasil dikirim - toast sukses sederhana
            toast.success(`Warga ${result.data.fullname} berhasil ditambahkan!`, {
              style: {
                background: '#22c55e',
                color: 'white',
                border: 'none'
              },
              duration: 5000,
            });
          } else {
            // Email gagal, tapi warga sudah dibuat
            console.error('Email failed:', emailResult);
            handleEmailFailure(result.data);
          }
        } catch (emailError) {
          // Error saat kirim email
          console.error('Email service error:', emailError);
          handleEmailFailure(result.data);
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
        <Label htmlFor="nomor-rumah">Nomor Rumah *</Label>
        <Input 
          id="nomor-rumah" 
          placeholder="42 B"
          value={formData.houseNumber}
          onChange={(e) => setFormData({...formData, houseNumber: e.target.value})}
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



  const footerContent = (
    <div className="flex justify-end">
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
    </div>
  );

  return (
    <>
      <Drawer
        trigger={triggerButton}
        title="Form Pendaftaran Warga baru"
        description="Isi data warga baru untuk menambahkan mereka ke dalam sistem."
        footer={footerContent}
        open={isOpen}
        onOpenChange={handleOpenChange}
      >
        {Step1Form}
      </Drawer>
    </>
  );
} 