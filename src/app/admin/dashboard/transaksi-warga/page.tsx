"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import StatusPembayaran from "./components/StatusPembayaranContainer";
import FilterComponent, {
  FilterState,
} from "@/components/filter/filterComponent";
import CreateTransaksiWargaDrawer from "./components/CreateTransaksiWargaDrawer";
import { ClipboardList, FileText, Search } from "lucide-react";
import { useInvoices } from "@/hooks/useInvoices";
import VerifikasiPembayaranContainer from "./components/VerifikasiPembayaranContainer";
import { InvoiceStatus, VerificationStatus } from "@/types/invoice";
import { toast } from "sonner";

export default function TransaksiWargaPage() {
  const [activeTab, setActiveTab] = useState("status");
  const [searchTerm, setSearchTerm] = useState("");
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: undefined,
    dateTo: undefined,
    status: "",
    verificationStatus: "",
  });

  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    dateFrom: undefined,
    dateTo: undefined,
    status: "",
    verificationStatus: "",
  });

  // Pindahkan hook ke parent component
  const { invoices, paidInvoices, invoiceByUserId, loading, createInvoice, handleDownload, updateInvoice, getInvoicesByUserId, createManualPayment } = useInvoices();

  const handleResetFilters = () => {
    const resetFilters = {
      dateFrom: undefined,
      dateTo: undefined,
      status: "",
      verificationStatus: "",
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
      if (appliedFilters.status) {
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
      if (appliedFilters.status) {
        if (appliedFilters.status === "sudah" && invoice.invoice_status !== InvoiceStatus.PAID) {
          return false;
        }
        if (appliedFilters.status === "belum" && invoice.invoice_status !== InvoiceStatus.UNPAID) {
          return false;
        }
      }

      // Verification status filter
      if (appliedFilters.verificationStatus && appliedFilters.verificationStatus !== "semua") {
        if (appliedFilters.verificationStatus === "verified" && invoice.verification_status !== VerificationStatus.VERIFIED) {
          return false;
        }
        if (appliedFilters.verificationStatus === "unverified" && invoice.verification_status !== VerificationStatus.UNVERIFIED) {
          return false;
        }
        if (appliedFilters.verificationStatus === "not_checked" && invoice.verification_status !== VerificationStatus.NOT_YET_CHECKED) {
          return false;
        }
        if (appliedFilters.verificationStatus === "pending" && invoice.verification_status !== "PENDING") {
          return false;
        }
      }

      return true;
    });
  }, [paidInvoices, appliedFilters]);

  const handleApplyFilters = () => {
    // Apply the current filters to the applied filters state
    setAppliedFilters(filters);
    
    // Show success toast
    const activeFilters = [];
    if (filters.dateFrom || filters.dateTo) activeFilters.push("Tanggal");
    if (filters.status) activeFilters.push("Status Pembayaran");
    if (filters.verificationStatus) activeFilters.push("Status Verifikasi");
    
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
    
    console.log("Filters applied:", filters);
  };

  // Check if there are unapplied filter changes
  const hasUnappliedChanges = JSON.stringify(filters) !== JSON.stringify(appliedFilters);


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
            setFilters={(filters) => setFilters(filters)}
            handleApplyFilters={handleApplyFilters}
            handleResetFilters={handleResetFilters}
            showVerificationFilter={activeTab === "verifikasi"}
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
