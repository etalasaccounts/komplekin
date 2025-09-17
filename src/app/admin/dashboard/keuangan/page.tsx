"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  FileSpreadsheet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Pemasukan from "./components/Pemasukan";
import Pengeluaran from "./components/Pengeluaran";
import RekeningRT from "./components/RekeningRT";
import { useAuth } from "@/hooks/useAuth";
export default function KeuanganPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("pemasukan");
  const { profile } = useAuth();

  // Initialize tab from URL parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['pemasukan', 'pengeluaran', 'rekening-rt'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Handle tab change with URL update
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const currentParams = new URLSearchParams(searchParams);
    currentParams.set('tab', tab);
    router.push(`/admin/dashboard/keuangan?${currentParams.toString()}`);
  };

  return (
      <div className="space-y-6">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Transaksi Keuangan
          </h1>
          <p className="text-muted-foreground text-sm">
            Kelola status pembayaran, ubah nominal, dan sesuaikan jatuh tempo.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-1 p-1 w-fit">
            <Button
              variant="ghost"
              onClick={() => handleTabChange("pemasukan")}
              className={cn(
                "py-2 text-sm font-medium transition-colors rounded-none",
                activeTab === "pemasukan"
                  ? "bg-background text-foreground border-b border-b-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <TrendingDown className="size-4 mr-2" />
              Pemasukkan
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleTabChange("pengeluaran")}
              className={cn(
                "py-2 text-sm font-medium transition-colors rounded-none",
                activeTab === "pengeluaran"
                  ? "bg-background text-foreground border-b border-b-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <TrendingUp className="size-4 mr-2" />
              Pengeluaran
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleTabChange("rekening-rt")}
              className={cn(
                "py-2 text-sm font-medium transition-colors rounded-none",
                activeTab === "rekening-rt"
                  ? "bg-background text-foreground border-b border-b-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileSpreadsheet className="size-4 mr-2" />
              Rekening RT
            </Button>
          </div>
        </div>

        {activeTab === "pemasukan" && <Pemasukan />}

        {activeTab === "pengeluaran" && <Pengeluaran profile={profile} />}

        {activeTab === "rekening-rt" && <RekeningRT />}
      </div>
    
  );
}
