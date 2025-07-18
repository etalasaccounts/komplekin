"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Edit, ClipboardList, FileText, RefreshCw, X, Check, Trash2, UserPlus } from "lucide-react";
import Modal from "../../components/Modal";
import { PreviewImage } from "../../components/PreviewImage";
import TolakPendaftaranModal from './TolakPendaftaranModal'; // Import komponen
import HapusWargaModal from './HapusWargaModal'; // Import HapusWargaModal
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SingleDatePicker } from "@/components/input/singleDatePicker";
import { ChooseFile } from "@/components/input/chooseFile";

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
}

export default function WargaDetailModal({
  warga,
  open,
  onOpenChange,
  initialIsEditing = false,
}: WargaDetailModalProps) {
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [activeTab, setActiveTab] = useState("data-pribadi");
  const [showMainModal, setShowMainModal] = useState(true);
  const [isTolakModalOpen, setIsTolakModalOpen] = useState(false);
  const [isHapusModalOpen, setIsHapusModalOpen] = useState(false);
  const [isPreviewImageOpen, setIsPreviewImageOpen] = useState(false);
  const [previewData, setPreviewData] = useState<{ ktp?: string; kk?: string }>({});


  const [formData, setFormData] = useState(warga);
  const [tanggalTinggal, setTanggalTinggal] = useState<Date | undefined>();
  const [fotoKTPFile, setFotoKTPFile] = useState<File | null>(null);
  const [fotoKKFile, setFotoKKFile] = useState<File | null>(null);

  useEffect(() => {
    if (open) {
      setFormData(warga);
      setTanggalTinggal(parseDateString(warga.tanggalTinggal));
      setIsEditing(initialIsEditing);
    }
  }, [open, warga, initialIsEditing]);

  const handleEditClick = () => setIsEditing(true);
  const handleUpdate = () => {
    console.log("Updating data:", { ...formData, tanggalTinggal, fotoKTPFile, fotoKKFile });
    setIsEditing(false);
  };

  const handleTolakClick = () => {
    setIsTolakModalOpen(true);
  };

  const handleConfirmTolak = (alasan: string) => {
    console.log("Pendaftaran ditolak dengan alasan:", alasan);
    // Logika untuk menolak pendaftaran...
  };

  const handleHapus = () => {
    console.log(`Menghapus warga: ${warga.nama}`);
  };

  const footerButton = () => {
    if (activeTab !== "data-pribadi") return null;

    if (isEditing) {
      return (
        <Button className="bg-black text-white hover:bg-black/90" onClick={handleUpdate}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Perbarui Data
        </Button>
      );
    }

    if (warga.status === "Perlu Persetujuan") {
      return (
        <div className="flex justify-end w-full gap-3">
          <Button variant="outline" onClick={handleTolakClick}>
            <X className="mr-2 h-4 w-4" />
            Tolak Warga
          </Button>
          <Button className="bg-black text-white hover:bg-black/90">
            <Check className="mr-2 h-4 w-4" />
            Terima Warga
          </Button>
        </div>
      );
    }

    if (warga.status === "Pindah" || warga.status === "Ditolak") {
      return (
        <div className="flex justify-end w-full gap-3">
          <Button variant="destructive" onClick={() => setIsHapusModalOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus Data Warga
          </Button>
          <Button className="bg-black text-white hover:bg-black/90">
            <UserPlus className="mr-2 h-4 w-4" />
            Berikan Akses Kembali
          </Button>
        </div>
      );
    }
    
    return (
      <Button className="bg-black text-white hover:bg-black/90" onClick={handleEditClick}>
        <Edit className="mr-2 h-4 w-4" />
        Edit Data Warga
      </Button>
    );
  };

  const handleImageClick = (type: 'ktp' | 'kk') => {
    setPreviewData(type === 'ktp' ? { ktp: warga.fotoKTP } : { kk: warga.fotoKK });
    setShowMainModal(false);
    setIsPreviewImageOpen(true);
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Left Column */}
                <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="nama">Nama Lengkap *</Label>
                      <Input id="nama" value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="hp">Nomor HP Aktif *</Label>
                      <Input id="hp" value={formData.kontak} onChange={(e) => setFormData({...formData, kontak: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="alamat">Alamat Rumah</Label>
                      <Input id="alamat" value={formData.alamat} onChange={(e) => setFormData({...formData, alamat: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="tipe-rumah">Tipe Rumah *</Label>
                      <Input id="tipe-rumah" value={formData.tipeRumah} onChange={(e) => setFormData({...formData, tipeRumah: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="status-kepemilikan">Status Kepemilikan</Label>
                      <Select value={formData.statusKepemilikan} onValueChange={(value) => setFormData({...formData, statusKepemilikan: value})}>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sewa">Sewa</SelectItem>
                          <SelectItem value="Milik Sendiri">Milik Sendiri</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {/* Right Column */}
                  <div className="space-y-4">
                     <div className="grid gap-2">
                        <Label htmlFor="foto-ktp">Foto KTP</Label>
                        <ChooseFile id="foto-ktp" value={fotoKTPFile} onChange={setFotoKTPFile} placeholder={formData.fotoKTP ? "Ganti file..." : "Pilih file..."} />
                     </div>
                     <div className="grid gap-2">
                        <Label htmlFor="foto-kk">Foto Kartu Keluarga</Label>
                        <ChooseFile id="foto-kk" value={fotoKKFile} onChange={setFotoKKFile} placeholder={formData.fotoKK ? "Ganti file..." : "Pilih file..."} />
                     </div>
                     <div className="grid gap-2">
                        <Label htmlFor="hp-darurat">Nomor HP Darurat</Label>
                        <Input id="hp-darurat" value={formData.kontakDarurat} onChange={(e) => setFormData({...formData, kontakDarurat: e.target.value})} />
                     </div>
                     <div className="grid gap-2">
                        <Label htmlFor="kepala-keluarga">Nama Kepala Keluarga</Label>
                        <Input id="kepala-keluarga" value={formData.kepalaKeluarga} onChange={(e) => setFormData({...formData, kepalaKeluarga: e.target.value})} />
                     </div>
                     <div className="grid gap-2">
                        <Label htmlFor="pekerjaan">Pekerjaan</Label>
                        <Input id="pekerjaan" value={formData.pekerjaan} onChange={(e) => setFormData({...formData, pekerjaan: e.target.value})} />
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
                        <div className="w-full max-w-[100px] cursor-pointer hover:opacity-80 transition-opacity" onClick={() => handleImageClick('ktp')}>
                          <Image src={warga.fotoKTP} alt="Foto KTP" width={300} height={190} className="rounded-lg border object-cover w-full" />
                        </div>
                      ) : <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-32 flex items-center justify-center bg-gray-50 w-full max-w-sm"><p className="text-gray-400 text-sm">KTP Image Placeholder</p></div>}
                  </div>
                  <div>
                      <p className="text-sm text-gray-500 mb-2">Foto KK</p>
                      {warga.fotoKK ? (
                        <div className="w-full max-w-[100px] cursor-pointer hover:opacity-80 transition-opacity" onClick={() => handleImageClick('kk')}>
                          <Image src={warga.fotoKK} alt="Foto KK" width={300} height={190} className="rounded-lg border object-cover w-full" />
                        </div>
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