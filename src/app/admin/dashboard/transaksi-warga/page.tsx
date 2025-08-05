"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import StatusPembayaran from "./components/StatusPembayaranContainer";
import FilterComponent, {
  FilterState,
  StatusOption,
  IuranOption,
} from "@/components/filter/filterComponent";
import { ClipboardList, FileText, PiggyBank, Search } from "lucide-react";
import { useInvoices } from "@/hooks/useInvoices";
import { useIuran } from "@/hooks/useIuran";
import VerifikasiPembayaranContainer from "./components/VerifikasiPembayaranContainer";
import { InvoiceStatus, VerificationStatus } from "@/types/invoice";
import { toast } from "sonner";
import IuranContainer from "./components/IuranContainer";
import IuranWargaDrawer from "./components/IuranWargaDrawer";

const paymentStatusOptions: StatusOption[] = [
  { value: "all", label: "Semua Status" },
  { value: "sudah", label: "Sudah Bayar" },
  { value: "belum", label: "Belum Bayar" },
];

const verificationStatusOptions: StatusOption[] = [
  { value: "all", label: "Semua Status" },
  { value: "verified", label: "Terverifikasi" },
  { value: "unverified", label: "Belum Diverifikasi" },
  { value: "not_checked", label: "Belum Dicek" },
  { value: "pending", label: "Pending" },
];

export default function TransaksiWargaPage() {
  const [activeTab, setActiveTab] = useState("iuran");
  const [searchTerm, setSearchTerm] = useState("");
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: undefined,
    dateTo: undefined,
    status: "all",
    iuran: "all",
  });

  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    dateFrom: undefined,
    dateTo: undefined,
    status: "all",
    iuran: "all",
  });

  const { invoices, paidInvoices, invoiceByUserId, loading, createInvoice, handleDownload, updateInvoice, getInvoicesByUserId, createManualPayment } = useInvoices();
  
  const { iuran: iuranList } = useIuran();

  useEffect(() => {
    const resetFilters = {
      dateFrom: undefined,
      dateTo: undefined,
      status: "all",
      iuran: "all",
    };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
  }, [activeTab]);

  const iuranOptions: IuranOption[] = useMemo(() => {
    return iuranList.map((iuran) => ({
      value: iuran.id,
      label: iuran.name,
    }));
  }, [iuranList]);

  const handleResetFilters = () => {
    const resetFilters = {
      dateFrom: undefined,
      dateTo: undefined,
      status: "all",
      iuran: "all",
    };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    
    toast.success("Filter berhasil direset", {
      description: "Semua filter telah dihapus",
      duration: 3000,
    });
  };

  const filteredInvoices = useMemo(() => {
    console.log('Filtering invoices with:', {
      appliedFilters,
      totalInvoices: invoices.length,
      iuranFilter: appliedFilters.iuran
    });
    
    return invoices.filter((invoice) => {
      if (appliedFilters.dateFrom && invoice.payment_date) {
        const paymentDate = new Date(invoice.payment_date);
        if (paymentDate < appliedFilters.dateFrom) return false;
      }
      if (appliedFilters.dateTo && invoice.payment_date) {
        const paymentDate = new Date(invoice.payment_date);
        if (paymentDate > appliedFilters.dateTo) return false;
      }

      if (appliedFilters.status && appliedFilters.status !== "all") {
        if (appliedFilters.status === "sudah" && invoice.invoice_status !== InvoiceStatus.PAID) {
          return false;
        }
        if (appliedFilters.status === "belum" && invoice.invoice_status !== InvoiceStatus.UNPAID) {
          return false;
        }
      }

      if (appliedFilters.iuran && appliedFilters.iuran !== "all") {
        console.log('Checking iuran filter:', {
          invoiceIuran: invoice.iuran,
          filterIuran: appliedFilters.iuran,
          matches: invoice.iuran === appliedFilters.iuran
        });
        if (invoice.iuran !== appliedFilters.iuran) {
          return false;
        }
      }

      return true;
    });
  }, [invoices, appliedFilters]);

  const filteredPaidInvoices = useMemo(() => {
    return paidInvoices.filter((invoice) => {
      if (appliedFilters.dateFrom && invoice.payment_date) {
        const paymentDate = new Date(invoice.payment_date);
        if (paymentDate < appliedFilters.dateFrom) return false;
      }
      if (appliedFilters.dateTo && invoice.payment_date) {
        const paymentDate = new Date(invoice.payment_date);
        if (paymentDate > appliedFilters.dateTo) return false;
      }

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

      if (appliedFilters.iuran && appliedFilters.iuran !== "all") {
        if (invoice.iuran !== appliedFilters.iuran) {
          return false;
        }
      }

      return true;
    });
  }, [paidInvoices, appliedFilters]);

  const handleApplyFilters = (newFilters: FilterState) => {
    setAppliedFilters(newFilters);
    
    const activeFilters = [];
    if (newFilters.dateFrom || newFilters.dateTo) activeFilters.push("Tanggal");
    if (newFilters.status && newFilters.status !== "all") activeFilters.push("Status");
    if (newFilters.iuran && newFilters.iuran !== "all") activeFilters.push("Iuran");
    
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

  const hasUnappliedChanges = JSON.stringify(filters) !== JSON.stringify(appliedFilters);

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

  const enableIuranFilter = activeTab === "status" || activeTab === "verifikasi";

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Transaksi Warga</h1>
        <p className="text-sm text-muted-foreground">
          Data lengkap iuran warga berdasarkan bulan, nominal, dan status
          pembayaran
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex space-x-1 p-1 w-fit">
          <Button 
          variant="ghost" 
          onClick={() => setActiveTab("iuran")} 
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors rounded-none",
            activeTab === "iuran"
              ? "bg-background text-foreground border-b border-b-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}>
            <PiggyBank className="size-4 mr-2" />
            Iuran
          </Button>
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
            enableIuranFilter={enableIuranFilter}
            iuranOptions={iuranOptions}
          />
          {activeTab === "iuran" && (
            <IuranWargaDrawer
              createSheetOpen={createSheetOpen}
              setCreateSheetOpen={setCreateSheetOpen}
              createInvoice={createInvoice}
            />
          )}
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
      {activeTab === "iuran" && (
        <IuranContainer />
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
