import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Megaphone } from "lucide-react";

export default function DashboardPage() {
  return (
      <div className="space-y-6">
        {/* Unpaid Bill Alert */}
        <Card className="border-[#A8A8A8] p-0 overflow-hidden">
          <CardContent className="p-0">
            <div className="flex justify-between pb-4 bg-[#F9F9F9] p-4 border-b border-[#CCCCCC]">
              <div className="flex items-center space-x-2 w-fit">
                <Megaphone className="w-5 h-5 mt-1" />
                <div>
                  <p className="font-medium text-xs text-foreground">
                    Tagihan Belum Dibayar
                  </p>
                </div>
              </div>
              <p className="text-xs font-semibold border rounded-xl px-2 py-1">
                25 Juli 2025
              </p>
            </div>

            <div className="w-fit px-4 py-2">
              <p className="text-sm mt-1">
                Kamu masih memiliki iuran sebesar Rp150.000 untuk bulan Juni
                2025.
              </p>
              <div className="flex justify-end">
                <Button
                  size="sm"
                  className="my-2 text-sm font-medium rounded-lg"
                >
                  Bayar Sekarang
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Outstanding Dues Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Kumpulan Iuran Tertunggak
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* July 2025 */}
            <div className="flex flex-col border rounded-lg p-4 gap-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">23 Juli 2025</span>
                <Badge className="text-xs font-semibold rounded-full bg-[#D02533] text-white">
                  Belum dibayar
                </Badge>
              </div>
              <div className="flex flex-col">
                <p className="text-sm text-muted-foreground mb-2">
                  20 hari menuju jatuh tempo
                </p>
                <p className="text-2xl font-semibold">Rp120.000</p>
                <div className="flex items-center justify-end">
                  <Button className="text-sm font-medium rounded-lg">
                    Bayar Sekarang
                  </Button>
                </div>
              </div>
            </div>

            {/* June 2025 */}
            <div className="flex flex-col border rounded-lg p-4 gap-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">23 Juni 2025</span>
                <Badge className="text-xs font-semibold rounded-full bg-[#D02533] text-white">
                  Belum dibayar
                </Badge>
              </div>
              <div className="flex flex-col">
                <p className="text-sm text-muted-foreground mb-2">
                  20 hari menuju jatuh tempo
                </p>
                <p className="text-2xl font-semibold">Rp120.000</p>
                <div className="flex items-center justify-end">
                  <Button className="text-sm font-medium rounded-lg">
                    Bayar Sekarang
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Outstanding Dues Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Riwayat Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* July 2025 */}
            <div className="flex flex-col border rounded-lg p-4 gap-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">23 Juli 2025</span>
                <Badge className="text-xs font-semibold rounded-full bg-[#178C4E] text-white">
                  Lunas
                </Badge>
              </div>
              <div className="flex flex-col">
                <p className="text-sm text-muted-foreground mb-2">
                  20 hari menuju jatuh tempo
                </p>
                <p className="text-2xl font-semibold">Rp120.000</p>
              </div>
            </div>

            {/* June 2025 */}
            <div className="flex flex-col border rounded-lg p-4 gap-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">23 Juli 2025</span>
                <Badge className="text-xs font-semibold rounded-full bg-[#178C4E] text-white">
                  Lunas
                </Badge>
              </div>
              <div className="flex flex-col">
                <p className="text-sm text-muted-foreground mb-2">
                  20 hari menuju jatuh tempo
                </p>
                <p className="text-2xl font-semibold">Rp120.000</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
