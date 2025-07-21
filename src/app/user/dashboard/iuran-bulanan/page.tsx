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

type IuranItem = {
  keterangan: string;
  jatuhTempo: string;
  status: string;
  nominal: string;
  metode: string;
  tanggalBayar: string;
  buktiBayar: string;
};

export default function IuranBulananPage() {
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: undefined,
    dateTo: undefined,
    status: "",
  });

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedIuran, setSelectedIuran] = useState<IuranItem | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

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

  const handleViewDetail = (item: IuranItem) => {
    setSelectedIuran(item);
    setDetailModalOpen(true);
  };

  const handlePayment = (item: IuranItem) => {
    setSelectedIuran(item);
    setPaymentModalOpen(true);
  };

  const iuranBulanan = [
    {
      keterangan: "Iuran Juli 2025",
      jatuhTempo: "23 Juli 2025",
      status: "Menunggu Verifikasi",
      nominal: "Rp120.000",
      metode: "Transfer",
      tanggalBayar: "23 Juli 2025",
      buktiBayar: "images/bukti-pembayaran.png",
    },
    {
      keterangan: "Iuran Juni 2025",
      jatuhTempo: "23 Juni 2025",
      status: "Terlambat 30 Hari",
      nominal: "Rp120.000",
      metode: "Transfer",
      tanggalBayar: "23 Juni 2025",
      buktiBayar: "images/bukti-pembayaran.png",
    },
    {
      keterangan: "Iuran Mei 2025",
      jatuhTempo: "23 Mei 2025",
      status: "Terlambat 30 Hari",
      nominal: "Rp120.000",
      metode: "Transfer",
      tanggalBayar: "23 Mei 2025",
      buktiBayar: "images/bukti-pembayaran.png",
    },
    {
      keterangan: "Iuran April 2025",
      jatuhTempo: "23 April 2025",
      status: "Terlambat 30 Hari",
      nominal: "Rp120.000",
      metode: "Transfer",
      tanggalBayar: "23 April 2025",
      buktiBayar: "images/bukti-pembayaran.png",
    },
  ];
  return (
    <div className="space-y-6">
      <p className="text-xl font-medium">Daftar Iuran Bulanan</p>
      <div className="flex justify-end">
        <FilterComponent
          filters={filters}
          setFilters={(filters) => setFilters(filters)}
          handleApplyFilters={() => {}}
          handleResetFilters={() => {}}
        />
      </div>
      {iuranBulanan.map((item) => (
        <Card key={item.jatuhTempo} className="p-4 space-y-0 gap-3">
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
                {item.status === "Terlambat 30 Hari" && (
                  <Button
                    className="text-sm font-medium rounded-lg"
                    onClick={() => handlePayment(item)}
                  >
                    <DollarSign className="w-4 h-4" />
                    Lunasi Sekarang
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

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

              {/* Tota Pembayaran */}
              <div>
                <label className="text-sm text-gray-500">Tota Pembayaran</label>
                <p className="text-sm text-black">{selectedIuran.nominal}</p>
              </div>

              {/* Metode Pembayaran */}
              <div>
                <label className="text-sm text-gray-500">
                  Metode Pembayaran
                </label>
                <p className="text-sm text-black">Transfer Bank BCA</p>
              </div>

              {/* Tanggal Bayar */}
              <div>
                <label className="text-sm text-gray-500">Tanggal Bayar</label>
                <p className="text-sm text-black">
                  {selectedIuran.tanggalBayar}
                </p>
              </div>

              {/* Bukti Bayar */}
              <div>
                <label className="text-sm text-gray-500">Bukti Bayar</label>
                <div className="mt-2">
                  <div className="w-full h-32 relative rounded-lg overflow-hidden bg-gray-50 border">
                    <Image
                      src={`/${selectedIuran.buktiBayar}`}
                      alt="Bukti Pembayaran"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Pembayaran
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        selectedIuran={selectedIuran}
      />
    </div>
  );
}
