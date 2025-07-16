import { Card, CardContent } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Filter,
  Edit,
  X,
  ChevronDown,
  Search,
  Calendar,
  Plus,
} from "lucide-react";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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

type RekeningRTItem = {
  id: number;
  nama_rekening: string;
  nama_bank: string;
  nomor_rekening: string;
  kategori: string;
};

export default function RekeningRT() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [rekeningSheetOpen, setRekeningSheetOpen] = useState(false);
  const [editingRekening, setEditingRekening] = useState<RekeningRTItem | null>(
    null
  );
  const [filters, setFilters] = useState({
    dateFrom: undefined,
    dateTo: undefined,
    status: "",
  });
  const [rekeningForm, setRekeningForm] = useState({
    namaRekening: "",
    namaBank: "",
    nomorRekening: "",
    kegunaanRekening: "",
    tanggalDibuat: undefined as Date | undefined,
    dokumenRekening: null as File | null,
  });

  // Determine if we're in edit mode
  const isEditMode = editingRekening !== null;

  // Sample data for Rekening RT
  const rekeningRTData: RekeningRTItem[] = [
    {
      id: 1,
      nama_rekening: "Mathew Alexander",
      nama_bank: "Bank BCA",
      nomor_rekening: "1660906378",
      kategori: "Iuran",
    },
    {
      id: 2,
      nama_rekening: "William Anderson",
      nama_bank: "Bank BCA",
      nomor_rekening: "0030906378",
      kategori: "Donasi",
    },
    {
      id: 3,
      nama_rekening: "Jackson Lee",
      nama_bank: "Bank BRI",
      nomor_rekening: "1234567890",
      kategori: "Iuran",
    },
  ];

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

  const handleCreateRekening = () => {
    setEditingRekening(null);
    // Reset form for new account
    setRekeningForm({
      namaRekening: "",
      namaBank: "",
      nomorRekening: "",
      kegunaanRekening: "",
      tanggalDibuat: undefined,
      dokumenRekening: null,
    });
    setRekeningSheetOpen(true);
  };

  const handleEditRekening = (item: RekeningRTItem) => {
    setEditingRekening(item);
    // Pre-fill the form with existing data
    setRekeningForm({
      namaRekening: item.nama_rekening,
      namaBank: item.nama_bank,
      nomorRekening: item.nomor_rekening,
      kegunaanRekening: item.kategori,
      tanggalDibuat: new Date(), // Default to current date since we don't have creation date in sample data
      dokumenRekening: null,
    });
    setRekeningSheetOpen(true);
  };

  const handleSubmitRekening = () => {
    if (isEditMode) {
      // Handle form update here
      console.log(
        "Updating rekening:",
        rekeningForm,
        "for item:",
        editingRekening
      );
    } else {
      // Handle form creation here
      console.log("Creating rekening:", rekeningForm);
    }

    setRekeningSheetOpen(false);
    setEditingRekening(null);
    // Reset form
    setRekeningForm({
      namaRekening: "",
      namaBank: "",
      nomorRekening: "",
      kegunaanRekening: "",
      tanggalDibuat: undefined,
      dokumenRekening: null,
    });
  };

  const handleSheetClose = () => {
    setRekeningSheetOpen(false);
    setEditingRekening(null);
    // Reset form when closing
    setRekeningForm({
      namaRekening: "",
      namaBank: "",
      nomorRekening: "",
      kegunaanRekening: "",
      tanggalDibuat: undefined,
      dokumenRekening: null,
    });
  };

  return (
    <div className="space-y-6">
      {/* Table Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Table Nomor Rekening</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Cari berdasarkan nama, nomor rekening, dll"
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
              <Sheet
                open={rekeningSheetOpen}
                onOpenChange={() => {
                  if (rekeningSheetOpen) {
                    setRekeningSheetOpen(false);
                    handleSheetClose();
                  } else {
                    setRekeningSheetOpen(true);
                  }
                }}
              >
                <SheetTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-black text-white hover:bg-black/90"
                    onClick={handleCreateRekening}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Rekening
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[400px] sm:w-[500px]">
                  <SheetHeader className="pb-6">
                    <div className="flex items-center justify-between">
                      <SheetTitle className="text-xl font-bold">
                        {isEditMode ? "Edit Rekening" : "Tambah Rekening"}
                      </SheetTitle>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isEditMode
                        ? "Edit detail rekening untuk memperbarui informasi rekening RT."
                        : "Tambahkan rekening resmi untuk keperluan transaksi dan pembayaran dari warga."}
                    </p>
                  </SheetHeader>

                  <div className="space-y-6 px-4">
                    {/* Nama Rekening Field */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="namaRekening"
                        className="text-sm font-medium"
                      >
                        Nama Rekening <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="namaRekening"
                        placeholder="Mathew Alexander"
                        value={rekeningForm.namaRekening}
                        onChange={(e) =>
                          setRekeningForm({
                            ...rekeningForm,
                            namaRekening: e.target.value,
                          })
                        }
                        className="w-full"
                      />
                    </div>

                    {/* Nama Bank Field */}
                    <div className="space-y-2">
                      <Label htmlFor="namaBank" className="text-sm font-medium">
                        Nama Bank <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={rekeningForm.namaBank}
                        onValueChange={(value) =>
                          setRekeningForm({ ...rekeningForm, namaBank: value })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Bank BCA" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bank BCA">Bank BCA</SelectItem>
                          <SelectItem value="Bank BRI">Bank BRI</SelectItem>
                          <SelectItem value="Bank BNI">Bank BNI</SelectItem>
                          <SelectItem value="Bank Mandiri">
                            Bank Mandiri
                          </SelectItem>
                          <SelectItem value="Bank CIMB">Bank CIMB</SelectItem>
                          <SelectItem value="Bank Danamon">
                            Bank Danamon
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Nomor Rekening Field */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="nomorRekening"
                        className="text-sm font-medium"
                      >
                        Nomor Rekening <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="nomorRekening"
                        placeholder="1660906378"
                        value={rekeningForm.nomorRekening}
                        onChange={(e) =>
                          setRekeningForm({
                            ...rekeningForm,
                            nomorRekening: e.target.value,
                          })
                        }
                        className="w-full"
                      />
                    </div>

                    {/* Kegunaan Rekening Field */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="kegunaanRekening"
                        className="text-sm font-medium"
                      >
                        Kegunaan Rekening{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={rekeningForm.kegunaanRekening}
                        onValueChange={(value) =>
                          setRekeningForm({
                            ...rekeningForm,
                            kegunaanRekening: value,
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Iuran" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Iuran">Iuran</SelectItem>
                          <SelectItem value="Donasi">Donasi</SelectItem>
                          <SelectItem value="Keamanan">Keamanan</SelectItem>
                          <SelectItem value="Kebersihan">Kebersihan</SelectItem>
                          <SelectItem value="Lainnya">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6 flex justify-end">
                      <Button
                        onClick={handleSubmitRekening}
                        className="w-fit bg-black text-white hover:bg-black/90"
                      >
                        {isEditMode ? (
                          <>
                            <Edit className="h-4 w-4 mr-2" />
                            Update Rekening
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Simpan Rekening
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
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
                <TableHead>Nama Rekening</TableHead>
                <TableHead>Nama Bank</TableHead>
                <TableHead>Nomor Rekening</TableHead>
                <TableHead>Kegunaan Rekening</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rekeningRTData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <input type="checkbox" className="rounded" />
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.nama_rekening}
                  </TableCell>
                  <TableCell>{item.nama_bank}</TableCell>
                  <TableCell>{item.nomor_rekening}</TableCell>
                  <TableCell>{item.kategori}</TableCell>
                  <TableCell className="max-w-[20px]">
                    <div className="flex items-center space-x-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditRekening(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
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
    </div>
  );
}
