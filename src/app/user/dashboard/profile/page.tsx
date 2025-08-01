"use client";

import { useState, useEffect } from "react";
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
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const { profile, loading, error, updateProfile, updating } = useProfile();

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    namaLengkap: "",
    nomorHP: "",
    email: "",
    alamatRumah: "",
    tipeRumah: "",
    statusKepemilikan: "",
  });

  // Update profileData when profile is loaded
  useEffect(() => {
    if (profile) {
      setProfileData({
        namaLengkap: profile.fullname || "",
        nomorHP: profile.no_telp || "",
        email: profile.email || "",
        alamatRumah: profile.address || "",
        tipeRumah: profile.house_type || "",
        statusKepemilikan: profile.ownership_status || "",
      });
    }
  }, [profile]);

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

  const handleUpload = async () => {
    if (selectedFile) {
      try {
        const formData = new FormData();
        formData.append("photo", selectedFile);

        // Add current profile data to maintain other fields
        formData.append("fullname", profileData.namaLengkap);
        formData.append("no_telp", profileData.nomorHP);
        formData.append("email", profileData.email);
        formData.append("address", profileData.alamatRumah);
        formData.append("house_type", profileData.tipeRumah);
        formData.append("ownership_status", profileData.statusKepemilikan);

        const success = await updateProfile(formData);

        if (success) {
          toast.success("Foto Profil Berhasil Diupload", {
            description: "Foto profil Anda telah diperbarui",
          });
          setUploadModalOpen(false);
          setSelectedFile(null);
          // Clean up preview URL
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
          }
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Gagal Upload Foto", {
          description: "Terjadi kesalahan saat mengupload foto",
        });
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

  const handleSaveProfile = async () => {
    try {
      const formData = new FormData();
      formData.append("fullname", profileData.namaLengkap);
      formData.append("no_telp", profileData.nomorHP);
      formData.append("email", profileData.email);
      formData.append("address", profileData.alamatRumah);
      formData.append("house_type", profileData.tipeRumah);
      formData.append("ownership_status", profileData.statusKepemilikan);

      const success = await updateProfile(formData);

      if (success) {
        toast.success("Profil Berhasil Diperbarui", {
          description: "Data profil Anda telah disimpan",
        });
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Gagal Menyimpan", {
        description: "Terjadi kesalahan saat menyimpan profil",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Loading profil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">Error: {error}</p>
            <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
          </div>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRegistrationDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });
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
            {profile?.photo ? (
              <div className="w-16 h-16 relative rounded-full overflow-hidden">
                <Image
                  src={profile.photo}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xl font-semibold text-gray-600">
                {profile ? getInitials(profile.fullname) : "MA"}
              </div>
            )}

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
                <h3 className="text-base">
                  {profile?.fullname || "Loading..."}
                </h3>

                <Badge className="text-[8px] text-[#1F7EAD] bg-[#D5F1FF] rounded-full">
                  {profile?.citizen_status || "Warga Baru"}
                </Badge>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                Terdaftar Sejak{" "}
                {profile ? getRegistrationDate(profile.created_at) : "..."}
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
              onClick={handleSaveProfile}
              disabled={updating}
            >
              <RefreshCw
                className={`w-4 h-4 ${updating ? "animate-spin" : ""}`}
              />
              <span>{updating ? "Menyimpan..." : "Simpan Perubahan"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="max-w-xs" showCloseButton={false}>
          <DialogHeader className="flex flex-row items-center justify-between p-0">
            <DialogTitle className="text-lg font-semibold">
              Unggah Foto Profil
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
                      Jelajahi dan pilih foto yang ingin Anda unggah dari
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
                disabled={updating}
              >
                {updating ? "Uploading..." : "Upload File"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
