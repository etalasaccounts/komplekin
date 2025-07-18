import { Card, CardContent } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, X, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationEllipsis,
  PaginationNext,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { PreviewImage } from "@/components/modal/previewImage";
import FilterComponent, {
  FilterState,
} from "@/components/filter/filterComponent";

type PemasukanItem = {
  id: number;
  tanggal: string;
  pemasukkan: string;
  kategori: string;
  nominal: string;
  metode: string;
  buktiPembayaran: string;
  keterangan: string;
};

type PaymentHistory = {
  bulan: string;
  tanggalBayar: string;
  kategori: string;
  nominal: string;
  metode: string;
  buktiBayar: string;
  status: string;
};

export default function Pemasukan() {
  const [searchTerm, setSearchTerm] = useState("");
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [transferReceiptModalOpen, setTransferReceiptModalOpen] =
    useState(false);
  const [selectedUser, setSelectedUser] = useState<PemasukanItem | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: undefined,
    dateTo: undefined,
    status: "",
  });

  // Sample data for Pemasukan (Income)
  const pemasukanData: PemasukanItem[] = [
    {
      id: 1,
      tanggal: "06/07/2025",
      pemasukkan: "Mathew Alexander",
      kategori: "Iuran RT",
      nominal: "Rp120.000",
      metode: "Transfer",
      buktiPembayaran: "Lihat Bukti Transfer",
      keterangan: "Iuran Bulan Juli 2025",
    },
    {
      id: 2,
      tanggal: "06/07/2025",
      pemasukkan: "William Kim",
      kategori: "Iuran RT",
      nominal: "Rp120.000",
      metode: "Transfer",
      buktiPembayaran: "Lihat Bukti Transfer",
      keterangan: "Iuran Bulan Juli 2025",
    },
    {
      id: 3,
      tanggal: "06/07/2025",
      pemasukkan: "Jackon Lee",
      kategori: "Iuran RT",
      nominal: "Rp120.000",
      metode: "Transfer",
      buktiPembayaran: "Lihat Bukti Transfer",
      keterangan: "Iuran Bulan Juli 2025",
    },
  ];

  // Sample payment history data for the modal
  const getPaymentHistory = (): PaymentHistory[] => [
    {
      bulan: "Juli 2025",
      tanggalBayar: "06/07/2025",
      kategori: "Iuran Bulanan",
      nominal: "Rp120.000",
      metode: "Transfer",
      buktiBayar: "Lihat Bukti Bayar",
      status: "Lunas",
    },
    {
      bulan: "Juni 2025",
      tanggalBayar: "06/07/2025",
      kategori: "Iuran Bulanan",
      nominal: "Rp120.000",
      metode: "Transfer",
      buktiBayar: "Lihat Bukti Bayar",
      status: "Lunas",
    },
    {
      bulan: "Mei 2025",
      tanggalBayar: "06/07/2025",
      kategori: "Iuran Bulanan",
      nominal: "Rp120.000",
      metode: "Transfer",
      buktiBayar: "Lihat Bukti Bayar",
      status: "Lunas",
    },
    {
      bulan: "April 2025",
      tanggalBayar: "06/07/2025",
      kategori: "Iuran Bulanan",
      nominal: "Rp120.000",
      metode: "Transfer",
      buktiBayar: "Lihat Bukti Bayar",
      status: "Lunas",
    },
    {
      bulan: "Maret 2025",
      tanggalBayar: "06/07/2025",
      kategori: "Iuran Bulanan",
      nominal: "Rp120.000",
      metode: "Transfer",
      buktiBayar: "Lihat Bukti Bayar",
      status: "Lunas",
    },
  ];

  const handleViewDetail = (item: PemasukanItem) => {
    setSelectedUser(item);
    setDetailModalOpen(true);
  };

  const handleResetFilters = () => {
    setFilters({
      dateFrom: undefined,
      dateTo: undefined,
      status: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Table Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CardTitle>Table Pemasukan RT</CardTitle>
              <Badge
                variant="outline"
                className="text-xs text-black rounded-full font-semibold"
              >
                Bulan Juli 2025
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Cari berdasarkan nama, nomor rumah, dll"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <FilterComponent
                filters={filters}
                setFilters={(filters) => setFilters(filters)}
                handleApplyFilters={() => {}}
                handleResetFilters={handleResetFilters}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <input type="checkbox" className="rounded" />
                </TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Pemasukkan</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Nominal</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead>Bukti Bayar</TableHead>
                <TableHead>Keterangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pemasukanData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <input type="checkbox" className="rounded" />
                  </TableCell>
                  <TableCell className="font-medium">{item.tanggal}</TableCell>
                  <TableCell>{item.pemasukkan}</TableCell>
                  <TableCell>{item.kategori}</TableCell>
                  <TableCell className="font-medium">{item.nominal}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="text-xs font-semibold rounded-full"
                    >
                      {item.metode}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-black underline"
                      onClick={() => setTransferReceiptModalOpen(true)}
                    >
                      {item.buktiPembayaran}
                    </Button>
                  </TableCell>
                  <TableCell>{item.keterangan}</TableCell>
                  <TableCell className="max-w-[30px]">
                    <div className="flex items-center space-x-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetail(item)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {/* <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button> */}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              Menampilkan 8 dari 112 List Warga
            </p>
            <div className="w-fit">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>
                      1
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">2</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">3</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">8</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">9</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">10</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-6xl min-w-6xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
          <DialogHeader className="flex flex-row items-center justify-between p-6 bg-white sticky top-0 z-10">
            <DialogTitle className="text-xl font-bold">
              Detail Pembayaran Iuran
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0"
              onClick={() => setDetailModalOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto  pt-0 p-6">
            {selectedUser && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-row items-center justify-start gap-3">
                  <h3 className="text-lg font-semibold">
                    Table Pembayaran Iuran
                  </h3>
                  <Badge
                    variant="outline"
                    className="text-xs text-foreground font-semibold rounded-full"
                  >
                    Tahun 2025
                  </Badge>
                </div>

                {/* Payment History Table */}
                <div className=" rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-medium text-muted-foreground">
                          Bulan
                        </TableHead>
                        <TableHead className="font-medium text-muted-foreground">
                          Tanggal Bayar
                        </TableHead>
                        <TableHead className="font-medium text-muted-foreground">
                          Kategori
                        </TableHead>
                        <TableHead className="font-medium text-muted-foreground">
                          Nominal
                        </TableHead>
                        <TableHead className="font-medium text-muted-foreground">
                          Metode
                        </TableHead>
                        <TableHead className="font-medium text-muted-foreground">
                          Bukti Bayar
                        </TableHead>
                        <TableHead className="font-medium text-muted-foreground">
                          Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getPaymentHistory().map((payment, index) => (
                        <TableRow key={index} className="hover:bg-gray-50">
                          <TableCell className="py-4">
                            {payment.bulan}
                          </TableCell>
                          <TableCell>{payment.tanggalBayar}</TableCell>
                          <TableCell>{payment.kategori}</TableCell>
                          <TableCell>{payment.nominal}</TableCell>
                          <TableCell>{payment.metode}</TableCell>
                          <TableCell>
                            <Button
                              variant="link"
                              className="p-0 h-auto text-black font-normal underline"
                              onClick={() => setTransferReceiptModalOpen(true)}
                            >
                              {payment.buktiBayar}
                            </Button>
                          </TableCell>
                          <TableCell>{payment.status}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {/* Preview Image Modal */}
      <PreviewImage
        open={transferReceiptModalOpen}
        onOpenChange={setTransferReceiptModalOpen}
        title="Bukti Transfer Bank"
        imageSrc={
          selectedUser?.buktiPembayaran === "Lihat Bukti Transfer"
            ? "/images/bukti-pembayaran.png"
            : undefined
        }
        imageAlt={`Bukti Transfer Bank - ${
          selectedUser?.pemasukkan || "Payment"
        }`}
      />
    </div>
  );
}
