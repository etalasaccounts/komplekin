import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, CreditCard, Activity } from "lucide-react";

export default function SummaryKeuangan() {
    return (
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
    )
}