"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import StatusPembayaran from "./components/StatusPembayaranContainer";
import FilterComponent, {
  FilterState,
  StatusOption,
} from "@/components/filter/filterComponent";
import CreateTransaksiWargaDrawer from "./components/CreateTransaksiWargaDrawer";
import { ClipboardList, FileText, Search } from "lucide-react";
import { useInvoices } from "@/hooks/useInvoices";
import VerifikasiPembayaranContainer from "./components/VerifikasiPembayaranContainer";
import { InvoiceStatus, VerificationStatus } from "@/types/invoice";
import { toast } from "sonner";

// Status options untuk tab Status Pembayaran
const paymentStatusOptions: StatusOption[] = [
  { value: "all", label: "Semua Status" },
  { value: "sudah", label: "Sudah Bayar" },
  { value: "belum", label: "Belum Bayar" },
];

// Status options untuk tab Verifikasi Pembayaran
const verificationStatusOptions: StatusOption[] = [
  { value: "all", label: "Semua Status" },
  { value: "verified", label: "Terverifikasi" },
  { value: "unverified", label: "Belum Diverifikasi" },
  { value: "not_checked", label: "Belum Dicek" },
  { value: "pending", label: "Pending" },
];

export default function TransaksiWargaPage() {
  const [activeTab, setActiveTab] = useState("status");
  const [searchTerm, setSearchTerm] = useState("");
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: undefined,
    dateTo: undefined,
    status: "all",
  });

  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    dateFrom: undefined,
    dateTo: undefined,
    status: "all",
  });

  // Pindahkan hook ke parent component
  const { invoices, paidInvoices, invoiceByUserId, loading, createInvoice, handleDownload, updateInvoice, getInvoicesByUserId, createManualPayment } = useInvoices();

  // Reset filter setiap kali tab berubah
  useEffect(() => {
    const resetFilters = {
      dateFrom: undefined,
      dateTo: undefined,
      status: "all",
    };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
  }, [activeTab]);

  const handleResetFilters = () => {
    const resetFilters = {
      dateFrom: undefined,
      dateTo: undefined,
      status: "all",
    };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    
    toast.success("Filter berhasil direset", {
      description: "Semua filter telah dihapus",
      duration: 3000,
    });
  };

  // Filter logic for invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      // Date range filter
      if (appliedFilters.dateFrom && invoice.payment_date) {
        const paymentDate = new Date(invoice.payment_date);
        if (paymentDate < appliedFilters.dateFrom) return false;
      }
      if (appliedFilters.dateTo && invoice.payment_date) {
        const paymentDate = new Date(invoice.payment_date);
        if (paymentDate > appliedFilters.dateTo) return false;
      }

      // Status filter
      if (appliedFilters.status && appliedFilters.status !== "all") {
        if (appliedFilters.status === "sudah" && invoice.invoice_status !== InvoiceStatus.PAID) {
          return false;
        }
        if (appliedFilters.status === "belum" && invoice.invoice_status !== InvoiceStatus.UNPAID) {
          return false;
        }
      }

      return true;
    });
  }, [invoices, appliedFilters]);

  // Filter logic for paid invoices (verification)
  const filteredPaidInvoices = useMemo(() => {
    return paidInvoices.filter((invoice) => {
      // Date range filter
      if (appliedFilters.dateFrom && invoice.payment_date) {
        const paymentDate = new Date(invoice.payment_date);
        if (paymentDate < appliedFilters.dateFrom) return false;
      }
      if (appliedFilters.dateTo && invoice.payment_date) {
        const paymentDate = new Date(invoice.payment_date);
        if (paymentDate > appliedFilters.dateTo) return false;
      }

      // Status filter for verification
      if (appliedFilters.status && appliedFilters.status !== "all") {
        if (appliedFilters.status === "verified" && invoice.verification_status !== VerificationStatus.VERIFIED) {
          return false;
        }
        if (appliedFilters.status === "unverified" && invoice.verification_status !== VerificationStatus.UNVERIFIED) {
          return false;
        }
        if (appliedFilters.status === "not_checked" && invoice.verification_status !== VerificationStatus.NOT_YET_CHECKED) {
          return false;
        }
        if (appliedFilters.status === "pending" && invoice.verification_status !== "PENDING") {
          return false;
        }
      }

      return true;
    });
  }, [paidInvoices, appliedFilters]);

  const handleApplyFilters = (newFilters: FilterState) => {
    // Apply the new filters to the applied filters state
    setAppliedFilters(newFilters);
    
    // Show success toast
    const activeFilters = [];
    if (newFilters.dateFrom || newFilters.dateTo) activeFilters.push("Tanggal");
    if (newFilters.status && newFilters.status !== "all") activeFilters.push("Status");
    
    if (activeFilters.length > 0) {
      toast.success("Filter berhasil diterapkan", {
        description: `Filter aktif: ${activeFilters.join(", ")}`,
        duration: 3000,
      });
    } else {
      toast.success("Filter berhasil direset", {
        description: "Semua filter telah dihapus",
        duration: 3000,
      });
    }
    
    console.log("Filters applied:", newFilters);
  };

  // Check if there are unapplied filter changes
  const hasUnappliedChanges = JSON.stringify(filters) !== JSON.stringify(appliedFilters);

  // Get current status options and label based on active tab
  const getCurrentFilterConfig = () => {
    if (activeTab === "status") {
      return {
        statusOptions: paymentStatusOptions,
        statusLabel: "Status Pembayaran",
      };
    } else {
      return {
        statusOptions: verificationStatusOptions,
        statusLabel: "Status Verifikasi",
      };
    }
  };

  const { statusOptions, statusLabel } = getCurrentFilterConfig();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Transaksi Warga</h1>
        <p className="text-sm text-muted-foreground">
          Data lengkap iuran warga berdasarkan bulan, nominal, dan status
          pembayaran
        </p>
      </div>

      {/* Tabs */}

      <div className="flex items-center justify-between">
        <div className="flex space-x-1 p-1 w-fit">
          <Button
            variant="ghost"
            onClick={() => setActiveTab("status")}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors rounded-none",
              activeTab === "status"
                ? "bg-background text-foreground border-b border-b-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ClipboardList className="size-4 mr-2" />
            Status Pembayaran
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab("verifikasi")}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors rounded-none",
              activeTab === "verifikasi"
                ? "bg-background text-foreground border-b border-b-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FileText className="size-4 mr-2" />
            Verifikasi Pembayaran
          </Button>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari berdasarkan nama, nomor rumah, dll"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          <FilterComponent
            filters={filters}
            setFilters={setFilters}
            handleApplyFilters={handleApplyFilters}
            handleResetFilters={handleResetFilters}
            statusOptions={statusOptions}
            statusLabel={statusLabel}
            hasUnappliedChanges={hasUnappliedChanges}
          />
          <CreateTransaksiWargaDrawer
            createSheetOpen={createSheetOpen}
            setCreateSheetOpen={setCreateSheetOpen}
            createInvoice={createInvoice}
          />
        </div>
      </div>
      {activeTab === "status" && (
        <StatusPembayaran 
          searchTerm={searchTerm} 
          invoices={filteredInvoices}
          loading={loading}
          handleDownload={handleDownload}
        />
      )}
      {activeTab === "verifikasi" && (
        <VerifikasiPembayaranContainer
          searchTerm={searchTerm} 
          paidInvoices={filteredPaidInvoices}
          loading={loading}
          updateInvoice={updateInvoice}
          getInvoicesByUserId={getInvoicesByUserId}
          invoiceByUserId={invoiceByUserId}
          createManualPayment={createManualPayment}
        />
      )}
    </div>
  );
}
