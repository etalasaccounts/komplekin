import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit } from "lucide-react";
import { useEffect, useState } from "react";
import { SingleDatePicker } from "@/components/input/singleDatePicker";
import { ChooseFile } from "@/components/input/chooseFile";
import { Ledger } from "@/types/ledger";
import { urlToFile, base64ToFile, validateFileForUpload } from "@/lib/utils";
import { toast } from "sonner";
import { UserPermissions } from "@/types/user_permissions";

type CreateExpenseDrawerProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingExpense: Ledger | null;
    createLedger: (expenseData: Ledger) => Promise<Ledger>;
    updateLedger: (id: string, expenseData: Ledger) => Promise<Ledger>;
    userPermission: UserPermissions;
}

export default function CreateExpenseDrawer({ open, onOpenChange, editingExpense, createLedger, updateLedger, userPermission }: CreateExpenseDrawerProps) {
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [expenseForm, setExpenseForm] = useState({
        tanggal: undefined as Date | undefined,
        keterangan: "",
        nominal: "",
        dibayarkanOleh: "",
        buktiPembayaran: null as File | string | null,
    });

    useEffect(() => {
        if (editingExpense) {
            // Convert receipt URL to File if it exists
            const loadReceiptFile = async () => {
                let receiptFile: File | string | null = null;
                
                if (editingExpense.receipt) {
                    try {
                        // Check if receipt is a URL or base64
                        if (editingExpense.receipt.startsWith('http')) {
                            receiptFile = await urlToFile(editingExpense.receipt, 'receipt.jpg');
                        } else if (editingExpense.receipt.startsWith('data:')) {
                            receiptFile = base64ToFile(editingExpense.receipt, 'receipt.jpg');
                        } else {
                            // If it's already a string URL, keep it as is
                            receiptFile = editingExpense.receipt;
                        }
                    } catch (error) {
                        console.error('Error loading receipt file:', error);
                        // If conversion fails, keep the original receipt
                        receiptFile = editingExpense.receipt;
                    }
                }

                setExpenseForm({
                    tanggal: new Date(editingExpense.date),
                    keterangan: editingExpense.description || "",
                    nominal: editingExpense.amount?.toString() || "",
                    dibayarkanOleh: editingExpense.user_permission?.profile.fullname || "", 
                    buktiPembayaran: receiptFile,
                });
            };

            loadReceiptFile();
            setIsEditMode(true);
        } else {
            setIsEditMode(false);
            setExpenseForm({
                tanggal: undefined,
                keterangan: "",
                nominal: "",
                dibayarkanOleh: "",
                buktiPembayaran: null,
            });
        }
    }, [editingExpense]);

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            
            if (isEditMode && editingExpense) {
                await updateLedger(editingExpense.id, expenseForm as unknown as Ledger);
            } else {
                await createLedger(expenseForm as unknown as Ledger);
            }
            onOpenChange(false);
        } catch (error) {
            console.error('Error submitting expense:', error);
            // Handle error (show toast, etc.)
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (file: File | null) => {
        if (file) {
            // Optional: Frontend validation
            const validation = validateFileForUpload(file);
            if (!validation.isValid) {
                toast.error(validation.error || 'File tidak valid');
                return;
            }
        }

        setExpenseForm({
            ...expenseForm,
            buktiPembayaran: file,
        });
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-[400px] sm:w-[500px]">
                <SheetHeader className="pb-6">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="text-xl font-bold">
                            {isEditMode ? "Edit Pengeluaran" : "Tambah Pengeluaran"}
                        </SheetTitle>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {isEditMode
                            ? "Edit detail pengeluaran untuk memperbarui transaksi kas keluar dari keuangan RT."
                            : "Isi detail pengeluaran untuk mencatat transaksi kas keluar dari keuangan RT."}
                    </p>
                </SheetHeader>

                <div className="space-y-6 px-4">
                    {/* Date Field */}
                    <div className="space-y-2">
                        <Label htmlFor="tanggal" className="text-sm font-medium">
                            Tanggal *
                        </Label>
                        <SingleDatePicker
                            id="tanggal"
                            value={expenseForm.tanggal}
                            onChange={(date) => {
                                setExpenseForm({
                                    ...expenseForm,
                                    tanggal: date,
                                });
                            }}
                            buttonClassName="w-full"
                        />
                    </div>

                    {/* Description Field */}
                    <div className="space-y-2">
                        <Label htmlFor="keterangan" className="text-sm font-medium">
                            Keterangan *
                        </Label>
                        <Input
                            id="keterangan"
                            placeholder="Deskripsi pengeluaran"
                            value={expenseForm.keterangan}
                            onChange={(e) =>
                                setExpenseForm({
                                    ...expenseForm,
                                    keterangan: e.target.value,
                                })
                            }
                            className="w-full"
                        />
                    </div>

                    {/* Amount Field */}
                    <div className="space-y-2">
                        <Label htmlFor="nominal" className="text-sm font-medium">
                            Nominal *
                        </Label>
                        <Input
                            id="nominal"
                            placeholder="120000"
                            value={expenseForm.nominal}
                            onChange={(e) =>
                                setExpenseForm({
                                    ...expenseForm,
                                    nominal: e.target.value,
                                })
                            }
                            className="w-full"
                        />
                    </div>

                    {/* Paid By Field */}
                    <div className="space-y-2">
                        <Label htmlFor="dibayarkanOleh" className="text-sm font-medium">
                            Dibayarkan Oleh *
                        </Label>
                        <Input
                            id="dibayarkanOleh"
                            placeholder="Nama pembayar"
                            value={userPermission.profile.fullname}
                            className="w-full"
                            disabled={true}
                        />
                    </div>

                    {/* File Upload Field */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">
                            Bukti Pembayaran
                        </Label>
                        <ChooseFile
                            onChange={handleFileChange}
                            value={expenseForm.buktiPembayaran instanceof File ? expenseForm.buktiPembayaran : null}
                        />
                        {isEditMode && expenseForm.buktiPembayaran && typeof expenseForm.buktiPembayaran === 'string' && (
                            <p className="text-xs text-muted-foreground">
                                Bukti pembayaran saat ini: {expenseForm.buktiPembayaran}
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6 flex justify-end">
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-fit bg-black text-white hover:bg-black/90"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    {isEditMode ? "Updating..." : "Creating..."}
                                </>
                            ) : isEditMode ? (
                                <>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Update Pengeluaran
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Buat Pengeluaran
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
} 