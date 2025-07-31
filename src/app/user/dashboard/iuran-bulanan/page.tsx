"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FilterComponent, {
  FilterState,
} from "@/components/filter/filterComponent";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, FileText, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import Pembayaran from "./components/Pembayaran";
import {
  useDetailedInvoices,
  DetailedInvoice,
} from "@/hooks/useDetailedInvoices";
import { toast } from "sonner";

export default function IuranBulananPage() {
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: undefined,
    dateTo: undefined,
    status: "",
  });

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedIuran, setSelectedIuran] = useState<DetailedInvoice | null>(
    null
  );
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const {
    invoices: iuranBulanan,
    loading,
    error,
    refetch,
  } = useDetailedInvoices();

  const badgeStatus = (status: string) => {
    if (status.includes("Menunggu Verifikasi")) {
      return "bg-[#FFEFCC] text-[#A78025]";
    }
    if (status.includes("Lunas")) {
      return "bg-[#C2F5DA] text-[#1A7544]";
    }
    if (status.includes("Terlambat")) {
      return "bg-[#FFD5D8] text-[#AD1F2B]";
    }
    return "bg-[#D02533]";
  };

  const handleViewDetail = (item: DetailedInvoice) => {
    setSelectedIuran(item);
    setDetailModalOpen(true);
  };

  const handlePayment = (item: DetailedInvoice) => {
    setSelectedIuran(item);
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    toast.success("Pembayaran Berhasil", {
      description: "Data pembayaran telah diperbarui",
    });
    refetch(); // Refresh the invoices list
  };

  // Apply filters to invoices
  const filteredInvoices = iuranBulanan
    // First filter to show only unpaid invoices (opposite of payment history)
    .filter((item) => item.status !== "Lunas")
    // Then apply user-selected filters
    .filter((item) => {
      let matchesFilter = true;

      // Status filter
      if (
        filters.status &&
        !item.status.toLowerCase().includes(filters.status.toLowerCase())
      ) {
        matchesFilter = false;
      }

      // Date filters
      if (filters.dateFrom || filters.dateTo) {
        const itemDate = new Date(item.originalData.due_date);

        if (filters.dateFrom && itemDate < filters.dateFrom) {
          matchesFilter = false;
        }

        if (filters.dateTo && itemDate > filters.dateTo) {
          matchesFilter = false;
        }
      }

      return matchesFilter;
    });

  const handleApplyFilters = () => {
    toast.success("Filter Diterapkan", {
      description: `Menampilkan ${filteredInvoices.length} hasil`,
    });
  };

  const handleResetFilters = () => {
    setFilters({
      dateFrom: undefined,
      dateTo: undefined,
      status: "",
    });
    toast.success("Filter Direset", {
      description: "Semua filter telah dihapus",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <p className="text-xl font-medium">Daftar Iuran Bulanan</p>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <p className="text-xl font-medium">Daftar Iuran Bulanan</p>
        <div className="text-center py-8">
          <p className="text-red-500">Error: {error}</p>
          <Button onClick={refetch} className="mt-4">
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-xl font-medium">Daftar Iuran Bulanan</p>
      <div className="flex justify-end">
        <FilterComponent
          filters={filters}
          setFilters={(filters) => setFilters(filters)}
          handleApplyFilters={handleApplyFilters}
          handleResetFilters={handleResetFilters}
        />
      </div>

      {filteredInvoices.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Tidak ada tagihan ditemukan</p>
        </div>
      ) : (
        filteredInvoices.map((item) => (
          <Card key={item.id} className="p-4 space-y-0 gap-3">
            <CardHeader className="p-0">
              <CardTitle className="text-xl font-semibold">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.keterangan}</span>
                  <Badge
                    className={`text-xs font-semibold rounded-full ${badgeStatus(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-0">
              <div className="flex flex-col">
                <div className="flex items-center gap-1 mb-2">
                  <Calendar className="w-4 h-4" />
                  <p className="text-xs">
                    Jatuh Tempo: <span>{item.jatuhTempo}</span>
                  </p>
                </div>
                <p className="text-2xl font-semibold">{item.nominal}</p>
                <div className="flex items-center justify-end mt-4">
                  {item.status === "Menunggu Verifikasi" && (
                    <Button
                      className="text-sm font-medium rounded-lg"
                      onClick={() => handleViewDetail(item)}
                    >
                      <FileText className="w-4 h-4" />
                      Lihat Detail
                    </Button>
                  )}
                  {(item.status.includes("Terlambat") ||
                    item.status === "Belum Bayar") && (
                    <Button
                      className="text-sm font-medium rounded-lg"
                      onClick={() => handlePayment(item)}
                    >
                      <DollarSign className="w-4 h-4" />
                      Lunasi Sekarang
                    </Button>
                  )}
                  {item.status === "Lunas" && (
                    <Button
                      variant="outline"
                      className="text-sm font-medium rounded-lg"
                      onClick={() => handleViewDetail(item)}
                    >
                      <FileText className="w-4 h-4" />
                      Lihat Detail
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-xs" showCloseButton={false}>
          <DialogHeader className="flex flex-row items-center justify-between p-0">
            <DialogTitle className="text-lg font-semibold">
              Detail Iuran
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0 rounded-md bg-red-100 hover:bg-red-200"
              onClick={() => setDetailModalOpen(false)}
            >
              <X className="h-4 w-4 text-red-600" />
            </Button>
          </DialogHeader>

          {selectedIuran && (
            <div className="space-y-4 pt-4">
              {/* Status Pembayaran */}
              <div>
                <label className="text-sm text-gray-500">
                  Status Pembayaran
                </label>
                <p className="text-sm text-black">{selectedIuran.status}</p>
              </div>

              {/* Total Pembayaran */}
              <div>
                <label className="text-sm text-gray-500">
                  Total Pembayaran
                </label>
                <p className="text-sm text-black">{selectedIuran.nominal}</p>
              </div>

              {/* Metode Pembayaran */}
              <div>
                <label className="text-sm text-gray-500">
                  Metode Pembayaran
                </label>
                <p className="text-sm text-black">
                  {selectedIuran.originalData.payment_method ||
                    "Transfer Bank BCA"}
                </p>
              </div>

              {/* Tanggal Bayar */}
              <div>
                <label className="text-sm text-gray-500">Tanggal Bayar</label>
                <p className="text-sm text-black">
                  {selectedIuran.tanggalBayar || "Belum dibayar"}
                </p>
              </div>

              {/* Bukti Bayar */}
              {selectedIuran.buktiBayar && (
                <div>
                  <label className="text-sm text-gray-500">Bukti Bayar</label>
                  <div className="mt-2">
                    <div className="w-full h-32 relative rounded-lg overflow-hidden bg-gray-50 border">
                      <Image
                        src={selectedIuran.buktiBayar}
                        alt="Bukti Pembayaran"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Pembayaran
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        selectedIuran={selectedIuran}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
