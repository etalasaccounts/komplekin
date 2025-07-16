import { Card, CardContent } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, Eye, X, ChevronDown, Search, Calendar } from "lucide-react";
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
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { format } from "date-fns";
import { PreviewImage } from "@/components/modal/previewImage";

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
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: undefined,
    dateTo: undefined,
    status: "semua",
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

  const handleApplyFilters = () => {
    // Apply filters logic here
    console.log("Applying filters:", filters);
    setFilterOpen(false);
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
              <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    Filter
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96 p-0" align="end">
                  <div className="p-4">
                    {/* Filter Header */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Filter</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFilterOpen(false)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {/* Date Range */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">
                            Date Range
                          </Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleResetFilters}
                            className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
                          >
                            Reset
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-sm">Dari</Label>
                            <div className="relative">
                              <Input
                                placeholder="20/06/2025"
                                value={
                                  filters.dateFrom
                                    ? format(filters.dateFrom, "dd/MM/yyyy")
                                    : ""
                                }
                                readOnly
                                className="pr-10"
                              />
                              <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Sampai</Label>
                            <div className="relative">
                              <Input
                                placeholder="20/06/2025"
                                value={
                                  filters.dateTo
                                    ? format(filters.dateTo, "dd/MM/yyyy")
                                    : ""
                                }
                                readOnly
                                className="pr-10"
                              />
                              <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status Filter */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Status</Label>
                        <Select
                          value={filters.status}
                          onValueChange={(value) =>
                            setFilters({ ...filters, status: value })
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Belum Bayar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="belum">Belum Bayar</SelectItem>
                            <SelectItem value="sudah">Sudah Bayar</SelectItem>
                            <SelectItem value="semua">Semua Status</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Apply Filter Button */}
                    <div className="mt-6">
                      <Button
                        onClick={handleApplyFilters}
                        className="w-full bg-black text-white hover:bg-black/90"
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        Terapkan Filter
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
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
