import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, UserPlus, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { FormData } from "@/app/user/auth/components/PersonalInfoStep";
import { ChooseFile } from "@/components/input/chooseFile";

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
  onBack,
}: DocumentStepProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleFileUpload = (
    file: File | null,
    field: "file_ktp" | "file_kk"
  ) => {
    updateFormData({ [field]: file });
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      // Format date as YYYY-MM-DD
      const formattedDate = format(date, "yyyy-MM-dd");
      updateFormData({ moving_date: formattedDate });
    }
  };

  // Parse the moving_date string back to Date for calendar component
  const parseMovingDate = () => {
    if (formData.moving_date) {
      return new Date(formData.moving_date);
    }
    return undefined;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">Isi Data Diri Anda</h2>
          <p className="text-sm font-medium text-black">Step 2 / 2</p>
        </div>
        <p className="text-sm font-normal text-muted-foreground">
          Kami membutuhkan informasi dasar untuk menghubungkan Anda dengan unit
          tempat tinggal Anda di komplek.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ID Card Photo */}
        <div className="space-y-2">
          <ChooseFile
            label="Foto KTP"
            id="file_ktp"
            accept="image/*"
            onChange={(file) => handleFileUpload(file, "file_ktp")}
            value={formData.file_ktp}
          />
        </div>

        {/* Family Card Photo */}
        <div className="space-y-2">
          <ChooseFile
            label="Foto Kartu Keluarga"
            id="file_kk"
            accept="image/*"
            onChange={(file) => handleFileUpload(file, "file_kk")}
            value={formData.file_kk}
          />
        </div>

        {/* Emergency Phone */}
        <div className="space-y-2">
          <Label htmlFor="emergency_telp" className="text-sm font-medium">
            Nomor HP Darurat
          </Label>
          <Input
            className="text-sm"
            id="emergency_telp"
            placeholder="085157429811"
            value={formData.emergency_telp}
            onChange={(e) => updateFormData({ emergency_telp: e.target.value })}
          />
        </div>

        {/* Head of Family */}
        <div className="space-y-2">
          <Label htmlFor="head_of_family" className="text-sm font-medium">
            Nama Kepala Keluarga
          </Label>
          <Input
            className="text-sm"
            id="head_of_family"
            placeholder="Mathew Alexander"
            value={formData.head_of_family}
            onChange={(e) => updateFormData({ head_of_family: e.target.value })}
          />
        </div>

        {/* Work */}
        <div className="space-y-2">
          <Label htmlFor="work" className="text-sm font-medium">
            Pekerjaan
          </Label>
          <Input
            className="text-sm"
            id="work"
            placeholder="CEO Figma"
            value={formData.work}
            onChange={(e) => updateFormData({ work: e.target.value })}
          />
        </div>

        {/* Move-in Date */}
        <div className="space-y-2">
          <Label className="text-sm font-medium" htmlFor="moving_date">
            Tanggal Pindah
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.moving_date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.moving_date ? (
                  format(parseMovingDate()!, "dd/MM/yyyy")
                ) : (
                  <span>Pilih tanggal pindah</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 text-sm" align="start">
              <Calendar
                mode="single"
                selected={parseMovingDate()}
                onSelect={handleDateChange}
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
            onClick={handleSubmit}
          >
            <UserPlus className="w-4 h-4" />
            Daftar Jadi Warga
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full py-3 text-sm font-medium"
            size="lg"
            onClick={onBack}
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
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
