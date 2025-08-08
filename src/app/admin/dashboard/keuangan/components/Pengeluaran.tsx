import { Card, CardContent } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, Edit, X, Search, Plus, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { PreviewImage } from "@/components/modal/previewImage";
import FilterComponent, {
  FilterState,
} from "@/components/filter/filterComponent";
import { AccountType, Ledger, LedgerType } from "@/types/ledger";
import { useLedger } from "@/hooks/useLedger";
import DetailLedgerModal from "./DetailLedgerModal";
import PaginationComponent from "../../transaksi-warga/components/PaginationComponent";
import CreateExpenseDrawer from "./CreateExpenseDrawer";
import { ledgerService } from "@/services/ledgerService";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useUserPermission } from "@/hooks/useUserPermission";
import { UserPermissions } from "@/types/user_permissions";


interface PengeluaranProps {
  profile: { id: string; fullname: string; email: string } | null;
}

export default function Pengeluaran({ profile }: PengeluaranProps)  {
  const [searchTerm, setSearchTerm] = useState("");
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [transferReceiptModalOpen, setTransferReceiptModalOpen] = useState(false);
  const [selectedLedger, setSelectedLedger] = useState<Ledger | null>(null);
  const [expenseSheetOpen, setExpenseSheetOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Ledger | null>(null);
  const { ledgers, loading, fetchLedgers } = useLedger();
  const { clusterId } = useAuth();
  const { getUserPermissionByProfileId } = useUserPermission();
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: undefined,
    dateTo: undefined,
    status: "",
  });
  const [userPermission, setUserPermission] = useState<UserPermissions>({
    id: "",
    profile_id: "",
    role: "",
    created_at: "",
    updated_at: "",
    user_id: "",
    cluster_id: "",
    user_status: "",
    profile: {
      id: "",
      fullname: "",
      email: "",
      no_telp: "",
      address: "",
      house_type: "",
      house_number: "",
      ownership_status: "",
      head_of_family: "",
      emergency_job: "",
      moving_date: "",
      citizen_status: "",
      created_at: "",
      updated_at: "",
      file_ktp: "",
      file_kk: "",
      emergency_telp: "",
      work: "",
    },
  });
  const getUserPermission = async () => {
    const userPermission = await getUserPermissionByProfileId(profile?.id || "");
    setUserPermission(userPermission);
  }

  // Reset pagination ketika search term berubah
  useEffect(() => {
    setCurrentPage(1);
    getUserPermission();
  }, [searchTerm]); 
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Filter dan search state
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    dateFrom: undefined,
    dateTo: undefined,
    status: "",
  });
  
  // Filter data berdasarkan search term dan applied filters
  const getFilteredLedgers = () => {
    let filtered = ledgers.filter(ledger => ledger.account_type === AccountType.EXPENSE);
    
    // Search filter - search di semua kolom kecuali tanggal dan bukti bayar
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(ledger => {
        const searchableFields = [
          ledger.invoice?.user_permission?.profile.fullname || '',
          ledger.coa?.name || '',
          ledger.amount?.toString() || '',
          ledger.invoice?.payment_method || '',
          ledger.description || '',
        ];
        
        return searchableFields.some(field => 
          field.toLowerCase().includes(searchLower)
        );
      });
    }
    
    // Date filter
    if (appliedFilters.dateFrom) {
      filtered = filtered.filter(ledger => {
        const ledgerDate = new Date(ledger.date);
        return ledgerDate >= appliedFilters.dateFrom!;
      });
    }
    
    if (appliedFilters.dateTo) {
      filtered = filtered.filter(ledger => {
        const ledgerDate = new Date(ledger.date);
        return ledgerDate <= appliedFilters.dateTo!;
      });
    }
    
    return filtered;
  };
  
  const filteredLedgers = getFilteredLedgers();
  const totalItems = filteredLedgers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLedgers = filteredLedgers.slice(startIndex, endIndex);

  const handleViewDetail = (item: Ledger) => {
    setSelectedLedger(item);
    setDetailModalOpen(true);
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setCurrentPage(1); // Reset ke halaman pertama ketika filter diterapkan
  };

  const handleResetFilters = () => {
    setFilters({
      dateFrom: undefined,
      dateTo: undefined,
      status: "",
    });
    setAppliedFilters({
      dateFrom: undefined,
      dateTo: undefined,
      status: "",
    });
    setCurrentPage(1); // Reset ke halaman pertama ketika filter direset
  };

  const handleCreateExpense = () => {
    setEditingExpense(null);
    setExpenseSheetOpen(true);
  };

  const handleEditExpense = (item: Ledger) => {
    setEditingExpense(item);
    setExpenseSheetOpen(true);
  };

  const createLedger = async (expenseData: any): Promise<Ledger> => {
    try {
      const ledgerData: Partial<Ledger> & { receipt?: string | File } = {
        date: expenseData.tanggal?.toISOString(),
        description: expenseData.keterangan,
        amount: parseFloat(expenseData.nominal),
        account_type: AccountType.EXPENSE,
        coa_id: "c1a4073d-5b8e-4bc4-adf0-290b58194d2f",
        cluster_id: clusterId || "",
        user_id: userPermission.id,
        ledger_type: LedgerType.DEBIT,
        receipt: expenseData.buktiPembayaran, // This can be File or string
      };

      const createdLedger = await ledgerService.createLedger(ledgerData as Ledger & { receipt?: string | File });
      toast.success("Pengeluaran berhasil dibuat");
      await fetchLedgers(); // Refresh data
      return createdLedger;
    } catch (error) {
      console.error('Error creating ledger:', error);
      const errorMessage = error instanceof Error ? error.message : "Gagal membuat pengeluaran";
      toast.error(errorMessage);
      throw error;
    }
  };

  const updateLedger = async (id: string, expenseData: any): Promise<Ledger> => {
    try {
      const ledgerData: Partial<Ledger> & { receipt?: string | File } = {
        date: expenseData.tanggal?.toISOString(),
        description: expenseData.keterangan,
        amount: parseFloat(expenseData.nominal),
        receipt: expenseData.buktiPembayaran, // This can be File or string
      };

      const updatedLedger = await ledgerService.updateLedger(id, ledgerData as Ledger & { receipt?: string | File });
      toast.success("Pengeluaran berhasil diupdate");
      await fetchLedgers(); // Refresh data
      return updatedLedger;
    } catch (error) {
      console.error('Error updating ledger:', error);
      const errorMessage = error instanceof Error ? error.message : "Gagal mengupdate pengeluaran";
      toast.error(errorMessage);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* Table Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CardTitle>Table Pengeluaran RT</CardTitle>
              <Badge
                variant="outline"
                className="text-xs text-black rounded-full font-semibold"
              >
                Bulan Juli 2025
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Cari berdasarkan nama, kategori, nominal, dll"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <FilterComponent
                filters={filters}
                setFilters={(filters) => setFilters(filters)}
                handleApplyFilters={handleApplyFilters}
                handleResetFilters={handleResetFilters}
              />
                  <Button
                    size="sm"
                    className="bg-black text-white hover:bg-black/90"
                    onClick={handleCreateExpense}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Pengeluaran
                  </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : (
            <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <input type="checkbox" className="rounded" />
                </TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead>Nominal</TableHead>
                <TableHead>Dibayarkan Oleh</TableHead>
                <TableHead>Bukti Pembayaran</TableHead>
                    <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                  {currentLedgers.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <input type="checkbox" className="rounded" />
                  </TableCell>
                      <TableCell className="font-medium">
                        {item.date ? new Date(item.date).toLocaleDateString('id-ID') : '-'}
                      </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="text-xs font-semibold rounded-full"
                    >
                          {item.coa?.name || '-'}
                    </Badge>
                  </TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="font-medium">{item.amount}</TableCell>
                      <TableCell>{item.user_permission?.profile.fullname || '-'}</TableCell>
                  <TableCell>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-black underline"
                      onClick={() => {
                        setSelectedLedger(item)
                        setTransferReceiptModalOpen(true)
                      }}
                    >
                          Lihat Bukti Transfer
                    </Button>
                  </TableCell>
                  <TableCell className="max-w-[50px]">
                    <div className="flex items-center space-x-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetail(item)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditExpense(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
              <div className="mt-6">
                <PaginationComponent
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  startIndex={startIndex}
                  endIndex={endIndex}
                  onPageChange={(page) => setCurrentPage(page)}
                  itemLabel="Pengeluaran"
                />
            </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-4xl min-w-4xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
          <DialogHeader className="flex flex-row items-center justify-between p-6 bg-white sticky top-0 z-10">
            <DialogTitle className="text-xl font-bold">
              Detail Pengeluaran
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0"
              onClick={() => setDetailModalOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pt-0 p-6">
            {selectedLedger && (
              <div className="grid grid-cols-2 gap-8">
                {/* Left Column - Expense Details */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-500">Tanggal</label>
                      <p className="text-base font-medium text-black">
                        {selectedLedger.date ? new Date(selectedLedger.date).toLocaleDateString("id-ID") : '-'}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm text-gray-500">Kategori</label>
                      <p className="text-base font-medium text-black">
                        {selectedLedger.coa?.name || '-'}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm text-gray-500">
                        Keterangan
                      </label>
                      <p className="text-base font-medium text-black">
                        {selectedLedger.description}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm text-gray-500">Nominal</label>
                      <p className="text-base font-medium text-black">
                        {selectedLedger.amount}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column - Bukti Bayar */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">
                      Dibayarkan oleh
                    </label>
                    <p className="text-base font-medium text-black">
                      {selectedLedger?.user_permission?.profile.fullname || '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Bukti Bayar</label>
                    <div className="mt-2">
                      <div className="w-full h-80 relative rounded-lg overflow-hidden bg-gray-50 border">
                        <img
                          src="/images/bukti-pembayaran.png"
                          alt="Bukti Pembayaran"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Image Modal */}
      <PreviewImage
        open={transferReceiptModalOpen}
        onOpenChange={setTransferReceiptModalOpen}
        title="Bukti Transfer Bank"
        imageSrc={selectedLedger?.receipt}
        imageAlt={`Bukti Transfer Bank - ${selectedLedger?.invoice?.user_permission?.profile.fullname || "Payment"}`}
      />

      {/* Create/Edit Expense Drawer */}
      <CreateExpenseDrawer
        open={expenseSheetOpen}
        onOpenChange={setExpenseSheetOpen}
        editingExpense={editingExpense}
        createLedger={createLedger}
        updateLedger={updateLedger}
        userPermission={userPermission}
      />
    </div>
  );
}
