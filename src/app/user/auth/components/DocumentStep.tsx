import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { FormData } from "@/app/user/auth/components/MultiStepForm";

interface DocumentStepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
  onSubmit: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function DocumentStep({
  formData,
  updateFormData,
  onSubmit,
}: DocumentStepProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleFileUpload = (
    file: File,
    field: "idCardPhoto" | "familyCardPhoto"
  ) => {
    updateFormData({ [field]: file });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">Isi Data Diri Anda</h2>
          <p className="text-sm font-medium text-black">Step 1 / 2</p>
        </div>
        <p className="text-sm font-normal text-muted-foreground">
          Kami membutuhkan informasi dasar untuk menghubungkan Anda dengan unit
          tempat tinggal Anda di komplek.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ID Card Photo */}
        <div className="space-y-2">
          <Label htmlFor="idCardPhoto" className="text-sm font-medium">
            Foto KTP *
          </Label>
          <div className="relative">
            <input
              id="idCardPhoto"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, "idCardPhoto");
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex items-center space-x-2 px-3 py-2 border border-input rounded-md">
              <span className="font-medium text-sm">Choose file</span>
              <span className="text-sm text-gray-500">
                {formData.idCardPhoto
                  ? formData.idCardPhoto.name
                  : "No file chosen"}
              </span>
            </div>
          </div>
        </div>

        {/* Family Card Photo */}
        <div className="space-y-2">
          <Label htmlFor="familyCardPhoto" className="text-sm font-medium">
            Foto Kartu Keluarga *
          </Label>
          <div className="relative">
            <input
              id="familyCardPhoto"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, "familyCardPhoto");
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex items-center space-x-2 px-3 py-2 border border-input rounded-md">
              <span className="font-medium text-sm">Choose file</span>
              <span className="text-sm text-gray-500">
                {formData.familyCardPhoto
                  ? formData.familyCardPhoto.name
                  : "No file chosen"}
              </span>
            </div>
          </div>
        </div>

        {/* Emergency Phone */}
        <div className="space-y-2">
          <Label htmlFor="emergencyPhone" className="text-sm font-medium">
            Nomor HP Darurat *
          </Label>
          <Input
            className="text-sm"
            id="emergencyPhone"
            placeholder="085157429811"
            value={formData.emergencyPhone}
            onChange={(e) => updateFormData({ emergencyPhone: e.target.value })}
            // required
          />
        </div>

        {/* Head of Family */}
        <div className="space-y-2">
          <Label htmlFor="headOfFamily" className="text-sm font-medium">
            Nama Kepala Keluarga *
          </Label>
          <Input
            className="text-sm"
            id="headOfFamily"
            placeholder="Mathew Alexander"
            value={formData.headOfFamily}
            onChange={(e) => updateFormData({ headOfFamily: e.target.value })}
            // required
          />
        </div>

        {/* Occupation */}
        <div className="space-y-2">
          <Label htmlFor="occupation" className="text-sm font-medium">
            Pekerjaan
          </Label>
          <Input
            className="text-sm"
            id="occupation"
            placeholder="CEO Figma"
            value={formData.occupation}
            onChange={(e) => updateFormData({ occupation: e.target.value })}
          />
        </div>

        {/* Move-in Date */}
        <div className="space-y-2">
          <Label className="text-sm font-medium" htmlFor="moveInDate">
            Tanggal Pindah
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.moveInDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.moveInDate ? (
                  format(formData.moveInDate, "dd/MM/yyyy")
                ) : (
                  <span>20/06/2025</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 text-sm" align="start">
              <Calendar
                mode="single"
                selected={formData.moveInDate}
                onSelect={(date) => updateFormData({ moveInDate: date })}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Submit Button */}
        <div className="pt-6 flex flex-col items-center gap-2">
          <Button
            type="submit"
            className="w-full bg-foreground text-background hover:bg-foreground/90 py-3 text-sm font-medium"
            size="lg"
          >
            Daftar Jadi Warga
          </Button>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Semua informasi yang Anda isi hanya digunakan untuk keperluan
            administrasi warga dan tidak akan dibagikan ke pihak lain.
          </p>
        </div>
      </form>
    </div>
  );
}
