import { Card, CardContent } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Filter,
  Eye,
  Edit,
  X,
  ChevronDown,
  Search,
  Calendar,
  Plus,
} from "lucide-react";
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
import { SingleDatePicker } from "@/components/input/singleDatePicker";
import { PreviewImage } from "@/components/modal/previewImage";
import { ChooseFile } from "@/components/input/chooseFile";
import Image from "next/image";

type PengeluaranItem = {
  id: number;
  tanggal: string;
  pengeluaran: string;
  kategori: string;
  nominal: string;
  metode: string;
  buktiPembayaran: string;
  keterangan: string;
};

export default function Pengeluaran() {
  const [searchTerm, setSearchTerm] = useState("");
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [transferReceiptModalOpen, setTransferReceiptModalOpen] =
    useState(false);
  const [selectedUser, setSelectedUser] = useState<PengeluaranItem | null>(
    null
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const [expenseSheetOpen, setExpenseSheetOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<PengeluaranItem | null>(
    null
  );
  const [filters, setFilters] = useState({
    dateFrom: undefined,
    dateTo: undefined,
    status: "",
  });
  const [expenseForm, setExpenseForm] = useState({
    tanggal: undefined as Date | undefined,
    kategori: "",
    keterangan: "",
    nominal: "",
    dibayarkanOleh: "",
    metodeBayar: "",
    buktiPembayaran: null as File | null,
  });

  // Determine if we're in edit mode
  const isEditMode = editingExpense !== null;

  // Sample data for Pengeluaran (Expense)
  const pengeluaranData: PengeluaranItem[] = [
    {
      id: 1,
      tanggal: "2025-07-06",
      pengeluaran: "Mathew Alexander",
      kategori: "Iuran RT",
      nominal: "Rp120.000",
      metode: "Transfer",
      buktiPembayaran: "Lihat Bukti Transfer",
      keterangan: "Bayar gaji satpam",
    },
    {
      id: 2,
      tanggal: "2025-07-06",
      pengeluaran: "William Kim",
      kategori: "Iuran RT",
      nominal: "Rp120.000",
      metode: "Transfer",
      buktiPembayaran: "Lihat Bukti Transfer",
      keterangan: "Bayar gaji satpam",
    },
    {
      id: 3,
      tanggal: "2025-07-06",
      pengeluaran: "Jackon Lee",
      kategori: "Iuran RT",
      nominal: "Rp120.000",
      metode: "Transfer",
      buktiPembayaran: "Lihat Bukti Transfer",
      keterangan: "Bayar gaji satpam",
    },
  ];

  const handleViewDetail = (item: PengeluaranItem) => {
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

  const handleCreateExpense = () => {
    setEditingExpense(null);
    // Reset form for new expense
    setExpenseForm({
      tanggal: undefined as Date | undefined,
      kategori: "",
      keterangan: "",
      nominal: "",
      dibayarkanOleh: "",
      metodeBayar: "",
      buktiPembayaran: null,
    });
    setExpenseSheetOpen(true);
  };

  const handleEditExpense = (item: PengeluaranItem) => {
    setEditingExpense(item);
    // Pre-fill the form with existing data
    setExpenseForm({
      tanggal: new Date(item.tanggal),
      kategori: item.kategori,
      keterangan: item.keterangan,
      nominal: item.nominal.replace("Rp", "").replace(".", ""),
      dibayarkanOleh: item.pengeluaran,
      metodeBayar: item.metode.toLowerCase(),
      buktiPembayaran: null,
    });
    setExpenseSheetOpen(true);
  };

  const handleSubmitExpense = () => {
    if (isEditMode) {
      // Handle form update here
      console.log(
        "Updating expense:",
        expenseForm,
        "for item:",
        editingExpense
      );
    } else {
      // Handle form creation here
      console.log("Creating expense:", expenseForm);
    }

    setExpenseSheetOpen(false);
    setEditingExpense(null);
    // Reset form
    setExpenseForm({
      tanggal: undefined as Date | undefined,
      kategori: "",
      keterangan: "",
      nominal: "",
      dibayarkanOleh: "",
      metodeBayar: "",
      buktiPembayaran: null,
    });
  };

  const handleSheetClose = () => {
    setExpenseSheetOpen(false);
    setEditingExpense(null);
    // Reset form when closing
    setExpenseForm({
      tanggal: undefined as Date | undefined,
      kategori: "",
      keterangan: "",
      nominal: "",
      dibayarkanOleh: "",
      metodeBayar: "",
      buktiPembayaran: null,
    });
  };

  return (
    <div className="space-y-6">
      {/* Table Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CardTitle>Table Pengeluaran RT</CardTitle>
              <Badge variant="outline" className="text-xs text-black rounded-full font-semibold">
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
              <Sheet
                open={expenseSheetOpen}
                onOpenChange={() => {
                  if (expenseSheetOpen) {
                    setExpenseSheetOpen(false);
                    handleSheetClose();
                  } else {
                    setExpenseSheetOpen(true);
                  }
                }}
              >
                <SheetTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-black text-white hover:bg-black/90"
                    onClick={handleCreateExpense}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Pengeluaran
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[400px] sm:w-[500px]">
                  <SheetHeader className="pb-6">
                    <div className="flex items-center justify-between">
                      <SheetTitle className="text-xl font-bold">
                        {isEditMode ? "Edit Pengeluaran" : "Tambah Pengeluaran"}
                      </SheetTitle>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isEditMode
                        ? "Edit detail pengeluaran untuk memperbarui transaksi kas keluar dari keuangan RT."
                        : "Isi detail pengeluaran untuk mencatat transaksi kas keluar dari keuangan RT."}
                    </p>
                  </SheetHeader>

                  <div className="space-y-6 px-4">
                    {/* Date Field */}
                    <div className="space-y-2">
                      <Label htmlFor="tanggal" className="text-sm font-medium">
                        Tanggal <span className="text-red-500">*</span>
                      </Label>

                      <SingleDatePicker
                        id="tanggal"
                        value={expenseForm.tanggal}
                        onChange={(date) => {
                          setExpenseForm({
                            ...expenseForm,
                            tanggal: date,
                          });
                        }}
                        buttonClassName="w-full"
                      />
                    </div>

                    {/* Category Field */}
                    <div className="space-y-2">
                      <Label htmlFor="kategori" className="text-sm font-medium">
                        Kategori <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={expenseForm.kategori}
                        onValueChange={(value) =>
                          setExpenseForm({ ...expenseForm, kategori: value })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              isEditMode ? "Pilih kategori" : "Iuran"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Iuran RT">Iuran RT</SelectItem>
                          <SelectItem value="Keamanan">Keamanan</SelectItem>
                          <SelectItem value="Kebersihan">Kebersihan</SelectItem>
                          <SelectItem value="Perbaikan">Perbaikan</SelectItem>
                          <SelectItem value="Lainnya">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Description Field */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="keterangan"
                        className="text-sm font-medium"
                      >
                        Keterangan <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="keterangan"
                        placeholder={
                          isEditMode
                            ? "Deskripsi pengeluaran"
                            : "Mathew Alexander"
                        }
                        value={expenseForm.keterangan}
                        onChange={(e) =>
                          setExpenseForm({
                            ...expenseForm,
                            keterangan: e.target.value,
                          })
                        }
                        className="w-full"
                      />
                    </div>

                    {/* Amount Field */}
                    <div className="space-y-2">
                      <Label htmlFor="nominal" className="text-sm font-medium">
                        Nominal <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="nominal"
                        placeholder={isEditMode ? "120000" : "1660906378"}
                        value={expenseForm.nominal}
                        onChange={(e) =>
                          setExpenseForm({
                            ...expenseForm,
                            nominal: e.target.value,
                          })
                        }
                        className="w-full"
                      />
                    </div>

                    {/* Paid By Field */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="dibayarkanOleh"
                        className="text-sm font-medium"
                      >
                        Dibayarkan Oleh <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="dibayarkanOleh"
                        placeholder={
                          isEditMode ? "Nama pembayar" : "1660906378"
                        }
                        value={expenseForm.dibayarkanOleh}
                        onChange={(e) =>
                          setExpenseForm({
                            ...expenseForm,
                            dibayarkanOleh: e.target.value,
                          })
                        }
                        className="w-full"
                      />
                    </div>

                    {/* Payment Method Field */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="metodeBayar"
                        className="text-sm font-medium"
                      >
                        Metode Bayar <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={expenseForm.metodeBayar}
                        onValueChange={(value) =>
                          setExpenseForm({ ...expenseForm, metodeBayar: value })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={isEditMode ? "Pilih metode" : "Iuran"}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="transfer">Transfer</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="e-wallet">E-Wallet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* File Upload Field */}
                    <div className="space-y-2">
                      <ChooseFile
                        onChange={(file) => {
                          setExpenseForm({
                            ...expenseForm,
                            buktiPembayaran: file,
                          });
                        }}
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6 flex justify-end">
                      <Button
                        onClick={handleSubmitExpense}
                        className="w-fit bg-black text-white hover:bg-black/90"
                      >
                        {isEditMode ? (
                          <>
                            <Edit className="h-4 w-4 mr-2" />
                            Update Pengeluaran
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Buat Pengeluaran
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
                <TableHead>Tanggal</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead>Nominal</TableHead>
                <TableHead>Dibayarkan Oleh</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead>Bukti Pembayaran</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pengeluaranData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <input type="checkbox" className="rounded" />
                  </TableCell>
                  <TableCell className="font-medium">{item.tanggal}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="text-xs font-semibold rounded-full"
                    >
                      {item.kategori}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.keterangan}</TableCell>
                  <TableCell className="font-medium">{item.nominal}</TableCell>
                  <TableCell>{item.pengeluaran}</TableCell>
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
                  <TableCell className="max-w-[50px]">
                    <div className="flex items-center space-x-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetail(item)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditExpense(item)}
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

      {/* Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-4xl min-w-4xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
          <DialogHeader className="flex flex-row items-center justify-between p-6 bg-white sticky top-0 z-10">
            <DialogTitle className="text-xl font-bold">
              Detail Pengeluaran
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

          <div className="flex-1 overflow-y-auto pt-0 p-6">
            {selectedUser && (
              <div className="grid grid-cols-2 gap-8">
                {/* Left Column - Expense Details */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-500">Tanggal</label>
                      <p className="text-base font-medium text-black">
                        {new Date(selectedUser.tanggal).toLocaleDateString(
                          "id-ID"
                        )}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm text-gray-500">Kategori</label>
                      <p className="text-base font-medium text-black">
                        {selectedUser.kategori}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm text-gray-500">
                        Keterangan
                      </label>
                      <p className="text-base font-medium text-black">
                        {selectedUser.keterangan}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm text-gray-500">Nominal</label>
                      <p className="text-base font-medium text-black">
                        {selectedUser.nominal}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column - Bukti Bayar */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">
                      Dibayarkan oleh
                    </label>
                    <p className="text-base font-medium text-black">
                      {selectedUser.pengeluaran}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500">Metode</label>
                    <p className="text-base font-medium text-black">
                      {selectedUser.metode}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Bukti Bayar</label>
                    <div className="mt-2">
                      <div className="w-full h-80 relative rounded-lg overflow-hidden bg-gray-50 border">
                        <Image
                          src="/images/bukti-pembayaran.png"
                          alt="Bukti Pembayaran"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </div>
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
          selectedUser?.pengeluaran || "Payment"
        }`}
      />
      {/* Edit Expense Sheet - REMOVED, using single sheet above */}
    </div>
  );
}
