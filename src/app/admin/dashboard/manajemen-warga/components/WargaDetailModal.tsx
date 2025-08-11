"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Edit, ClipboardList, FileText, RefreshCw, X, Check, Trash2, UserPlus, Upload, Eye } from "lucide-react";
import Modal from "../../components/Modal";
import { PreviewImage } from "../../components/PreviewImage";
import TolakPendaftaranModal from './TolakPendaftaranModal'; // Import komponen
import HapusWargaModal from './HapusWargaModal'; // Import HapusWargaModal
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SingleDatePicker } from "@/components/input/singleDatePicker";
import { ChooseFile } from "@/components/input/chooseFile";
import { useWargaActions } from "@/hooks/useWarga";
import { toast } from "sonner";
import { validateFileForUpload, urlToFile } from "@/lib/utils";

const parseDateString = (dateString: string): Date | undefined => {
  const parts = dateString.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const year = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    // Check if the created date is valid
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  return undefined;
};

export interface WargaData {
  id?: number; // Sequential number for display purposes
  originalId?: string; // Original UUID from database for operations
  profileId?: string; // Add profileId for profile updates
  nama: string;
  role: string;
  kontak: string;
  email: string;
  alamat: string;
  tipeRumah: string;
  statusKepemilikan: string;
  kepalaKeluarga: string;
  kontakDarurat: string;
  pekerjaan: string;
  tanggalTinggal: string;
  fotoKTP?: string;
  fotoKK?: string;
  status: "Perlu Persetujuan" | "Ditolak" | "Aktif" | "Pindah" | "Warga Baru";
  tanggalDaftar?: string; // Tambahkan tanggalDaftar
}

interface WargaDetailModalProps {
  warga: WargaData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialIsEditing?: boolean;
  refetch?: () => void;
}

