import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { FileText, Plus } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SingleDatePicker } from "@/components/input/singleDatePicker"
import { useState } from "react"
import { toast } from "sonner"
import { useProfiles } from "@/hooks/useProfiles"
import { useUserPermission } from "@/hooks/useUserPermission"
import { InvoiceStatus, PaymentPurposeType, VerificationStatus } from "@/types/invoice"
import { Invoice } from "@/types/invoice"

type NewPaymentForm = {
    name: string;
    contact: string;
    houseNumber: string;
    houseType: string;
    dueDate: Date | undefined;
    amount: string;
    payment_purpose: PaymentPurposeType;
  };

type CreateTransaksiWargaDrawerProps = {
    createSheetOpen: boolean;
    setCreateSheetOpen: (open: boolean) => void;
    createInvoice: (invoice: Invoice) => Promise<Invoice | null>;
}

export default function CreateTransaksiWargaDrawer({ 
    createSheetOpen, 
    setCreateSheetOpen, 
    createInvoice 
}: CreateTransaksiWargaDrawerProps) {
    const { profiles, loading } = useProfiles();
    const { getUserPermissionByProfileId } = useUserPermission();
    const [newPaymentForm, setNewPaymentForm] = useState<NewPaymentForm>({
        name: "",
        contact: "",
        houseNumber: "",
        houseType: "",
        dueDate: undefined,
        amount: "",
        payment_purpose: PaymentPurposeType.IURAN_RT
      });

      const handleCreatePayment = async () => {
        if (!newPaymentForm.name || !newPaymentForm.dueDate || !newPaymentForm.amount || !newPaymentForm.payment_purpose) {
            toast.error("Harap isi semua field yang dibutuhkan", {
                duration: 3000,
                dismissible: true,
                closeButton: true,
            });
            return;
        }
        const newInvoice = await createInvoice({
            user_id: (await getUserPermissionByProfileId(profiles.find(profile => profile.fullname === newPaymentForm.name)?.id || "")).id,
            due_date: newPaymentForm.dueDate?.toISOString() || "",
            invoice_status: InvoiceStatus.UNPAID,
            bill_amount: Number(newPaymentForm.amount),
            verification_status: VerificationStatus.NOT_YET_CHECKED,
            payment_purpose: newPaymentForm.payment_purpose
        })
        console.log("Creating new payment:", newPaymentForm);
        if (newInvoice) {
            setCreateSheetOpen(false);
            setNewPaymentForm({
            name: "",
            contact: "",
            houseNumber: "",
            houseType: "",
            dueDate: undefined,
            amount: "",
            payment_purpose: PaymentPurposeType.IURAN_RT
            });
        }
      };
    
      const updateNewPaymentForm = (
        field: keyof NewPaymentForm,
        value: string | Date | undefined
      ) => {
        setNewPaymentForm((prev) => ({
          ...prev,
          [field]: value,
        }));
      };
    
    
    return (
        <>
        <Sheet open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
            <SheetTrigger asChild>
            <Button
                size="sm"
                className="bg-black text-white hover:bg-black/90 cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" />
                Buat Iuran Baru
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
              <SheetHeader>
                <SheetTitle>Buat Iuran Warga</SheetTitle>
                <SheetDescription>
                  Isi detail iuran warga untuk menambahkan tagihan baru ke
                  sistem.
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto">
                <div className="grid gap-4 py-4 px-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Nama Warga *
                    </Label>

                    <Select
                      disabled={loading}
                      value={newPaymentForm.name}
                      onValueChange={(value) => {
                        updateNewPaymentForm("name", value)
                        updateNewPaymentForm("contact", profiles.find(profile => profile.fullname === value)?.no_telp || "")
                        updateNewPaymentForm("houseNumber", profiles.find(profile => profile.fullname === value)?.house_number || "")
                        updateNewPaymentForm("houseType", profiles.find(profile => profile.fullname === value)?.house_type || "")
                      }}
                    >
                      <SelectTrigger className="w-full bg-white" disabled={loading}>
                        <SelectValue placeholder={loading ? "Memuat data..." : "Pilih Warga"} />
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
                    <Label htmlFor="contact" className="text-sm font-medium">
                      Kontak *
                    </Label>
                    <Input
                      id="contact"
                      placeholder="Pilih Warga Terlebih Dahulu"
                      value={newPaymentForm.contact}
                      disabled
                      className="bg-[#E0E0E0]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="houseNumber" className="text-sm font-medium">
                      Nomor Rumah *
                    </Label>
                    <Input
                      id="houseNumber"
                      placeholder="Pilih Warga Terlebih Dahulu"
                      value={newPaymentForm.houseNumber}
                      disabled
                      className="bg-[#E0E0E0]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="houseType" className="text-sm font-medium">
                      Tipe Rumah *
                    </Label>
                    <Input
                      id="houseType"
                      placeholder="Pilih Warga Terlebih Dahulu"
                      value={newPaymentForm.houseType}
                      disabled
                      className="bg-[#E0E0E0]"
                    />
                  </div>

                  {/* Pembayaran */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Pembayaran *</Label>
                  <Select
                    value={newPaymentForm.payment_purpose}
                    onValueChange={(value) => updateNewPaymentForm("payment_purpose", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PaymentPurposeType.IURAN_RT}>{PaymentPurposeType.IURAN_RT}</SelectItem>
                      <SelectItem value={PaymentPurposeType.IURAN_KEAMANAN}>{PaymentPurposeType.IURAN_KEAMANAN}</SelectItem>
                      <SelectItem value={PaymentPurposeType.IURAN_KEBERSIHAN}>
                        {PaymentPurposeType.IURAN_KEBERSIHAN}
                      </SelectItem>
                      <SelectItem value={PaymentPurposeType.IURAN_LAINNYA}>{PaymentPurposeType.IURAN_LAINNYA}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueDate" className="text-sm font-medium">
                      Jatuh tempo *
                    </Label>
                    <div className="relative">
                      <SingleDatePicker
                        id="dueDate"
                        placeholder="Select date"
                        value={newPaymentForm.dueDate}
                        onChange={(date) => updateNewPaymentForm("dueDate", date)}
                        buttonClassName="w-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-sm font-medium">
                      Jumlah Iuran *
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newPaymentForm.amount}
                      onChange={(e) =>
                        updateNewPaymentForm("amount", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end px-4 py-4 border-t bg-white">
                <Button
                  onClick={handleCreatePayment}
                  className="bg-black text-white hover:bg-black/90"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Buat Iuran
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </>
    )
}