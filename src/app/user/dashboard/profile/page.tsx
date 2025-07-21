"use client";

import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RefreshCw, X, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
export default function ProfilePage() {
  const router = useRouter();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    namaLengkap: "Mathew Alexander",
    nomorHP: "089534924330",
    email: "mathewa@gmail.com",
    alamatRumah: "Komplek Mahata Margonda No12 Blok A",
    tipeRumah: "Tipe 24 B",
    statusKepemilikan: "Sewa",
  });

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      console.log("Uploading file:", selectedFile);
      // Handle file upload logic here
      setUploadModalOpen(false);
      setSelectedFile(null);
      // Clean up preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }
  };

  const handleModalClose = () => {
    setUploadModalOpen(false);
    setSelectedFile(null);
    // Clean up preview URL when modal closes
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Content */}
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Page Header */}
        <div className="">
          <div className="flex items-start space-x-3 mb-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold">Setting Profile</h2>
              <p className="text-xs text-gray-600">
                Kelola informasi pribadimu yang lebih mudah
              </p>
            </div>
          </div>
        </div>

        {/* Profile Avatar Section */}
        <div className="py-4">
          <div className="flex items-center space-y-4 space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xl font-semibold text-gray-600">
              MA
            </div>

            <Button
              variant="secondary"
              size="sm"
              className="text-xs"
              onClick={() => setUploadModalOpen(true)}
            >
              Upload Foto
            </Button>
          </div>
          <div className="flex-1">
            <div className="flex flex-col">
              <div className="flex items-center space-x-2 mt-1">
                <h3 className="text-base">Mathew Alexander</h3>

                <Badge className="text-[8px] text-[#1F7EAD] bg-[#D5F1FF] rounded-full">
                  Warga Baru
                </Badge>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                Terdaftar Sejak Juni 2025
              </p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="py-4 space-y-6">
          {/* Informasi Pribadi */}
          <div>
            <h3 className="font-medium text-base mb-4">Informasi Pribadi</h3>

            <div className="space-y-4">
              {/* Nama Lengkap */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Nama Lengkap *</Label>
                <Input
                  value={profileData.namaLengkap}
                  onChange={(e) =>
                    handleInputChange("namaLengkap", e.target.value)
                  }
                  className="w-full text-sm"
                />
              </div>

              {/* Nomor HP */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Nomor HP Aktif *</Label>
                <Input
                  value={profileData.nomorHP}
                  onChange={(e) => handleInputChange("nomorHP", e.target.value)}
                  className="w-full text-sm"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Email *</Label>
                <Input
                  value={profileData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full text-sm"
                />
              </div>
            </div>
          </div>

          {/* Informasi Domisili */}
          <div>
            <h3 className="font-medium text-base mb-4">Informasi Domisili</h3>

            <div className="space-y-4">
              {/* Alamat Rumah */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Alamat Rumah</Label>
                <Input
                  value={profileData.alamatRumah}
                  onChange={(e) =>
                    handleInputChange("alamatRumah", e.target.value)
                  }
                  className="w-full text-sm"
                />
              </div>

              {/* Tipe Rumah */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tipe Rumah</Label>
                <Input
                  value={profileData.tipeRumah}
                  onChange={(e) =>
                    handleInputChange("tipeRumah", e.target.value)
                  }
                  className="w-full text-sm"
                />
              </div>

              {/* Status Kepemilikan */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Status Kepemilikan
                </Label>
                <Select
                  value={profileData.statusKepemilikan}
                  onValueChange={(value) =>
                    handleInputChange("statusKepemilikan", value)
                  }
                >
                  <SelectTrigger className="w-full text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sewa">Sewa</SelectItem>
                    <SelectItem value="Milik Sendiri">Milik Sendiri</SelectItem>
                    <SelectItem value="Kontrak">Kontrak</SelectItem>
                    <SelectItem value="Kos">Kos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-6">
            <Button
              className="w-full bg-black text-white hover:bg-black/90 flex items-center justify-center space-x-2"
              onClick={() => {
                console.log("Saving profile changes:", profileData);
              }}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="max-w-xs" showCloseButton={false}>
          <DialogHeader className="flex flex-row items-center justify-between p-0">
            <DialogTitle className="text-lg font-semibold">
              Unggah Dokumen
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0 rounded-md bg-red-100 hover:bg-red-200"
              onClick={handleModalClose}
            >
              <X className="h-4 w-4 text-red-600" />
            </Button>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
              <div className="text-center">
                {previewUrl ? (
                  // Show image preview
                  <div className="space-y-2">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      width={100}
                      height={100}
                      className="w-full h-32 object-cover rounded-lg mx-auto"
                    />
                    <p className="text-sm text-gray-600">
                      {selectedFile?.name}
                    </p>
                  </div>
                ) : (
                  // Show upload placeholder
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                    <p className="text-xs text-gray-600 mb-2">
                      Jelajahi dan pilih file yang ingin Anda unggah dari
                      komputer Anda
                    </p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
              </div>
            </div>

            {/* Upload Button */}
            <Button
              variant="outline"
              className="w-full bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100 flex items-center justify-center space-x-2"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <Upload className="w-4 h-4" />
              <span>{selectedFile ? "Ganti Gambar" : "Unggah Gambar"}</span>
            </Button>

            {/* Upload Confirmation Button */}
            {selectedFile && (
              <Button
                className="w-full bg-black text-white hover:bg-black/90"
                onClick={handleUpload}
              >
                Upload File
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
