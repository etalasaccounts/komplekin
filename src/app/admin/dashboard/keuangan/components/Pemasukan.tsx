import { Card, CardContent } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, Search, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import { useState, useEffect } from "react";
import { PreviewImage } from "@/components/modal/previewImage";
import FilterComponent, {
  FilterState,
} from "@/components/filter/filterComponent";
import { AccountType, Ledger } from "@/types/ledger";
import { useLedger } from "@/hooks/useLedger";
import DetailLedgerModal from "./DetailLedgerModal";
import PaginationComponent from "../../transaksi-warga/components/PaginationComponent";
import { useAuth } from "@/hooks/useAuth";

export default function Pemasukan() {
  const { clusterId } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [transferReceiptModalOpen, setTransferReceiptModalOpen] =
    useState(false);
  const [selectedLedger, setSelectedLedger] = useState<Ledger | null>(null);
  const { ledgers, loading } = useLedger();
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: undefined,
    dateTo: undefined,
    status: "",
  });

  // Reset pagination ketika search term berubah
  useEffect(() => {
    setCurrentPage(1);
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
    let filtered = ledgers.filter(ledger => ledger.account_type === AccountType.REVENUE && ledger.invoice.cluster_id === clusterId);
    
    // Search filter - search di semua kolom kecuali tanggal dan bukti bayar
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(ledger => {
        const searchableFields = [
          ledger.invoice.user_permission?.profile.fullname || '',
          ledger.coa.name || '',
          ledger.amount?.toString() || '',
          ledger.invoice.payment_method || '',
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

  const handleApplyFilters = (newFilters: FilterState) => {
    setAppliedFilters(newFilters);
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

  return (
    <div className="space-y-6">
      {/* Table Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CardTitle>Table Pemasukan RT</CardTitle>
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
                  placeholder="Cari berdasarkan tanggal, nama, kategori, dll"
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
                hasUnappliedChanges={JSON.stringify(filters) !== JSON.stringify(appliedFilters)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <input type="checkbox" className="rounded" />
                </TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Pemasukkan</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Nominal</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead>Bukti Bayar</TableHead>
                <TableHead>Keterangan</TableHead>
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
                  <TableCell>{item.invoice.user_permission?.profile.fullname}</TableCell>
                  <TableCell>{item.coa.name}</TableCell>
                  <TableCell className="font-medium">{item.amount}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="text-xs font-semibold rounded-full"
                    >
                      {item.invoice.payment_method}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-black underline"
                      onClick={() => {
                        setTransferReceiptModalOpen(true);
                        setSelectedLedger(item);
                      }}
                    >
                      Lihat Bukti Transfer
                    </Button>
                  </TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="max-w-[30px]">
                    <div className="flex items-center space-x-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetail(item)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {/* <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button> */}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

          {/* Pagination */}
          <div className="mt-6">
            <PaginationComponent
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              startIndex={startIndex}
              endIndex={endIndex}
              onPageChange={setCurrentPage}
              itemLabel="List Pemasukan"
            />
          </div>
          </CardContent>
        </Card>

      <DetailLedgerModal
        selectedLedger={selectedLedger as Ledger}
        detailModalOpen={detailModalOpen}
        setDetailModalOpen={setDetailModalOpen}
      />
      
      {/* Preview Image Modal */}
      <PreviewImage
        open={transferReceiptModalOpen}
        onOpenChange={setTransferReceiptModalOpen}
        title="Bukti Transfer Bank"
        imageSrc={
          selectedLedger?.receipt
        }
        imageAlt={`Bukti Transfer Bank - ${
          selectedLedger?.invoice.user_permission?.profile.fullname || "Payment"
        }`}
      />
    </div>
  );
}
