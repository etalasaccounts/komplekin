import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight } from "lucide-react";

export interface FormData {
  email: string;
  fullname: string;
  no_telp: string;
  address: string;
  house_type: string;
  house_number: string;
  ownership_status: string;
  file_ktp: File | null;
  file_kk: File | null;
  emergency_telp: string;
  head_of_family: string;
  work: string;
  moving_date: string;
  citizen_status?: string;
}

interface PersonalInfoStepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
  onSubmit: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function PersonalInfoStep({
  formData,
  updateFormData,
  onNext,
}: PersonalInfoStepProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">Isi Data Diri Anda</h2>
          <p className="text-sm font-medium text-black">
            Step 1 / <span className="text-muted-foreground">2</span>
          </p>
        </div>
        <p className="text-sm font-normal text-muted-foreground">
          Kami membutuhkan informasi dasar untuk menghubungkan Anda dengan unit
          tempat tinggal Anda di komplek.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullname" className="text-sm font-medium">
            Nama Lengkap *
          </Label>
          <Input
            className="text-sm"
            id="fullname"
            placeholder="Mathew Alexander"
            value={formData.fullname}
            onChange={(e) => updateFormData({ fullname: e.target.value })}
            required
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email *
          </Label>
          <Input
            className="text-sm"
            id="email"
            type="email"
            placeholder="mathewa@gmail.com"
            value={formData.email}
            onChange={(e) => updateFormData({ email: e.target.value })}
            required
          />
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <Label htmlFor="no_telp" className="text-sm font-medium">
            Nomor HP Aktif *
          </Label>
          <Input
            className="text-sm"
            id="no_telp"
            placeholder="089534924330"
            value={formData.no_telp}
            onChange={(e) => updateFormData({ no_telp: e.target.value })}
            required
          />
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-medium">
            Alamat Rumah *
          </Label>
          <Textarea
            className="text-sm"
            id="address"
            placeholder="Komplek Mahata Margonda No12 Blok A"
            value={formData.address}
            onChange={(e) => updateFormData({ address: e.target.value })}
            rows={3}
            required
          />
        </div>

        {/* House Type */}
        <div className="space-y-2">
          <Label htmlFor="house_type" className="text-sm font-medium">
            Tipe Rumah *
          </Label>
          <Input
            className="text-sm"
            id="house_type"
            type="text"
            placeholder="Tipe 24 B"
            value={formData.house_type}
            onChange={(e) => updateFormData({ house_type: e.target.value })}
            required
          />
        </div>

        {/* House Number */}
        <div className="space-y-2">
          <Label htmlFor="house_number" className="text-sm font-medium">
            Nomor Rumah *
          </Label>
          <Input
            className="text-sm"
            id="house_number"
            placeholder="No 12"
            value={formData.house_number}
            onChange={(e) => updateFormData({ house_number: e.target.value })}
            required
          />
        </div>

        {/* Ownership Status */}
        <div className="space-y-2">
          <Label htmlFor="ownership_status" className="text-sm font-medium">
            Status Kepemilikan *
          </Label>
          <Select
            value={formData.ownership_status}
            onValueChange={(value) =>
              updateFormData({ ownership_status: value })
            }
          >
            <SelectTrigger className="w-full text-sm">
              <SelectValue placeholder="Pilih status kepemilikan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sewa">Sewa</SelectItem>
              <SelectItem value="milik-sendiri">Milik Sendiri</SelectItem>
              <SelectItem value="milik-orang-tua">Milik Orang Tua</SelectItem>
              <SelectItem value="kontrak">Kontrak</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <Button
            type="submit"
            className="w-full bg-foreground text-background hover:bg-foreground/90 py-3 text-sm font-medium"
            size="lg"
          >
            Selanjutnya
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
