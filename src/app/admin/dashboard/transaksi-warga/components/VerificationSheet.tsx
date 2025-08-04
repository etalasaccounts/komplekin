import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { SingleDatePicker } from "@/components/input/singleDatePicker"
import { Check, FileText, ImageIcon, X, File } from "lucide-react"
import { Invoice } from "@/types/invoice"
import { PreviewImage } from "@/components/modal/previewImage"
import { useState } from "react"

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
  updateForm: (field: keyof VerificationForm, value: string | Date | File | null | undefined) => void;
  onApprove: () => void;
  onReject: () => void;
};

const getFileIcon = (file: string) => {
  if (file.includes("image/")) {
    return <ImageIcon className="h-4 w-4" />;
  } else if (file.includes("pdf")) {
    return <FileText className="h-4 w-4" />;
  } else {
    return <File className="h-4 w-4" />;
  }
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

  const [previewReceiptModalOpen, setPreviewReceiptModalOpen] = useState(false);


  return (
    <>
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
            <Label className="text-sm font-medium">Bulan</Label>
            <Input value={selectedInvoice.due_date.split(" ")[0]} disabled className="bg-gray-50" />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Tanggal Bayar</Label>
            <SingleDatePicker
              value={new Date(selectedInvoice.payment_date!)}
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
                value={selectedInvoice.amount_paid}
                placeholder="Rp120.000"
                className="pr-20"
                disabled
              />
              {Number(selectedInvoice.amount_paid) < Number(selectedInvoice.bill_amount) && (
              <div className="">
                <span className="text-sm text-red-500">
                  Kurang Rp{(Number(selectedInvoice.bill_amount) - Number(selectedInvoice.amount_paid)).toLocaleString()}
                </span>
              </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Metode Bayar</Label>
            <Input value={selectedInvoice.payment_method?.split("_").join(" ").charAt(0).toUpperCase()! + selectedInvoice.payment_method?.split("_").join(" ").slice(1)} disabled className="bg-gray-50" />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Bukti Bayar</Label>
            <Button variant="outline" className="text-black hover:text-foreground/80 text-sm underline ml-2 disabled:opacity-50" onClick={() => setPreviewReceiptModalOpen(true)}>
              Lihat Bukti Bayar
            </Button>
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

    <PreviewImage
    open={previewReceiptModalOpen}
    onOpenChange={setPreviewReceiptModalOpen}
    title="Bukti Pembayaran"
    imageSrc={
      selectedInvoice?.receipt
    }
    imageAlt={`Bukti Pembayaran - ${selectedInvoice?.user_permission?.profile?.fullname || "Payment"}`}
    />
    </>
  );
} 