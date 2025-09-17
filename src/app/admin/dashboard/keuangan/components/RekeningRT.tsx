import { Card, CardContent } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit, Loader2, Search, Plus, CreditCard } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import { useEffect, useMemo, useState } from "react";
import CreateExpense from "./CreateExpense";
import { ClusterBankAccount } from "@/types/cluster_bank_accounts";
import { useClusterBankAccountsAdmin } from "@/hooks/useClusterBankAccountsAdmin";
import { useAuth } from "@/hooks/useAuth";
import PaginationComponent from "@/app/admin/dashboard/transaksi-warga/components/PaginationComponent";
import { TableEmptyState } from "@/components/ui/empty-state";

export default function RekeningRT() {
  const [searchTerm, setSearchTerm] = useState("");
  const [rekeningSheetOpen, setRekeningSheetOpen] = useState(false);
  const [editingRekening, setEditingRekening] = useState<ClusterBankAccount | null>(
    null
  );  
  const { bankAccounts, loading, updateClusterBankAccount, createClusterBankAccount } = useClusterBankAccountsAdmin();
  const { clusterId } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  const handleEditRekening = (rekening: ClusterBankAccount) => {
    setEditingRekening(rekening);
    setRekeningSheetOpen(true);
  }

  // Reset ke halaman pertama saat keyword pencarian berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredAccounts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const list = bankAccounts.filter((item) => item.cluster_id === clusterId);
    if (!term) return list;
    return list.filter((item) => {
      const fields = [
        item.account_name,
        item.bank_name,
        item.account_number,
        item.account_usage,
      ].map((v) => (v || "").toLowerCase());
      return fields.some((field) => field.includes(term));
    });
  }, [bankAccounts, clusterId, searchTerm]);

  const totalItems = filteredAccounts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAccounts = filteredAccounts.slice(startIndex, endIndex);

  // Jaga-jaga jika currentPage lebih besar dari totalPages setelah filter berubah
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Table Nomor Rekening</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Cari berdasarkan nama, nomor rekening, dll"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <Button
                size="sm"
                className="bg-black text-white hover:bg-black/90"
                onClick={() => {
                  setEditingRekening(null);
                  setRekeningSheetOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Rekening
              </Button>
              <CreateExpense
                open={rekeningSheetOpen}
                onOpenChange={setRekeningSheetOpen}
                createClusterBankAccount={createClusterBankAccount}
                updateClusterBankAccount={updateClusterBankAccount}
                editingRekening={editingRekening}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
              {loading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <>
                      <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <input type="checkbox" className="rounded" />
                </TableHead>
                <TableHead>Nama Rekening</TableHead>
                <TableHead>Nama Bank</TableHead>
                <TableHead>Nomor Rekening</TableHead>
                <TableHead>Kegunaan Rekening</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAccounts.length === 0 ? (
                <TableEmptyState
                  icon={<CreditCard className="h-12 w-12" />}
                  title="Belum ada rekening RT"
                  description="Tambahkan rekening bank untuk mengelola keuangan RT dengan lebih baik."
                  colSpan={6}
                />
              ) : (
                paginatedAccounts.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <input type="checkbox" className="rounded" />
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.account_name}
                    </TableCell>
                    <TableCell>{item.bank_name}</TableCell>
                    <TableCell>{item.account_number}</TableCell>
                    <TableCell>{item.account_usage}</TableCell>
                    <TableCell className="max-w-[20px]">
                      <div className="flex items-center space-x-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRekening(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
            </>
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
              onPageChange={(page) => setCurrentPage(page)}
              itemLabel="Rekening"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
