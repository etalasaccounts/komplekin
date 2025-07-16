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
import { FormData } from "./MultiStepForm";

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
          <Label htmlFor="fullName" className="text-sm font-medium">
            Nama Lengkap *
          </Label>
          <Input
            className="text-sm"
            id="fullName"
            placeholder="Mathew Alexander"
            value={formData.fullName}
            onChange={(e) => updateFormData({ fullName: e.target.value })}
            // required
          />
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <Label htmlFor="phoneNumber" className="text-sm font-medium">
            Nomor HP Aktif *
          </Label>
          <Input
            className="text-sm"
            id="phoneNumber"
            placeholder="089534924330"
            value={formData.phoneNumber}
            onChange={(e) => updateFormData({ phoneNumber: e.target.value })}
            // required
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
            // required
          />
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-medium">
            Alamat Rumah
          </Label>
          <Textarea
            className="text-sm"
            id="address"
            placeholder="Komplek Mahata Margonda No12 Blok A"
            value={formData.address}
            onChange={(e) => updateFormData({ address: e.target.value })}
            rows={3}
          />
        </div>

        {/* Ownership Status */}
        <div className="space-y-2">
          <Label htmlFor="ownershipStatus" className="text-sm font-medium">
            Status Kepemilikan
          </Label>
          <Select
            value={formData.ownershipStatus}
            onValueChange={(value) =>
              updateFormData({ ownershipStatus: value })
            }
          >
            <SelectTrigger className="w-full text-sm">
              <SelectValue placeholder="Sewa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sewa">Sewa</SelectItem>
              <SelectItem value="milik">Milik</SelectItem>
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
            Lanjut
          </Button>
        </div>
      </form>
    </div>
  );
}
