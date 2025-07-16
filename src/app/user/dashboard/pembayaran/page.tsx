import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PembayaranPage() {
  return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Riwayat Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Recent Payment */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-medium">Iuran Juni 2025</span>
                  <p className="text-sm text-muted-foreground">Transfer Bank</p>
                </div>
                <Badge variant="secondary">Berhasil</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  20 Juni 2025, 14:30
                </span>
                <span className="text-lg font-bold">Rp120,000</span>
              </div>
            </div>

            {/* Another Payment */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-medium">Iuran Mei 2025</span>
                  <p className="text-sm text-muted-foreground">E-Wallet</p>
                </div>
                <Badge variant="secondary">Berhasil</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  18 Mei 2025, 09:15
                </span>
                <span className="text-lg font-bold">Rp120,000</span>
              </div>
            </div>

            {/* Pending Payment */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-medium">Iuran April 2025</span>
                  <p className="text-sm text-muted-foreground">Transfer Bank</p>
                </div>
                <Badge variant="outline">Pending</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  15 April 2025, 16:45
                </span>
                <span className="text-lg font-bold">Rp120,000</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
