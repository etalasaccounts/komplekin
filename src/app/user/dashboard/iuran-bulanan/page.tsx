import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function IuranBulananPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Riwayat Iuran Bulanan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Month */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Juli 2025</span>
              <Badge variant="destructive">Belum dibayar</Badge>
            </div>
            <div className="text-sm text-muted-foreground mb-2">
              Jatuh tempo: 23 Juli 2025
            </div>
            <div className="text-2xl font-bold">Rp120,000</div>
          </div>

          {/* Previous Month */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Juni 2025</span>
              <Badge variant="secondary">Lunas</Badge>
            </div>
            <div className="text-sm text-muted-foreground mb-2">
              Dibayar: 20 Juni 2025
            </div>
            <div className="text-2xl font-bold text-muted-foreground">
              Rp120,000
            </div>
          </div>

          {/* Another Previous Month */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Mei 2025</span>
              <Badge variant="secondary">Lunas</Badge>
            </div>
            <div className="text-sm text-muted-foreground mb-2">
              Dibayar: 18 Mei 2025
            </div>
            <div className="text-2xl font-bold text-muted-foreground">
              Rp120,000
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
