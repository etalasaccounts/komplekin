"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Megaphone, User, ArrowRight, Activity } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Unpaid Bill Alert */}
      <Card className="bg-[#D5E2FF] border-[#182F8B] text-[#182F8B] p-4 overflow-hidden">
        <CardContent className="p-0">
          <div className="flex justify-between">
            <div className="flex items-start space-x-2 w-fit">
              <Megaphone className="w-5 h-5" />
              <div>
                <p className="font-semibold text-sm">Tagihan Belum Dibayar</p>
                <p className="text-xs mt-2">
                  Anda mempunyai tagihan untuk bulan juli 2025 yang belum
                  dibayar
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-sm font-medium rounded-lg border border-[#182F8B] hover:bg-[#182F8B] hover:text-white"
            >
              Bayar Sekarang
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Iuran Belum Dibayar */}
      <Card
        className="bg-white gap-4 pt-4 pb-0 hover:cursor-pointer hover:scale-102 transition-all duration-300"
        onClick={() => router.push("/user/dashboard/iuran-bulanan")}
      >
        <CardHeader className="flex flex-row gap-3 items-center justify-start px-4">
          <div className="w-8 h-8 bg-[#E9358F] rounded-lg flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <CardTitle className="text-base font-medium">
            Iuran Belum Dibayar
          </CardTitle>
        </CardHeader>
        <CardContent className="mt-0">
          <div className="text-2xl font-bold mb-2">2</div>
          <p className="text-xs text-muted-foreground">
            Segera lakukan pembayaran untuk menghindari denda.
          </p>
        </CardContent>
        <div className="border-t text-xs border-border flex gap-2 justify-center items-center py-3 text-medium">
          <p>Lihat Tagihan</p>
          <ArrowRight className="h-4 w-4" />
        </div>
      </Card>

      {/* Iuran Sudah Dibayar */}
      <Card
        className="bg-white gap-4 pt-4 pb-3 hover:cursor-pointer hover:scale-102 transition-all duration-300"
        onClick={() => router.push("/user/dashboard/riwayat-pembayaran")}
      >
        <CardHeader className="flex flex-row gap-3 items-center justify-start px-4">
          <div className="w-8 h-8 bg-[#1DAF9C] rounded-lg flex items-center justify-center">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <CardTitle className="text-base font-medium">
            Iuran Sudah Dibayar
          </CardTitle>
        </CardHeader>
        <CardContent className="mt-0">
          <div className="text-2xl font-bold mb-2">4</div>
          <p className="text-xs text-muted-foreground">
            Riwayat pembayaran tersedia.
          </p>
        </CardContent>
        <div className="border-t text-xs border-border flex gap-2 justify-center items-center pt-3 text-medium">
          <p>Lihat Riwayat</p>
          <ArrowRight className="h-4 w-4" />
        </div>
      </Card>
    </div>
  );
}
