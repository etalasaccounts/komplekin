import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { SingleDatePicker } from "@/components/input/singleDatePicker"
import { ChooseFile } from "@/components/input/chooseFile"
import { Check, X } from "lucide-react"
import { Invoice } from "@/types/invoice"

type VerificationForm = {
  tanggalBayar: Date | undefined;
  jumlahBayar: string;
  buktiPembayaran: File | null;
};

type VerificationSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedInvoice: Invoice | null;
  form: VerificationForm;
  updateForm: (field: keyof VerificationForm, value: any) => void;
  onApprove: () => void;
  onReject: () => void;
};

export default function VerificationSheet({
  open,
  onOpenChange,
  selectedInvoice,
  form,
  updateForm,
  onApprove,
  onReject,
}: VerificationSheetProps) {
  if (!selectedInvoice) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:w-[500px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle>Verifikasi Pembayaran</SheetTitle>
          <SheetDescription>
            Periksa dan validasi pembayaran yang telah dilakukan warga sebelum
            dicatat sebagai pemasukan resmi
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Nama Warga</Label>
            <Input
              value={selectedInvoice.user_permission?.profile?.fullname}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Kontak</Label>
            <Input
              value={selectedInvoice.user_permission?.profile?.no_telp}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Pembayaran</Label>
            <Input
              value={selectedInvoice.payment_purpose || "-"}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Bulan</Label>
            <Input value={selectedInvoice.due_date.split(" ")[0]} disabled className="bg-gray-50" />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Tanggal Bayar</Label>
            <SingleDatePicker
              value={form.tanggalBayar}
              onChange={(date) => updateForm("tanggalBayar", date)}
              placeholder="06/07/2025"
              buttonClassName="w-full bg-gray-50"
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Jumlah Bayar *</Label>
            <div className="flex flex-col items-start">
              <Input
                value={form.jumlahBayar}
                onChange={(e) => updateForm("jumlahBayar", e.target.value)}
                placeholder="Rp120.000"
                className="pr-20"
              />
              <div className="">
                <span className="text-sm text-red-500">
                  Kurang Rp20.000
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Metode Bayar</Label>
            <Input value={selectedInvoice.payment_method} disabled className="bg-gray-50" />
          </div>

          <div className="space-y-2">
            <ChooseFile
              label="Bukti Bayar"
              id="verificationProofPayment"
              accept="image/*,.pdf"
              onChange={(file) => updateForm("buktiPembayaran", file)}
              value={form.buktiPembayaran}
              placeholder="No file chosen"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-6 pb-6">
            <Button
              variant="outline"
              className="flex-1 border-none bg-secondary"
              onClick={onReject}
            >
              <X className="h-4 w-4 mr-2" />
              Tolak
            </Button>
            <Button
              className="flex-1 bg-black text-white hover:bg-black/90"
              onClick={onApprove}
            >
              <Check className="h-4 w-4 mr-2" />
              Terima
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
} 