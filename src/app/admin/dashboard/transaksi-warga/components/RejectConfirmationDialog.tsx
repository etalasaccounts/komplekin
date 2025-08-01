import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type RejectConfirmationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rejectReason: string;
  onRejectReasonChange: (reason: string) => void;
  onConfirmReject: () => void;
};

export default function RejectConfirmationDialog({
  open,
  onOpenChange,
  rejectReason,
  onRejectReasonChange,
  onConfirmReject,
}: RejectConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 bg-white">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-lg font-semibold">
            Tolak Verifikasi Pembayaran?
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6">
          <p className="text-sm text-gray-600 mb-4">
            Pembayaran akan ditandai sebagai tidak valid. Pastikan ada alasan
            yang jelas sebelum menolak. Anda bisa meminta ulang bukti
            pembayaran dari warga.
          </p>

          <div className="space-y-2 mb-6">
            <Label className="text-sm font-medium">
              Tuliskan alasan menolak pembayaran
            </Label>
            <Textarea
              value={rejectReason}
              onChange={(e) => onRejectReasonChange(e.target.value)}
              placeholder="Contoh: Bukti transfer tidak jelas, nominal tidak sesuai, dll."
              className="min-h-[80px] resize-none"
            />
          </div>

          <div className="flex space-x-3 justify-end">
            <Button
              className="flex bg-red-600 text-white hover:bg-red-700"
              onClick={onConfirmReject}
            >
              Tolak Pembayaran
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 