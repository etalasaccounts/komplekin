import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SingleDatePicker } from "@/components/input/singleDatePicker"
import { ChooseFile } from "@/components/input/chooseFile"
import { DollarSign } from "lucide-react"
import { Invoice, InvoiceStatus, VerificationStatus } from "@/types/invoice";
import { useProfiles } from "@/hooks/useProfiles"
import { useUserPermission } from "@/hooks/useUserPermission"
import { toast } from "sonner"

type ManualPaymentForm = {
  name: string;
  contact: string;
  payment: string;
  period: string;
  date: Date | undefined;
  totalAmount: string;
  paidAmount: string;
  paymentMethod: string;
  proofPayment: File | null;
};

type ManualPaymentSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: ManualPaymentForm;
  updateForm: (field: keyof ManualPaymentForm, value: string | Date | File | null | undefined | number) => void; 
  getInvoicesByUserId: (userId: string) => void;
  invoiceByUserId: Invoice[];
  createManualPayment: (invoice: Invoice, uploadedReceipt: File) => Promise<Invoice | null>;
};

export default function ManualPaymentSheet({
  open,
  onOpenChange,
  form,
  updateForm,
  getInvoicesByUserId,
  invoiceByUserId,
  createManualPayment,
}: ManualPaymentSheetProps) {
  const { profiles } = useProfiles();
  const { getUserPermissionByProfileId } = useUserPermission();
  
  const handleSubmit = async () => {
    if (form.name === "" || form.period === "" || form.date === undefined || form.paidAmount === "" || form.paymentMethod === "" || form.proofPayment === null) {
      toast.error("Harap isi semua field yang dibutuhkan")
      return
    } 
    
    try {
      const invoice = {
        id: (invoiceByUserId.find(invoice => invoice.due_date === form.period)?.id || ""),
        due_date: form.period,
        amount_paid: Number(form.paidAmount),
        payment_method: form.paymentMethod,    
        payment_date: form.date?.toISOString(),
        invoice_status: InvoiceStatus.PAID,
        verification_status: VerificationStatus.VERIFIED,
      } as Invoice;
      
      await createManualPayment(invoice, form.proofPayment!);
      
      // Reset form and close sheet
      updateForm("name", "");
      updateForm("contact", "");
      updateForm("payment", "");
      updateForm("period", "");
      updateForm("date", undefined);
      updateForm("totalAmount", "");
      updateForm("paidAmount", "");
      updateForm("paymentMethod", "");
      updateForm("proofPayment", null);
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating manual payment:", error);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:w-[500px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle>Pembayaran Manual</SheetTitle>
          <SheetDescription>
            Isi detail pembayaran untuk mencatat transaksi kas masuk dari
            pembayaran iuran warga RT.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Nama Warga *</Label>
            <Select
              value={form.name}
              onValueChange={async (value) => {
                const profile = profiles.find(profile => profile.fullname === value)
                console.log("profile", profile)
                const userPermissionId = await getUserPermissionByProfileId(profile?.id || "")
                console.log("userPermissionId", userPermissionId)
                updateForm("name", value)
                updateForm("contact", profiles.find(profile => profile.fullname === value)?.no_telp || "")
                getInvoicesByUserId(userPermissionId.id)
              }
            }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Warga" />
              </SelectTrigger>
              <SelectContent>
                {profiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.fullname}>
                    {profile.fullname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Kontak *</Label>
            <Input
              value={form.contact}
              onChange={(e) => updateForm("contact", e.target.value)}
              placeholder="Pilih Warga"
              disabled
              className="bg-gray-100"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Periode Bayar/Bulan *
            </Label>
            <Select
              value={form.period}
              onValueChange={(value) => {
                updateForm("period", value)
                updateForm("totalAmount", invoiceByUserId.find(invoice => invoice.due_date === value)?.bill_amount || "")
              }}
            >
              <SelectTrigger className="w-full" disabled={invoiceByUserId.length === 0}>
                <SelectValue placeholder={form.name === "" ? "Pilih Warga" : "Pilih Periode"} />
              </SelectTrigger>
              <SelectContent>
                {invoiceByUserId.filter(invoice => invoice.invoice_status === InvoiceStatus.UNPAID).map((invoice) => (
                  <SelectItem key={invoice.id} value={invoice.due_date}>
                    {invoice.due_date}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Tanggal Pembayaran*</Label>
            <SingleDatePicker
              value={form.date}
              onChange={(date) => updateForm("date", date)}
              buttonClassName="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Total Tagihan *</Label>
            <Input
              value={form.totalAmount}
              onChange={(e) => updateForm("totalAmount", e.target.value)}
              placeholder="Pilih periode"
              disabled
              className="bg-gray-100"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Jumlah Bayar *</Label>
            <Input
              value={form.paidAmount}
              onChange={(e) => updateForm("paidAmount", e.target.value)}
              placeholder="Rp100.000"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Metode Bayar *</Label>
            <Select
              value={form.paymentMethod}
              onValueChange={(value) => updateForm("paymentMethod", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Cash" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
                <SelectItem value="qris">Qris</SelectItem>
                <SelectItem value="e-wallet">E-Wallet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <ChooseFile
              label="Bukti Bayar"
              id="manualProofPayment"
              accept="image/*,.pdf"
              onChange={(file) => updateForm("proofPayment", file)}
              value={form.proofPayment}
              placeholder="Choose file"
              required
            />
          </div>

          <div className="flex py-6 justify-end">
            <Button
              className="w-fit bg-black text-white hover:bg-black/90"
              onClick={() => handleSubmit()}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Bayar Iuran
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
} 