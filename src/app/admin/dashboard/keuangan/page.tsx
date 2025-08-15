"use client";

import React, { useState } from "react";
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
  const [activeTab, setActiveTab] = useState("pemasukan");
  const { profile } = useAuth();

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
              onClick={() => setActiveTab("pemasukan")}
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
              onClick={() => setActiveTab("pengeluaran")}
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
              onClick={() => setActiveTab("rekening-rt")}
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
