"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FilterComponent, {
  FilterState,
  StatusOption,
} from "@/components/filter/filterComponent";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Download, ReceiptText, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useDetailedInvoices,
  DetailedInvoice,
} from "@/hooks/useDetailedInvoices";
import { toast } from "sonner";

export default function RiwayatPembayaranPage() {
  const formatDateCompact = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

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

  const [filters, setFilters] = useState<FilterState>({
    dateFrom: undefined,
    dateTo: undefined,
    status: "all",
  });

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedIuran, setSelectedIuran] = useState<DetailedInvoice | null>(
    null
  );

  const {
    invoices: allInvoices,
    loading,
    error,
    refetch,
  } = useDetailedInvoices();

  const handleViewDetail = (item: DetailedInvoice) => {
    setSelectedIuran(item);
    setDetailModalOpen(true);
  };

  const handleDownloadReceipt = async (item: DetailedInvoice) => {
    try {
      if (!item.buktiBayar) {
        toast.error("Bukti Pembayaran Tidak Tersedia", {
          description: "File bukti pembayaran tidak ditemukan",
        });
        return;
      }

      // Show loading toast
      const loadingToast = toast.loading("Mengunduh bukti pembayaran...");

      try {
        // Fetch the file to check if it exists and get the correct file extension
        const response = await fetch(item.buktiBayar);

        if (!response.ok) {
          throw new Error("File tidak dapat diakses");
        }

        // Get file extension from content type or URL
        const contentType = response.headers.get("content-type");
        let fileExtension = "jpg"; // default

        if (contentType) {
          if (contentType.includes("png")) fileExtension = "png";
          else if (contentType.includes("pdf")) fileExtension = "pdf";
          else if (contentType.includes("jpeg")) fileExtension = "jpg";
        } else {
          // Try to get extension from URL
          const urlParts = item.buktiBayar.split(".");
          if (urlParts.length > 1) {
            fileExtension = urlParts[urlParts.length - 1];
          }
        }

        // Create blob from response
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        // Create download link
        const link = document.createElement("a");
        link.href = url;
        link.download = `Bukti-Pembayaran-${item.keterangan.replace(
          /\s+/g,
          "-"
        )}.${fileExtension}`;

        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the blob URL
        window.URL.revokeObjectURL(url);

        // Dismiss loading toast and show success
        toast.dismiss(loadingToast);
        toast.success("Bukti Pembayaran Berhasil Diunduh", {
          description: `File ${item.keterangan} telah diunduh`,
        });
      } catch (fetchError) {
        // Dismiss loading toast
        toast.dismiss(loadingToast);

        console.warn(
          "Failed to fetch file, using fallback download:",
          fetchError
        );

        // Fallback to direct link if fetch fails
        const link = document.createElement("a");
        link.href = item.buktiBayar;
        link.download = `Bukti-Pembayaran-${item.keterangan.replace(
          /\s+/g,
          "-"
        )}.jpg`;
        link.target = "_blank";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Bukti Pembayaran Berhasil Diunduh", {
          description: `File ${item.keterangan} telah diunduh`,
        });
      }
    } catch (error) {
      console.error("Error downloading receipt:", error);
      toast.error("Gagal Mengunduh", {
        description: "Terjadi kesalahan saat mengunduh bukti pembayaran",
      });
    }
  };

  // Custom status options for payment history page
  const paymentHistoryStatusOptions: StatusOption[] = [
    { value: "all", label: "Semua Status" },
    { value: "lunas", label: "Lunas" },
  ];

  // Filter to show only fully paid and verified invoices
  const paidInvoices = allInvoices.filter(
    (invoice) =>
      invoice.status === "Lunas" &&
      invoice.originalData.verification_status === "Terverifikasi"
  );

  // Apply additional filters to paid invoices
  const filteredInvoices = paidInvoices.filter((item) => {
    let matchesFilter = true;

    // Status filter
    if (filters.status && filters.status !== "all") {
      if (!item.status.toLowerCase().includes(filters.status.toLowerCase())) {
        matchesFilter = false;
      }
    }

    // Date filters - use payment date for payment history
    if (filters.dateFrom || filters.dateTo) {
      const itemDate = item.tanggalBayar
        ? new Date(item.originalData.payment_date!)
        : new Date(item.originalData.due_date);

      if (filters.dateFrom && itemDate < filters.dateFrom) {
        matchesFilter = false;
      }

      if (filters.dateTo && itemDate > filters.dateTo) {
        matchesFilter = false;
      }
    }

    return matchesFilter;
  });

  const handleApplyFilters = (newFilters: FilterState) => {
    // Calculate the count with the new filters being applied
    const currentFilteredCount = paidInvoices.filter((item) => {
      let matchesFilter = true;

      // Status filter
      if (newFilters.status && newFilters.status !== "all") {
        if (
          !item.status.toLowerCase().includes(newFilters.status.toLowerCase())
        ) {
          matchesFilter = false;
        }
      }

      // Date filters - use payment date for payment history
      if (newFilters.dateFrom || newFilters.dateTo) {
        const itemDate = item.tanggalBayar
          ? new Date(item.originalData.payment_date!)
          : new Date(item.originalData.due_date);

        if (newFilters.dateFrom && itemDate < newFilters.dateFrom) {
          matchesFilter = false;
        }

        if (newFilters.dateTo && itemDate > newFilters.dateTo) {
          matchesFilter = false;
        }
      }

      return matchesFilter;
    }).length;

    toast.success("Filter Diterapkan", {
      description: `Menampilkan ${currentFilteredCount} hasil`,
    });
  };

  const handleResetFilters = () => {
    setFilters({
      dateFrom: undefined,
      dateTo: undefined,
      status: "all",
    });
    toast.success("Filter Direset", {
      description: "Semua filter telah dihapus",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <p className="text-xl font-medium">Riwayat Pembayaran Iuran</p>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <p className="text-xl font-medium">Riwayat Pembayaran Iuran</p>
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
      <p className="text-xl font-medium">Riwayat Pembayaran Iuran</p>
      <div className="flex justify-end">
        <FilterComponent
          filters={filters}
          setFilters={(filters) => setFilters(filters)}
          handleApplyFilters={handleApplyFilters}
          handleResetFilters={handleResetFilters}
          statusOptions={paymentHistoryStatusOptions}
        />
      </div>

      {filteredInvoices.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Tidak ada riwayat pembayaran ditemukan
          </p>
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
                    Dibayar:{" "}
                    <span>
                      {item.originalData.payment_date
                        ? formatDateCompact(item.originalData.payment_date)
                        : formatDateCompact(item.originalData.due_date)}
                    </span>
                  </p>
                </div>
                <p className="text-2xl font-semibold">{item.nominal}</p>
                <div className="flex items-center justify-end mt-4">
                  <Button
                    className="text-sm font-medium rounded-lg"
                    onClick={() => handleViewDetail(item)}
                  >
                    <ReceiptText className="w-4 h-4" />
                    Lihat Bukti Bayar
                  </Button>
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
              Detail Bukti Pembayaran
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
              {/* Nama Iuran */}
              <div>
                <label className="text-sm text-gray-500">Nama Iuran</label>
                <p className="text-sm text-black">{selectedIuran.keterangan}</p>
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
                <p className="text-sm text-black">{selectedIuran.metode}</p>
              </div>

              {/* Tanggal Bayar */}
              <div>
                <label className="text-sm text-gray-500">Tanggal Bayar</label>
                <p className="text-sm text-black">
                  {selectedIuran.originalData.payment_date
                    ? formatDateCompact(selectedIuran.originalData.payment_date)
                    : "Belum dibayar"}
                </p>
              </div>

              <div className="flex justify-end mt-10">
                <Button
                  className="w-fit px-2 bg-black text-white hover:bg-black/90"
                  size="icon"
                  onClick={() =>
                    selectedIuran && handleDownloadReceipt(selectedIuran)
                  }
                >
                  <Download className="w-4 h-4" />
                  Unduh Bukti Pembayaran
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
