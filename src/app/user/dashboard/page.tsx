"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Megaphone, User, Activity, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import DashboardCard from "./components/DashboardCard";
import { useUserInvoices } from "@/hooks/useUserInvoices";

export default function DashboardPage() {
  const router = useRouter();
  const { statistics, loading, error } = useUserInvoices();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  const hasUnpaidBills = statistics.unpaid > 0;
  const hasOverdueBills = statistics.overdue > 0;

  return (
    <div className="space-y-6">
      {/* Unpaid Bill Alert - Always show */}
      <Card className="bg-[#D5E2FF] border-[#182F8B] text-[#182F8B] p-4 overflow-hidden">
        <CardContent className="p-0">
          <div className="flex justify-between">
            <div className="flex items-start space-x-2 w-fit">
              <Megaphone className="w-5 h-5" />
              <div>
                <p className="font-semibold text-sm">
                  {hasUnpaidBills
                    ? hasOverdueBills
                      ? "Tagihan Terlambat"
                      : "Tagihan Belum Dibayar"
                    : "Tagihan Terkini"}
                </p>
                <p className="text-xs mt-2">
                  {hasUnpaidBills
                    ? hasOverdueBills
                      ? `Anda memiliki ${statistics.overdue} tagihan yang sudah terlambat`
                      : `Anda memiliki ${statistics.unpaid} tagihan yang belum dibayar`
                    : "Semua tagihan sudah dibayar. Pantau terus tagihan terbaru Anda."}
                </p>
                {hasUnpaidBills && (
                  <p className="text-xs font-medium mt-1">
                    Total: Rp{" "}
                    {statistics.totalUnpaidAmount.toLocaleString("id-ID")}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-sm font-medium rounded-lg border border-[#182F8B] hover:bg-[#182F8B] hover:text-white"
              onClick={() => router.push("/user/dashboard/iuran-bulanan")}
            >
              {hasUnpaidBills ? "Bayar Sekarang" : "Lihat Tagihan"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Iuran Belum Dibayar */}
      <DashboardCard
        icon={hasOverdueBills ? AlertTriangle : User}
        title="Iuran Belum Dibayar"
        description={
          hasOverdueBills
            ? "Segera lakukan pembayaran untuk menghindari denda tambahan."
            : statistics.unpaid > 0
            ? "Segera lakukan pembayaran untuk menghindari denda."
            : "Semua tagihan sudah dibayar."
        }
        iconColor={hasOverdueBills ? "bg-[#DC2626]" : "bg-[#E9358F]"}
        count={statistics.unpaid}
        actionText="Lihat Tagihan"
        onClick={() => router.push("/user/dashboard/iuran-bulanan")}
      />

      {/* Iuran Sudah Dibayar */}
      <DashboardCard
        icon={Activity}
        title="Iuran Sudah Dibayar"
        description="Riwayat pembayaran tersedia."
        iconColor="bg-[#1DAF9C]"
        count={statistics.paid}
        actionText="Lihat Riwayat"
        onClick={() => router.push("/user/dashboard/riwayat-pembayaran")}
      />
    </div>
  );
}
