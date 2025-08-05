import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { FileText, Plus, Save } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { MultiSelect } from "@/components/ui/multi-select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useState, useEffect, useMemo } from "react"
import { useIuran } from "@/hooks/useIuran"
import { useUserPermission } from "@/hooks/useUserPermission"
import { CreateIuranRequest, UpdateIuranRequest, Iuran } from "@/types/iuran"
import { toast } from "sonner"
import { Invoice } from "@/types/invoice"
import { useAuth } from "@/hooks/useAuth"

type NewPaymentForm = {
    name: string[];
    dueDate: string;
    amount: string;
    nama_iuran: string;
    startDate: Date | undefined;
    endDate: Date | undefined;
  };

type IuranWargaDrawerProps = {
    createSheetOpen: boolean;
    setCreateSheetOpen: (open: boolean) => void;
    createInvoice: (invoice: Invoice) => Promise<Invoice | null>;
    editMode?: boolean;
    editingIuran?: Iuran | null;
    onUpdate?: (id: string, data: UpdateIuranRequest) => Promise<Iuran | null>;
}

export default function IuranWargaDrawer({ 
    createSheetOpen, 
    setCreateSheetOpen, 
    editMode = false,
    editingIuran = null,
    onUpdate
}: IuranWargaDrawerProps) {
    const { createIuran, error: iuranError } = useIuran();
    const { clusterId } = useAuth();
    const { userPermissions } = useUserPermission();
    const [isCreating, setIsCreating] = useState(false);
    const [newPaymentForm, setNewPaymentForm] = useState<NewPaymentForm>({
        name: [],
        dueDate: "",
        amount: "",
        nama_iuran: "",
        startDate: undefined,
        endDate: undefined
      });

    const userPermissionsByCluster = useMemo(() => 
        userPermissions.filter(userPermission => userPermission.cluster_id === clusterId),
        [userPermissions, clusterId]
    );

    const populateEditForm = async () => {
        if (editMode && editingIuran) {
            try {
                const profileNames = userPermissionsByCluster
                    .filter((userPermission) => {
                        return editingIuran.participants.includes(userPermission.id);
                    })
                    .map(userPermission => userPermission.profile.fullname);

                setNewPaymentForm({
                    name: profileNames,
                    dueDate: editingIuran.due_date.toString(),
                    amount: editingIuran.amount.toString(),
                    nama_iuran: editingIuran.name,
                    startDate: new Date(editingIuran.start_date),
                    endDate: new Date(editingIuran.end_date)
                });
            } catch (error) {
                console.error("Error populating edit form:", error);
            }
        }
    };

    useEffect(() => {
        populateEditForm();
    }, [editMode, editingIuran, userPermissionsByCluster]);

    const handleCreateIuran = async () => {
        if (!newPaymentForm.name.length || !newPaymentForm.dueDate.trim() || !newPaymentForm.amount || !newPaymentForm.nama_iuran || !newPaymentForm.startDate || !newPaymentForm.endDate) {
            toast.error("Harap isi semua field yang dibutuhkan", {
                duration: 3000,
                dismissible: true,
                closeButton: true,
            });
            return;
        }

        if (newPaymentForm.startDate && newPaymentForm.endDate && newPaymentForm.startDate > newPaymentForm.endDate) {
            toast.error("Tanggal mulai tidak boleh lebih besar dari tanggal akhir", {
                duration: 3000,
                dismissible: true,
                closeButton: true,
            });
            return;
        }

        setIsCreating(true);
        try {
            const selectedProfiles = userPermissionsByCluster.filter(userPermission => 
                newPaymentForm.name.includes(userPermission.profile.fullname)
            );
            
            const participantIds = selectedProfiles.map(userPermission => userPermission.id);

            const iuranData: CreateIuranRequest = {
                name: newPaymentForm.nama_iuran,
                participants: participantIds,
                due_date: parseInt(newPaymentForm.dueDate) || 0,
                start_date: newPaymentForm.startDate!.toISOString().split('T')[0],
                end_date: newPaymentForm.endDate!.toISOString().split('T')[0],
                amount: parseInt(newPaymentForm.amount),
                cluster_id: clusterId!
            };

            const newIuran = await createIuran(iuranData);
            
            if (newIuran) {
                toast.success("Iuran berhasil dibuat dan invoice pertama telah digenerate!", {
                    duration: 3000,
                    dismissible: true,
                    closeButton: true,
                });
                
                setNewPaymentForm({
                    name: [],
                    dueDate: "",
                    amount: "",
                    nama_iuran: "",
                    startDate: undefined,
                    endDate: undefined
                });
                
                setCreateSheetOpen(false);
            }
        } catch (error) {
            console.error("Error creating iuran:", error);
            toast.error("Terjadi kesalahan saat membuat iuran", {
                duration: 3000,
                dismissible: true,
                closeButton: true,
            });
        } finally {
            setIsCreating(false);
        }
    };

    const handleUpdateIuran = async () => {
        if (!editingIuran || !onUpdate) return;

        if (!newPaymentForm.name.length || !newPaymentForm.dueDate.trim()) {
            toast.error("Harap pilih minimal satu peserta", {
                duration: 3000,
                dismissible: true,
                closeButton: true,
            });
            return;
        }

        setIsCreating(true);
        try {
            const selectedProfiles = userPermissionsByCluster.filter(userPermission => 
                newPaymentForm.name.includes(userPermission.profile.fullname)
            );
            
            const participantIds = selectedProfiles.map(userPermission => userPermission.id);

            const updateData: UpdateIuranRequest = {
                participants: participantIds,
                due_date: parseInt(newPaymentForm.dueDate) || 0,
                start_date: newPaymentForm.startDate!.toISOString().split('T')[0],
                end_date: newPaymentForm.endDate!.toISOString().split('T')[0],
                amount: parseInt(newPaymentForm.amount)
            };

            const updatedIuran = await onUpdate(editingIuran.id, updateData);
            
            if (updatedIuran) {
                toast.success("Iuran berhasil diupdate!", {
                    duration: 3000,
                    dismissible: true,
                    closeButton: true,
                });

                setCreateSheetOpen(false);
            }
        } catch (error) {
            console.error("Error updating iuran:", error);
            toast.error("Terjadi kesalahan saat mengupdate iuran", {
                duration: 3000,
                dismissible: true,
                closeButton: true,
            });
        } finally {
            setIsCreating(false);
        }
    };
    
      const updateNewPaymentForm = (
        field: keyof NewPaymentForm,
        value: string | string[] | Date | undefined
      ) => {
        setNewPaymentForm((prev) => ({
          ...prev,
          [field]: value,
        }));
      };
    
    
    return (
        <>
        <Sheet open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
            {!editMode && (
                <SheetTrigger asChild>
                    <Button
                        size="sm"
                        className="bg-black text-white hover:bg-black/90 cursor-pointer"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Buat Iuran Baru
                    </Button>
                </SheetTrigger>
            )}
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
              <SheetHeader>
                <SheetTitle>{editMode ? "Edit Iuran" : "Buat Iuran Baru"}</SheetTitle>
                <SheetDescription>
                  {editMode 
                    ? "Edit detail iuran untuk mengubah informasi yang sudah ada."
                    : "Isi detail iuran warga untuk menambahkan tagihan baru ke sistem."
                  }
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto">
                {iuranError && (
                  <div className="px-4 py-2">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                      {iuranError}
                    </div>
                  </div>
                )}
                <div className="grid gap-4 py-4 px-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Peserta *
                    </Label>

                    <MultiSelect
                      options={userPermissionsByCluster.map((userPerms) => ({
                        value: userPerms.profile.fullname,
                        label: userPerms.profile.fullname
                      }))}
                      selected={newPaymentForm.name}
                      onChange={(selected) => updateNewPaymentForm("name", selected)}
                      placeholder={"Pilih Warga"} 
                    />
                  </div>

                  {/* Pembayaran */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Pembayaran *</Label>
                  <Input
                    id="nama_iuran"
                    value={newPaymentForm.nama_iuran}
                    onChange={(e) => updateNewPaymentForm("nama_iuran", e.target.value)}
                    disabled={editMode}
                  />
                </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueDate" className="text-sm font-medium">
                      Tanggal Jatuh Tempo *
                    </Label>
                    <div className="relative">
                      <Input
                        id="dueDate"
                        type="number"
                        value={newPaymentForm.dueDate}
                        onChange={(e) => updateNewPaymentForm("dueDate", e.target.value)}
                        disabled={editMode}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-sm font-medium">
                      Tanggal Mulai Iuran *
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !newPaymentForm.startDate && "text-muted-foreground"
                          )}
                          disabled={editMode}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newPaymentForm.startDate ? (
                            format(newPaymentForm.startDate, "PPP")
                          ) : (
                            <span>Pilih tanggal mulai</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      {!editMode && (
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newPaymentForm.startDate || undefined}
                            onSelect={(date) => updateNewPaymentForm("startDate", date)}
                            initialFocus
                          />
                        </PopoverContent>
                      )}
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-sm font-medium">
                      Tanggal Akhir Iuran *
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !newPaymentForm.endDate && "text-muted-foreground"
                          )}
                          disabled={editMode}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newPaymentForm.endDate ? (
                            format(newPaymentForm.endDate, "PPP")
                          ) : (
                            <span>Pilih tanggal akhir</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      {!editMode && (
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newPaymentForm.endDate || undefined}
                            onSelect={(date) => updateNewPaymentForm("endDate", date)}
                            initialFocus
                          />
                        </PopoverContent>
                      )}
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-sm font-medium">
                      Nominal Iuran/per bulan/per orang *
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newPaymentForm.amount}
                      onChange={(e) =>
                        updateNewPaymentForm("amount", e.target.value)
                      }
                      disabled={editMode}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end px-4 py-4 border-t bg-white">
                <Button
                  onClick={editMode ? handleUpdateIuran : handleCreateIuran}
                  className="bg-black text-white hover:bg-black/90"
                  disabled={isCreating}
                >
                  {editMode ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isCreating ? "Menyimpan..." : "Simpan Perubahan"}
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      {isCreating ? "Membuat Iuran..." : "Buat Iuran"}
                    </>
                  )}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </>
    )
}