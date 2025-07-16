"use client";

import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  FileSpreadsheet,
  DollarSign,
  CreditCard,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Pemasukan from "./components/Pemasukan";
import Pengeluaran from "./components/Pengeluaran";
import RekeningRT from "./components/RekeningRT";
export default function KeuanganPage() {
  const [activeTab, setActiveTab] = useState("pemasukan");

  return (
    <AdminLayout>
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

        {(activeTab === "pemasukan" || activeTab === "pengeluaran") && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-start space-y-0 space-x-2 pb-2">
                  <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-base font-medium">
                    Total Saldo Utama
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">Rp30.000.000</div>
                  <p className="text-xs text-muted-foreground">
                    Lebih tinggi dari bulan lalu{" "}
                    <span className="text-green-600 bg-green-100 px-1 rounded py-1 ml-1">
                      +750rb
                    </span>
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-start space-y-0 space-x-2 pb-2">
                  <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-base font-medium">
                    Total Pemasukan Bulan Ini
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">Rp3.000.000</div>
                  <p className="text-xs text-muted-foreground">
                    Lebih rendah dari bulan lalu{" "}
                    <span className="text-red-600 bg-red-100 px-1 rounded py-1 ml-1">
                      -750rb
                    </span>
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-start space-y-0 space-x-2 pb-2">
                  <div className="w-8 h-8 bg-blue-400 rounded-lg flex items-center justify-center">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-base font-medium">
                    Jumlah Warga Sudah Bayar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">43 Warga</div>
                  <p className="text-xs text-muted-foreground">
                    Warga yang belum bayar{" "}
                    <span className="text-red-600 bg-red-100 px-1 rounded py-1 ml-1">
                      -85 warga
                    </span>
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Content based on active tab */}
        {activeTab === "pemasukan" && <Pemasukan />}

        {activeTab === "pengeluaran" && <Pengeluaran />}

        {activeTab === "rekening-rt" && <RekeningRT />}
      </div>
    </AdminLayout>
  );
}
