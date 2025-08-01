import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Bell, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import DetailTransaksiWargaModal from "./DetailTransaksiWargaModal";
import StatusPembayaranSkeleton from "./StatusPembayaranSkeleton";
import PaginationComponent from "./PaginationComponent";
import { Invoice, InvoiceStatus } from "@/types/invoice";
import React from "react";

type StatusPembayaranProps = {
  searchTerm: string;
  invoices: Invoice[];
  loading: boolean;
  handleDownload: (receipt: string) => Promise<void>;
};

export default function StatusPembayaran({
  searchTerm,
  invoices,
  loading,
  handleDownload,
}: StatusPembayaranProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice>();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredInvoices = invoices.filter((invoice) =>
    invoice.user_permission?.profile?.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.user_permission?.profile?.no_telp?.includes(searchTerm) ||
    invoice.user_permission?.profile?.house_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInvoices = filteredInvoices.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(
        currentInvoices.map((invoice) => invoice.id!)
      );
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter((item) => item !== id));
    }
  };

  const handleViewDetail = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDetailModalOpen(true);
  };

  const handleReminder = () => {
    toast.success("Notifikasi Terkirim", {
      description: "Warga telah menerima pengingat untuk membayar tagihan.",
      duration: 3000,
    });
  };

  // Reset to first page when search term changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    loading ? (
      <StatusPembayaranSkeleton />
    ) : (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-semibold text-foreground">
            Table Iuran Bulanan
          </h2>
          <p className="text-xs font-semibold border border-[#E4E4E7] rounded-full px-2 py-1">
          Bulan {new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card relative z-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 px-4">
                <Checkbox
                  checked={
                    filteredInvoices.length > 0 &&
                    selectedItems.length === filteredInvoices.length
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="text-muted-foreground text-sm font-medium">
                Nama Warga
              </TableHead>
              <TableHead className="text-muted-foreground text-sm font-medium">
                Kontak
              </TableHead>
              <TableHead className="text-muted-foreground text-sm font-medium">
                Nomor Rumah
              </TableHead>
              <TableHead className="text-muted-foreground text-sm font-medium">
                Tipe Rumah
              </TableHead>
              <TableHead className="text-muted-foreground text-sm font-medium">
                Jumlah Bayar
              </TableHead>
              <TableHead className="text-muted-foreground text-sm font-medium">
                Jatuh Tempo
              </TableHead>
              <TableHead className="text-muted-foreground text-sm font-medium">
                Tanggal Bayar
              </TableHead>
              <TableHead className="text-muted-foreground text-sm font-medium">
                Status Bayar
              </TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentInvoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="p-4">
                  <Checkbox
                    checked={selectedItems.includes(invoice.id!)}
                    onCheckedChange={(checked) =>
                      handleSelectItem(invoice.id!, checked as boolean)
                    }
                  />
                </TableCell>
                  <TableCell className="font-medium">
                    {invoice.user_permission?.profile?.fullname}
                  </TableCell>
                  <TableCell>{invoice.user_permission?.profile?.no_telp}</TableCell>
                  <TableCell>{invoice.user_permission?.profile?.house_number}</TableCell>
                  <TableCell>{invoice.user_permission?.profile?.house_type}</TableCell>
                <TableCell>{invoice.amount_paid || '-'}</TableCell>
                <TableCell>{invoice.due_date}</TableCell>
                <TableCell>{invoice.payment_date || '-'}</TableCell>
                <TableCell>
                  <Badge
                    variant="destructive"
                    className={
                      invoice.invoice_status === InvoiceStatus.PAID
                        ? "bg-[#178C4E] text-white rounded-full font-semibold text-xs"
                        : "bg-[#D02533] text-white rounded-full font-semibold text-xs"
                    }
                  >
                    {invoice.invoice_status === InvoiceStatus.PAID
                      ? "Sudah Bayar"
                      : "Belum Bayar"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {invoice.invoice_status === InvoiceStatus.PAID && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(invoice.receipt!)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    {invoice.invoice_status === InvoiceStatus.UNPAID && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReminder()}
                      >
                        <Bell className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetail(invoice)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <PaginationComponent
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredInvoices.length}
        itemsPerPage={itemsPerPage}
        startIndex={startIndex}
        endIndex={endIndex}
        onPageChange={handlePageChange}
        itemLabel="List Warga"
      />

      <DetailTransaksiWargaModal
        detailModalOpen={detailModalOpen}
        setDetailModalOpen={setDetailModalOpen}
        selectedInvoice={selectedInvoice!}
      />
    </div>
  )
);
}