export default function WargaDetailModal({
  warga,
  open,
  onOpenChange,
  initialIsEditing = false,
  refetch,
}: WargaDetailModalProps) {
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [activeTab, setActiveTab] = useState("data-pribadi");
  const [showMainModal, setShowMainModal] = useState(true);
  const [isTolakModalOpen, setIsTolakModalOpen] = useState(false);
  const [isHapusModalOpen, setIsHapusModalOpen] = useState(false);
  const [isPreviewImageOpen, setIsPreviewImageOpen] = useState(false);
  const [previewData, setPreviewData] = useState<{ ktp?: string; kk?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Database actions
  const { updateStatus, updateCitizenStatus, deleteWarga, updateProfile } = useWargaActions();

  // Helper function to ensure all form fields have valid default values
  const getDefaultFormData = (wargaData: WargaData) => ({
    id: wargaData.id || 0,
    originalId: wargaData.originalId || '',
    profileId: wargaData.profileId || '',
    nama: wargaData.nama || '',
    role: wargaData.role || '',
    kontak: wargaData.kontak || '',
    email: wargaData.email || '',
    alamat: wargaData.alamat || '',
    tipeRumah: wargaData.tipeRumah || '',
    statusKepemilikan: wargaData.statusKepemilikan || 'Milik Sendiri',
    kepalaKeluarga: wargaData.kepalaKeluarga || '',
    kontakDarurat: wargaData.kontakDarurat || '',
    pekerjaan: wargaData.pekerjaan || '',
    tanggalTinggal: wargaData.tanggalTinggal || '',
    fotoKTP: wargaData.fotoKTP || '',
    fotoKK: wargaData.fotoKK || '',
    status: wargaData.status || 'Perlu Persetujuan',
    tanggalDaftar: wargaData.tanggalDaftar || '',
  });

  const [formData, setFormData] = useState(() => getDefaultFormData(warga));
  const [tanggalTinggal, setTanggalTinggal] = useState<Date | undefined>();
  const [fotoKTPFile, setFotoKTPFile] = useState<File | null>(null);
  const [fotoKKFile, setFotoKKFile] = useState<File | null>(null);
  const [isUploadingKTP, setIsUploadingKTP] = useState(false);
  const [isUploadingKK, setIsUploadingKK] = useState(false);

  // Ensure formData is always controlled by providing fallback values
  const safeFormData = {
    nama: formData.nama || '',
    kontak: formData.kontak || '',
    email: formData.email || '',
    alamat: formData.alamat || '',
    tipeRumah: formData.tipeRumah || '',
    statusKepemilikan: formData.statusKepemilikan || 'Milik Sendiri',
    kepalaKeluarga: formData.kepalaKeluarga || '',
    kontakDarurat: formData.kontakDarurat || '',
    pekerjaan: formData.pekerjaan || '',
  };

  // File upload functions
  const uploadFile = async (file: File, documentType: 'ktp' | 'kartu_keluarga'): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    formData.append('originalFilename', file.name);

    const response = await fetch('/api/admin/upload-document', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload gagal');
    }

    const result = await response.json();
    return result.url;
  };

  const handleKTPFileChange = async (file: File | null) => {
    if (!file) {
      setFotoKTPFile(null);
      return;
    }

    // Validate file
    const validation = validateFileForUpload(file);
    if (!validation.isValid) {
      toast.error(validation.error || 'File KTP tidak valid');
      return;
    }

    setIsUploadingKTP(true);
    try {
      const uploadedUrl = await uploadFile(file, 'ktp');
      setFotoKTPFile(file);
      setFormData(prev => ({ ...prev, fotoKTP: uploadedUrl }));
      toast.success('Foto KTP berhasil diupload');
    } catch (error) {
      console.error('Error uploading KTP:', error);
      toast.error('Gagal upload foto KTP');
    } finally {
      setIsUploadingKTP(false);
    }
  };

  const handleKKFileChange = async (file: File | null) => {
    if (!file) {
      setFotoKKFile(null);
      return;
    }

    // Validate file
    const validation = validateFileForUpload(file);
    if (!validation.isValid) {
      toast.error(validation.error || 'File KK tidak valid');
      return;
    }

    setIsUploadingKK(true);
    try {
      const uploadedUrl = await uploadFile(file, 'kartu_keluarga');
      setFotoKKFile(file);
      setFormData(prev => ({ ...prev, fotoKK: uploadedUrl }));
      toast.success('Foto KK berhasil diupload');
    } catch (error) {
      console.error('Error uploading KK:', error);
      toast.error('Gagal upload foto KK');
    } finally {
      setIsUploadingKK(false);
    }
  };

  // Handle preview file
  const handleViewFile = (fileOrUrl: File | string) => {
    let imageUrl: string;
    
    if (fileOrUrl instanceof File) {
      imageUrl = URL.createObjectURL(fileOrUrl);
    } else {
      imageUrl = fileOrUrl;
    }
    
    // Determine which type of document this is based on the file object
    if (fotoKTPFile && fileOrUrl === fotoKTPFile) {
      setPreviewData({ ktp: imageUrl });
    } else if (fotoKKFile && fileOrUrl === fotoKKFile) {
      setPreviewData({ kk: imageUrl });
    } else {
      // Fallback: check URL content
      if (imageUrl.includes('ktp')) {
        setPreviewData({ ktp: imageUrl });
      } else {
        setPreviewData({ kk: imageUrl });
      }
    }
    
    setShowMainModal(false);
    setIsPreviewImageOpen(true);
  };

  useEffect(() => {
    if (open) {
      setFormData(getDefaultFormData(warga));
      setTanggalTinggal(parseDateString(warga.tanggalTinggal));
      setIsEditing(initialIsEditing);
      
      // Load existing files from URLs
      const loadExistingFiles = async () => {
        try {
          // Load KTP file if exists
          if (warga.fotoKTP && warga.fotoKTP.startsWith('http')) {
            const ktpFile = await urlToFile(warga.fotoKTP, 'ktp.jpg');
            setFotoKTPFile(ktpFile);
          }
          
          // Load KK file if exists
          if (warga.fotoKK && warga.fotoKK.startsWith('http')) {
            const kkFile = await urlToFile(warga.fotoKK, 'kk.jpg');
            setFotoKKFile(kkFile);
          }
        } catch (error) {
          console.error('Error loading existing files:', error);
          // If conversion fails, keep the files as null
          setFotoKTPFile(null);
          setFotoKKFile(null);
        }
      };

      loadExistingFiles();
    }
  }, [open, warga, initialIsEditing]);

  // Reset form when switching between edit and view modes
  useEffect(() => {
    if (isEditing) {
      setFormData(getDefaultFormData(warga));
      setTanggalTinggal(parseDateString(warga.tanggalTinggal));
    }
  }, [isEditing, warga]);

  // Reset file states when modal closes
  useEffect(() => {
    if (!open) {
      setFotoKTPFile(null);
      setFotoKKFile(null);
    }
  }, [open]);

  const handleEditClick = () => setIsEditing(true);
  
  const handleUpdate = async () => {
    if (!warga.profileId) {
      toast.error('Profile ID tidak ditemukan');
      console.error('Missing profileId:', warga.profileId);
      return;
    }

    // Convert and validate profile ID
    const profileId = String(warga.profileId);
    if (!profileId || profileId.trim() === '' || profileId === 'undefined' || profileId === 'null') {
      toast.error('Format Profile ID tidak valid');
      console.error('Invalid profileId format:', warga.profileId);
      return;
    }

    setIsLoading(true);
    try {
      // Prepare updated profile data using safeFormData
      const profileData = {
        fullname: safeFormData.nama.trim(),
        email: safeFormData.email.trim(),
        no_telp: safeFormData.kontak.trim(),
        address: safeFormData.alamat.trim(),
        house_type: safeFormData.tipeRumah.trim(),
        ownership_status: safeFormData.statusKepemilikan,
        head_of_family: safeFormData.kepalaKeluarga.trim(),
        emergency_telp: safeFormData.kontakDarurat.trim(),
        work: safeFormData.pekerjaan.trim(),
        moving_date: tanggalTinggal ? tanggalTinggal.toISOString().split('T')[0] : formData.tanggalTinggal,
        // Add photo URLs if they were uploaded
        file_ktp: formData.fotoKTP,
        file_kk: formData.fotoKK,
      };

      console.log("Updating profile with ID:", profileId, "Data:", profileData);

      // Update profile in database
      await updateProfile(profileId, profileData);
      
      onOpenChange(false);
      toast.success('Data warga berhasil diperbarui');
      setIsEditing(false);
      setFotoKTPFile(null);
      setFotoKKFile(null);

      
      // Refresh data to show updated information
      if (refetch) {
        setTimeout(() => {
          refetch();
        }, 500);
      }
      
    } catch (error) {
      console.error('Error updating warga:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('22P02')) {
          toast.error('Format data tidak valid. Periksa data yang diinput.');
        } else if (error.message.includes('23505')) {
          toast.error('Email atau data sudah digunakan oleh warga lain.');
        } else {
          toast.error(`Gagal memperbarui data: ${error.message}`);
        }
      } else {
        toast.error('Gagal memperbarui data warga');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTolakClick = () => {
    setIsTolakModalOpen(true);
  };

  const handleConfirmTolak = async (alasan: string) => {
    if (!warga.originalId) {
      toast.error('ID warga tidak ditemukan');
      console.error('Missing warga originalId:', warga.originalId);
      return;
    }

    // Validate UUID format
    if (typeof warga.originalId !== 'string' || warga.originalId.trim() === '') {
      toast.error('Format ID tidak valid');
      console.error('Invalid originalId format:', warga.originalId);
      return;
    }

    setIsLoading(true);
    try {
      console.log('Rejecting warga with originalId:', warga.originalId, 'Reason:', alasan);
      await updateStatus(warga.originalId, 'Inactive');
      toast.success(`Pendaftaran ${warga.nama} telah ditolak`);
      setIsTolakModalOpen(false);
      onOpenChange(false); // Close modal after action
      if (refetch) refetch(); // Refresh to update data
    } catch (error) {
      console.error('Error rejecting warga:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('22P02')) {
          toast.error('Format data tidak valid. Periksa ID warga.');
        } else {
          toast.error(`Gagal menolak pendaftaran: ${error.message}`);
        }
      } else {
        toast.error('Gagal menolak pendaftaran warga');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!warga.originalId) {
      toast.error('ID warga tidak ditemukan');
      console.error('Missing warga originalId:', warga.originalId);
      return;
    }

    // Validate UUID format
    if (typeof warga.originalId !== 'string' || warga.originalId.trim() === '') {
      toast.error('Format ID tidak valid');
      console.error('Invalid originalId format:', warga.originalId);
      return;
    }

    setIsLoading(true);
    try {
      console.log('Approving warga with originalId:', warga.originalId);
      await updateStatus(warga.originalId, 'Active');
      toast.success(`${warga.nama} telah diterima sebagai warga`);
      onOpenChange(false); // Close modal after action
      if (refetch) refetch(); // Refresh to update data
    } catch (error) {
      console.error('Error approving warga:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('22P02')) {
          toast.error('Format data tidak valid. Periksa ID warga.');
        } else {
          toast.error(`Gagal menerima warga: ${error.message}`);
        }
      } else {
        toast.error('Gagal menerima warga');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleHapus = async () => {
    if (!warga.originalId) {
      toast.error('ID warga tidak ditemukan');
      console.error('Missing warga originalId:', warga.originalId);
      return;
    }

    // Validate UUID format
    if (typeof warga.originalId !== 'string' || warga.originalId.trim() === '') {
      toast.error('Format ID tidak valid');
      console.error('Invalid originalId format:', warga.originalId);
      return;
    }

    setIsLoading(true);
    try {
      console.log('Deleting warga with originalId:', warga.originalId);
      await deleteWarga(warga.originalId);
      toast.success(`Data ${warga.nama} berhasil dihapus`);
      setIsHapusModalOpen(false);
      onOpenChange(false); // Close modal after action
      if (refetch) refetch(); // Refresh to update data
    } catch (error) {
      console.error('Error deleting warga:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('22P02')) {
          toast.error('Format data tidak valid. Periksa ID warga.');
        } else if (error.message.includes('23503')) {
          toast.error('Tidak dapat menghapus karena data masih terkait dengan data lain.');
        } else {
          toast.error(`Gagal menghapus data: ${error.message}`);
        }
      } else {
        toast.error('Gagal menghapus data warga');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreAccess = async () => {
    if (!warga.originalId || !warga.profileId) {
      toast.error('ID warga atau Profile ID tidak ditemukan');
      console.error('Missing IDs:', { originalId: warga.originalId, profileId: warga.profileId });
      return;
    }

    // Validate UUID and profile ID format
    if (typeof warga.originalId !== 'string' || warga.originalId.trim() === '') {
      toast.error('Format ID warga tidak valid');
      console.error('Invalid originalId format:', warga.originalId);
      return;
    }

    const profileId = String(warga.profileId);
    if (!profileId || profileId.trim() === '' || profileId === 'undefined' || profileId === 'null') {
      toast.error('Format Profile ID tidak valid');
      console.error('Invalid profile ID format:', warga.profileId);
      return;
    }

    setIsLoading(true);
    try {
      console.log('Restoring access for:', { originalId: warga.originalId, profileId });
      
      // Update user status to Active
      await updateStatus(warga.originalId, 'Active');
      
      // Update citizen status to 'Warga baru'
      await updateCitizenStatus(profileId, 'Warga baru');
      
      toast.success(`Akses ${warga.nama} telah dipulihkan`);
      onOpenChange(false); // Close modal after action
      if (refetch) refetch(); // Refresh to update data
    } catch (error) {
      console.error('Error restoring access:', error);
      
      // More specific error handling
      if (error instanceof Error) {
        if (error.message.includes('22P02')) {
          toast.error('Format data tidak valid. Periksa ID warga.');
        } else if (error.message.includes('23503')) {
          toast.error('Data terkait tidak ditemukan di database.');
        } else {
          toast.error(`Gagal memulihkan akses: ${error.message}`);
        }
      } else {
        toast.error('Gagal memulihkan akses warga');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const footerButton = () => {
    if (activeTab !== "data-pribadi") return null;

    if (isEditing) {
      return (
        <Button 
          className="bg-black text-white hover:bg-black/90" 
          onClick={handleUpdate}
          disabled={isLoading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Memperbarui...' : 'Perbarui Data'}
        </Button>
      );
    }

    if (warga.status === "Perlu Persetujuan") {
      return (
        <div className="flex justify-end w-full gap-3">
          <Button 
            variant="outline" 
            onClick={handleTolakClick}
            disabled={isLoading}
          >
            <X className="mr-2 h-4 w-4" />
            Tolak Warga
          </Button>
          <Button 
            className="bg-black text-white hover:bg-black/90"
            onClick={handleApprove}
            disabled={isLoading}
          >
            <Check className="mr-2 h-4 w-4" />
            {isLoading ? 'Memproses...' : 'Terima Warga'}
          </Button>
        </div>
      );
    }

    if (warga.status === "Pindah" || warga.status === "Ditolak") {
      return (
        <div className="flex justify-end w-full gap-3">
          <Button 
            variant="destructive" 
            onClick={() => setIsHapusModalOpen(true)}
            disabled={isLoading}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus Data Warga
          </Button>
          <Button 
            className="bg-black text-white hover:bg-black/90"
            onClick={handleRestoreAccess}
            disabled={isLoading}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {isLoading ? 'Memproses...' : 'Berikan Akses Kembali'}
          </Button>
        </div>
      );
    }
    
    return (
      <Button 
        className="bg-black text-white hover:bg-black/90" 
        onClick={handleEditClick}
        disabled={isLoading}
      >
        <Edit className="mr-2 h-4 w-4" />
        Edit Data Warga
      </Button>
    );
  };

  const handleClosePreview = () => {
    setIsPreviewImageOpen(false);
    setShowMainModal(true);
  };

  const handleMainModalClose = () => {
    setShowMainModal(true); // Reset for next open
    onOpenChange(false);
  };

  return (
    <>
      <Modal
        title={isEditing ? "Edit Data Warga" : "Detail Warga"}
        open={open && showMainModal}
        onOpenChange={handleMainModalClose}
        footerButton={footerButton()}
      >
        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className="flex bg-white sticky top-0 z-10 px-6 gap-4">
            <Button
              variant="ghost"
              onClick={() => setActiveTab("data-pribadi")}
              className={`py-3 text-sm font-medium border-b-2 transition-colors rounded-none ${
                activeTab === "data-pribadi" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              disabled={isEditing}
            >
              <ClipboardList className="h-4 w-4 mr-2" />
                Data Pribadi Warga
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab("riwayat")}
              className={`py-3 text-sm font-medium border-b-2 transition-colors rounded-none ${
                activeTab === "riwayat" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              disabled={isEditing}
            >
              <FileText className="h-4 w-4 mr-2" />
                Riwayat Pembayaran
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "riwayat" && !isEditing && (
              <div className="space-y-8">
                {/* Payment history tables... */}
              </div>
            )}
            
            {activeTab === "data-pribadi" && (
              isEditing ? (
                // EDIT MODE
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6" key={`edit-form-${warga.id}`}>
                {/* Left Column */}
                <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="nama">Nama Lengkap *</Label>
                      <Input 
                        id="nama" 
                        value={safeFormData.nama} 
                        onChange={(e) => setFormData({...formData, nama: e.target.value})}
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="hp">Nomor HP Aktif *</Label>
                      <Input 
                        id="hp" 
                        value={safeFormData.kontak} 
                        onChange={(e) => setFormData({...formData, kontak: e.target.value})}
                        placeholder="Masukkan nomor HP"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={safeFormData.email} 
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="Masukkan email"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="alamat">Alamat Rumah</Label>
                      <Input 
                        id="alamat" 
                        value={safeFormData.alamat} 
                        onChange={(e) => setFormData({...formData, alamat: e.target.value})}
                        placeholder="Masukkan alamat rumah"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="tipe-rumah">Tipe Rumah *</Label>
                      <Input 
                        id="tipe-rumah" 
                        value={safeFormData.tipeRumah} 
                        onChange={(e) => setFormData({...formData, tipeRumah: e.target.value})}
                        placeholder="Masukkan tipe rumah"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="status-kepemilikan">Status Kepemilikan</Label>
                      <Select 
                        value={safeFormData.statusKepemilikan} 
                        onValueChange={(value) => setFormData({...formData, statusKepemilikan: value})}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih status kepemilikan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sewa">Sewa</SelectItem>
                          <SelectItem value="Milik Sendiri">Milik Sendiri</SelectItem>
                          <SelectItem value="Milik Orang Tua">Milik Orang Tua</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {/* Right Column */}
                  <div className="space-y-4">
                     <div className="grid gap-2">
                        <Label htmlFor="foto-ktp">Foto KTP</Label>
                        <ChooseFile 
                          id="foto-ktp" 
                          value={fotoKTPFile} 
                          onChange={handleKTPFileChange} 
                          placeholder={formData.fotoKTP ? "Ganti file..." : "Pilih file..."} 
                          isUploading={isUploadingKTP}
                          onView={handleViewFile}
                        />
                     </div>
                     <div className="grid gap-2">
                        <Label htmlFor="foto-kk">Foto Kartu Keluarga</Label>
                        <ChooseFile 
                          id="foto-kk" 
                          value={fotoKKFile} 
                          onChange={handleKKFileChange} 
                          placeholder={formData.fotoKK ? "Ganti file..." : "Pilih file..."} 
                          isUploading={isUploadingKK}
                          onView={handleViewFile}
                        />
                     </div>
                     <div className="grid gap-2">
                        <Label htmlFor="hp-darurat">Nomor HP Darurat</Label>
                        <Input 
                          id="hp-darurat" 
                          value={safeFormData.kontakDarurat} 
                          onChange={(e) => setFormData({...formData, kontakDarurat: e.target.value})}
                          placeholder="Masukkan nomor HP darurat"
                        />
                     </div>
                     <div className="grid gap-2">
                        <Label htmlFor="kepala-keluarga">Nama Kepala Keluarga</Label>
                        <Input 
                          id="kepala-keluarga" 
                          value={safeFormData.kepalaKeluarga} 
                          onChange={(e) => setFormData({...formData, kepalaKeluarga: e.target.value})}
                          placeholder="Masukkan nama kepala keluarga"
                        />
                     </div>
                     <div className="grid gap-2">
                        <Label htmlFor="pekerjaan">Pekerjaan</Label>
                        <Input 
                          id="pekerjaan" 
                          value={safeFormData.pekerjaan} 
                          onChange={(e) => setFormData({...formData, pekerjaan: e.target.value})}
                          placeholder="Masukkan pekerjaan"
                        />
                     </div>
                     <div className="grid gap-2 w-full">
                        <Label htmlFor="tanggal-tinggal">Tanggal Tinggal</Label>
                        <SingleDatePicker 
                            id="tanggal-tinggal" 
                            value={tanggalTinggal} 
                            onChange={setTanggalTinggal}
                            className="w-full"
                        />
                     </div>
                  </div>
                </div>
              ) : (
                // VIEW MODE
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div><p className="text-sm text-gray-500 mb-1">Nama Lengkap</p><p className="font-semibold text-lg">{warga.nama}</p></div>
                    <div><p className="text-sm text-gray-500 mb-1">Nomor HP Aktif</p><p className="font-semibold">{warga.kontak}</p></div>
                    <div><p className="text-sm text-gray-500 mb-1">Email</p><p className="font-semibold">{warga.email}</p></div>
                    <div><p className="text-sm text-gray-500 mb-1">Alamat Rumah</p><p className="font-semibold">{warga.alamat}</p></div>
                    <div><p className="text-sm text-gray-500 mb-1">Tipe Rumah</p><p className="font-semibold">{warga.tipeRumah}</p></div>
                    <div><p className="text-sm text-gray-500 mb-1">Status Kepemilikan</p><p className="font-semibold">{warga.statusKepemilikan}</p></div>
                  </div>
                  {/* Right Column */}
                  <div className="space-y-6">
                  <div>
                      <p className="text-sm text-gray-500 mb-2">Foto KTP</p>
                      {warga.fotoKTP ? (
                        <ChooseFile 
                          id="view-ktp" 
                          value={fotoKTPFile} 
                          onChange={() => {}} 
                          placeholder="Foto KTP tersedia" 
                          viewOnly={true}
                          onView={handleViewFile}
                        />
                      ) : <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-32 flex items-center justify-center bg-gray-50 w-full max-w-sm"><p className="text-gray-400 text-sm">KTP Image Placeholder</p></div>}
                  </div>
                  <div>
                      <p className="text-sm text-gray-500 mb-2">Foto KK</p>
                      {warga.fotoKK ? (
                        <ChooseFile 
                          id="view-kk" 
                          value={fotoKKFile} 
                          onChange={() => {}} 
                          placeholder="Foto KK tersedia" 
                          viewOnly={true}
                          onView={handleViewFile}
                        />
                      ) : <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-32 flex items-center justify-center bg-gray-50 w-full max-w-sm"><p className="text-gray-400 text-sm">KK Image Placeholder</p></div>}
                  </div>
                    <div><p className="text-sm text-gray-500 mb-1">Nama Kepala Keluarga</p><p className="font-semibold">{warga.kepalaKeluarga}</p></div>
                    <div><p className="text-sm text-gray-500 mb-1">Nomor Darurat</p><p className="font-semibold">{warga.kontakDarurat}</p></div>
                    <div><p className="text-sm text-gray-500 mb-1">Pekerjaan</p><p className="font-semibold">{warga.pekerjaan}</p></div>
                    <div><p className="text-sm text-gray-500 mb-1">Tanggal Tinggal</p><p className="font-semibold">{warga.tanggalTinggal}</p></div>
                  </div>
                </div>
              )
            )}

            {activeTab === "riwayat" && (
              <div className="space-y-8">
                {/* Table Tahun 2025 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-start gap-3">
                    <h3 className="text-lg font-semibold">Table Pembayaran Iuran</h3>
                    <span className="text-xs font-semibold text-foreground rounded-full border border-border px-2 py-1">
                      Tahun 2025
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr>
                          <th className="px-2 py-2 text-center text-sm font-medium text-gray-600">Jan</th>
                          <th className="px-2 py-2 text-center text-sm font-medium text-gray-600">Feb</th>
                          <th className="px-2 py-2 text-center text-sm font-medium text-gray-600">Mar</th>
                          <th className="px-2 py-2 text-center text-sm font-medium text-gray-600">Apr</th>
                          <th className="px-2 py-2 text-center text-sm font-medium text-gray-600">Mei</th>
                          <th className="px-2 py-2 text-center text-sm font-medium text-gray-600">Jun</th>
                          <th className="px-2 py-2 text-center text-sm font-medium text-gray-600">Jul</th>
                          <th className="px-2 py-2 text-center text-sm font-medium text-gray-600">Agst</th>
                          <th className="px-2 py-2 text-center text-sm font-medium text-gray-600">Sept</th>
                          <th className="px-2 py-2 text-center text-sm font-medium text-gray-600">Okt</th>
                          <th className="px-2 py-2 text-center text-sm font-medium text-gray-600">Nov</th>
                          <th className="px-2 py-2 text-center text-sm font-medium text-gray-600">Des</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="px-2 py-4 text-center text-sm">Lunas</td>
                          <td className="px-2 py-4 text-center text-sm">Lunas</td>
                          <td className="px-2 py-4 text-center text-sm">Lunas</td>
                          <td className="px-2 py-4 text-center text-sm">Lunas</td>
                          <td className="px-2 py-4 text-center text-sm">Lunas</td>
                          <td className="px-2 py-4 text-center text-sm">Lunas</td>
                          <td className="px-2 py-4 text-center text-sm">Belum Bayar</td>
                          <td className="px-2 py-4 text-center text-sm text-gray-400">-</td>
                          <td className="px-2 py-4 text-center text-sm text-gray-400">-</td>
                          <td className="px-2 py-4 text-center text-sm text-gray-400">-</td>
                          <td className="px-2 py-4 text-center text-sm text-gray-400">-</td>
                          <td className="px-2 py-4 text-center text-sm text-gray-400">-</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  </div>
                  
                {/* Table Tahun 2024 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-start gap-3">
                    <h3 className="text-lg font-semibold">Table Pembayaran Iuran</h3>
                    <span className="text-xs font-semibold text-foreground rounded-full border border-border px-2 py-1">
                      Tahun 2024
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr>
                          <th className="px-2 py-2 text-center text-sm font-medium text-gray-600">Jan</th>
                          <th className="px-2 py-2 text-center text-sm font-medium text-gray-600">Feb</th>
                          <th className="px-2 py-2 text-center text-sm font-medium text-gray-600">Mar</th>
                          <th className="px-2 py-2 text-center text-sm font-medium text-gray-600">Apr</th>
                          <th className="px-2 py-2 text-center text-sm font-medium text-gray-600">Mei</th>
                          <th className="px-2 py-2 text-center text-sm font-medium text-gray-600">Jun</th>
                          <th className="px-2 py-2 text-center text-sm font-medium text-gray-600">Jul</th>
                          <th className="px-2 py-2 text-center text-sm font-medium text-gray-600">Agst</th>
                          <th className="px-2 py-2 text-center text-sm font-medium text-gray-600">Sept</th>
                          <th className="px-2 py-2 text-center text-sm font-medium text-gray-600">Okt</th>
                          <th className="px-2 py-2 text-center text-sm font-medium text-gray-600">Nov</th>
                          <th className="px-2 py-2 text-center text-sm font-medium text-gray-600">Des</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="px-2 py-4 text-center text-sm">Lunas</td>
                          <td className="px-2 py-4 text-center text-sm">Lunas</td>
                          <td className="px-2 py-4 text-center text-sm">Lunas</td>
                          <td className="px-2 py-4 text-center text-sm">Lunas</td>
                          <td className="px-2 py-4 text-center text-sm">Lunas</td>
                          <td className="px-2 py-4 text-center text-sm">Lunas</td>
                          <td className="px-2 py-4 text-center text-sm">Lunas</td>
                          <td className="px-2 py-4 text-center text-sm">Lunas</td>
                          <td className="px-2 py-4 text-center text-sm">Lunas</td>
                          <td className="px-2 py-4 text-center text-sm">Lunas</td>
                          <td className="px-2 py-4 text-center text-sm">Lunas</td>
                          <td className="px-2 py-4 text-center text-sm">Lunas</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
              </div>
        </div>
      </Modal>

      <PreviewImage
        open={isPreviewImageOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            handleClosePreview();
          }
        }}
        title={`Pratinjau Dokumen`}
        ktpSrc={previewData.ktp}
        kkSrc={previewData.kk}
      />

      <TolakPendaftaranModal 
        open={isTolakModalOpen}
        onOpenChange={setIsTolakModalOpen}
        onConfirm={handleConfirmTolak}
      />

      <HapusWargaModal
        open={isHapusModalOpen}
        onOpenChange={setIsHapusModalOpen}
        onConfirm={handleHapus}
      />
    </>
  );
} 