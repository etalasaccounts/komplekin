import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit } from "lucide-react";
import { useEffect, useState } from "react";
import { ClusterBankAccount } from "@/types/cluster_bank_accounts";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

type CreateExpenseProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    createClusterBankAccount: (data: ClusterBankAccount) => Promise<ClusterBankAccount | null>;
    updateClusterBankAccount: (data: ClusterBankAccount) => Promise<ClusterBankAccount | null>;
    editingRekening: ClusterBankAccount | null;
}

export default function CreateExpense({ open, onOpenChange, createClusterBankAccount, updateClusterBankAccount, editingRekening }: CreateExpenseProps) {
    const [isEditMode, setIsEditMode] = useState(false);
    const [rekeningForm, setRekeningForm] = useState<ClusterBankAccount>({
        id: "",
        account_name: "",
        account_number: "",
        bank_name: "",
        account_usage: "",
        cluster_id: "",
    });
    const { clusterId } = useAuth();

    useEffect(() => {
        if (editingRekening) {
            setRekeningForm(editingRekening);
            setIsEditMode(true);
        } else {
            setIsEditMode(false);
            setRekeningForm({
                id: "",
                account_name: "",
                account_number: "",
                bank_name: "",
                account_usage: "",
                cluster_id: "",
            });
        }
    }, [editingRekening]);

    const handleSubmitRekening = async () => {
        if (isEditMode) {
          // Handle form update here
          const updatedRekening = await updateClusterBankAccount(rekeningForm);
          if (updatedRekening) {
            onOpenChange(false);
            setRekeningForm({
              id: "",
              account_name: "",
              account_number: "",
              bank_name: "",
              account_usage: "",
              cluster_id: "",
            });
          }
        } else {
          if (!clusterId) {
            toast.error("Cluster tidak ditemukan. Coba muat ulang halaman.");
            return;
          }
          const payload: ClusterBankAccount = {
            ...rekeningForm,
            cluster_id: clusterId,
          };
          const created = await createClusterBankAccount(payload);
          if (created) {
            onOpenChange(false);
            setRekeningForm({
              id: "",
              account_name: "",
              account_number: "",
              bank_name: "",
              account_usage: "",
              cluster_id: "",
            });
          }
        }
    
        // No further action here; handled per branch
      };

    return (
        <Sheet
            open={open}
            onOpenChange={onOpenChange}
              >
                <SheetContent side="right" className="w-[400px] sm:w-[500px]">
                  <SheetHeader className="pb-6">
                    <div className="flex items-center justify-between">
                      <SheetTitle className="text-xl font-bold">
                        {isEditMode ? "Edit Rekening" : "Tambah Rekening"}
                      </SheetTitle>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isEditMode
                        ? "Edit detail rekening untuk memperbarui informasi rekening RT."
                        : "Tambahkan rekening resmi untuk keperluan transaksi dan pembayaran dari warga."}
                    </p>
                  </SheetHeader>

                  <div className="space-y-6 px-4">
                    {/* Nama Rekening Field */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="namaRekening"
                        className="text-sm font-medium"
                      >
                        Nama Rekening *
                      </Label>
                      <Input
                        id="namaRekening"
                        placeholder="Mathew Alexander"
                        value={rekeningForm?.account_name}
                        onChange={(e) =>
                          setRekeningForm({
                            ...rekeningForm,
                            account_name: e.target.value,
                          })
                        }
                        className="w-full"
                      />
                    </div>

                    {/* Nama Bank Field */}
                    <div className="space-y-2">
                      <Label htmlFor="namaBank" className="text-sm font-medium">
                        Nama Bank *
                      </Label>
                      <Select
                        value={rekeningForm.bank_name}
                        onValueChange={(value) =>
                          setRekeningForm({ ...rekeningForm, bank_name: value })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Bank BCA" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bank BCA">Bank BCA</SelectItem>
                          <SelectItem value="Bank BRI">Bank BRI</SelectItem>
                          <SelectItem value="Bank BNI">Bank BNI</SelectItem>
                          <SelectItem value="Bank Mandiri">
                            Bank Mandiri
                          </SelectItem>
                          <SelectItem value="Bank CIMB">Bank CIMB</SelectItem>
                          <SelectItem value="Bank Danamon">
                            Bank Danamon
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Nomor Rekening Field */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="nomorRekening"
                        className="text-sm font-medium"
                      >
                        Nomor Rekening *
                      </Label>
                      <Input
                        id="nomorRekening"
                        placeholder="1660906378"
                        value={rekeningForm.account_number}
                        onChange={(e) =>
                          setRekeningForm({
                            ...rekeningForm,
                            account_number: e.target.value,
                          })
                        }
                        className="w-full"
                      />
                    </div>

                    {/* Kegunaan Rekening Field */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="kegunaanRekening"
                        className="text-sm font-medium"
                      >
                        Kegunaan Rekening *
                      </Label>
                      <Select
                        value={rekeningForm.account_usage}
                        onValueChange={(value) =>
                          setRekeningForm({
                            ...rekeningForm,
                            account_usage: value,
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Iuran" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Iuran">Iuran</SelectItem>
                          <SelectItem value="Donasi">Donasi</SelectItem>
                          <SelectItem value="Keamanan">Keamanan</SelectItem>
                          <SelectItem value="Kebersihan">Kebersihan</SelectItem>
                          <SelectItem value="Lainnya">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6 flex justify-end">
                      <Button
                        onClick={handleSubmitRekening}
                        className="w-fit bg-black text-white hover:bg-black/90"
                      >
                        {isEditMode ? (
                          <>
                            <Edit className="h-4 w-4 mr-2" />
                            Update Rekening
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Simpan Rekening
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
    )
}