"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, Plus, X, Calendar, DollarSign } from "lucide-react";
import { toast } from "sonner";

// Define verification data type
type VerificationData = {
  id: string;
  name: string;
  contact: string;
  payment: string;
  month: string;
  paymentDate: string;
  totalAmount: string;
  method: string;
  proofPayment: string;
  status: "pending" | "verified" | "ditolak" | "belum_dicek";
  verificationStatus: string;
};

// Sample verification data
const verificationData: VerificationData[] = [
  {
    id: "1",
    name: "Mathew Alexander",
    contact: "089534924330",
    payment: "Iuran RT",
    month: "Juli 2025",
    paymentDate: "06/07/2025",
    totalAmount: "Rp120.000",
    method: "Transfer",
    proofPayment: "Lihat Bukti Bayar",
    status: "verified",
    verificationStatus: "Verifikasi",
  },
  {
    id: "2",
    name: "Susi Pujianti",
    contact: "089534924331",
    payment: "Iuran RT",
    month: "Juli 2025",
    paymentDate: "06/07/2025",
    totalAmount: "Rp120.000",
    method: "Qris",
    proofPayment: "Lihat Bukti Bayar",
    status: "ditolak",
    verificationStatus: "Verifikasi",
  },
  {
    id: "3",
    name: "Isabella Nguyen",
    contact: "089739243310",
    payment: "Iuran RT",
    month: "Juli 2025",
    paymentDate: "06/07/2025",
    totalAmount: "Rp120.000",
    method: "Xendit",
    proofPayment: "Auto VA",
    status: "belum_dicek",
    verificationStatus: "Verifikasi",
  },
  {
    id: "4",
    name: "Olivia Martin",
    contact: "089534504333",
    payment: "Iuran RT",
    month: "Juli 2025",
    paymentDate: "06/07/2025",
    totalAmount: "Rp120.000",
    method: "Transfer",
    proofPayment: "Lihat Bukti Bayar",
    status: "belum_dicek",
    verificationStatus: "Verifikasi",
  },
  {
    id: "5",
    name: "Jackson Lee",
    contact: "088734924323",
    payment: "Iuran RT",
    month: "Juli 2025",
    paymentDate: "06/07/2025",
    totalAmount: "Rp120.000",
    method: "cash",
    proofPayment: "Tanda Bayar",
    status: "belum_dicek",
    verificationStatus: "Verifikasi",
  },
  {
    id: "6",
    name: "Marthin Luther",
    contact: "089534924110",
    payment: "Iuran RT",
    month: "Juli 2025",
    paymentDate: "06/07/2025",
    totalAmount: "Rp120.000",
    method: "Xendit",
    proofPayment: "Auto VA",
    status: "belum_dicek",
    verificationStatus: "Verifikasi",
  },
  {
    id: "7",
    name: "Cania Martin",
    contact: "088234924332",
    payment: "Iuran RT",
    month: "Juli 2025",
    paymentDate: "06/07/2025",
    totalAmount: "Rp120.000",
    method: "Transfer",
    proofPayment: "Lihat Bukti Bayar",
    status: "belum_dicek",
    verificationStatus: "Verifikasi",
  },
  {
    id: "8",
    name: "William Kim",
    contact: "089549242330",
    payment: "Iuran RT",
    month: "Juli 2025",
    paymentDate: "06/07/2025",
    totalAmount: "Rp120.000",
    method: "Qris",
    proofPayment: "Lihat Bukti Bayar",
    status: "belum_dicek",
    verificationStatus: "Verifikasi",
  },
];

interface VerifikasiPembayaranProps {
  searchTerm: string;
}

export default function VerifikasiPembayaran({
  searchTerm,
}: VerifikasiPembayaranProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [verificationSheetOpen, setVerificationSheetOpen] = useState(false);
  const [manualPaymentSheetOpen, setManualPaymentSheetOpen] = useState(false);
  const [transferReceiptModalOpen, setTransferReceiptModalOpen] =
    useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] =
    useState<VerificationData | null>(null);
  const [manualPaymentForm, setManualPaymentForm] = useState({
    name: "",
    houseNumber: "",
    period: "",
    date: "",
    totalAmount: "",
  });
  const [rejectReason, setRejectReason] = useState("");
  const itemsPerPage = 8;
  const [buktiBayar, setBuktiBayar] = useState<File | null>(null);

  // Filter data based on search term
  const filteredData = verificationData.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.contact.includes(searchTerm) ||
      item.method.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(currentData.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-[#178C4E] text-white rounded-full font-semibold text-xs">
            Terverifikasi
          </Badge>
        );
      case "ditolak":
        return (
          <Badge className="bg-[#D02533] text-white rounded-full font-semibold text-xs">
            Ditolak
          </Badge>
        );
      case "belum_dicek":
        return (
          <Badge className="bg-[#CE5E12] text-white rounded-full font-semibold text-xs">
            Belum dicek
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            {status}
          </Badge>
        );
    }
  };

  const handleVerificationClick = (payment: VerificationData) => {
    setSelectedPayment(payment);
    setVerificationSheetOpen(true);
  };

  const handleApprovePayment = () => {
    if (selectedPayment) {
      toast.success("Pembayaran Berhasil Diverifikasi", {
        description: `Pembayaran dari ${selectedPayment.name} telah disetujui dan diverifikasi.`,
        duration: 3000,
      });
      setVerificationSheetOpen(false);
      setSelectedPayment(null);
    }
  };

  const handleRejectPayment = () => {
    setRejectDialogOpen(true);
    setVerificationSheetOpen(false);
  };

  const handleConfirmReject = () => {
    if (selectedPayment) {
      toast.error("Pembayaran Ditolak", {
        description: `Pembayaran dari ${selectedPayment.name} telah ditolak.`,
        duration: 3000,
      });
      setRejectDialogOpen(false);
      setVerificationSheetOpen(false);
      setSelectedPayment(null);
      setRejectReason("");
    }
  };

  const handleManualPaymentSubmit = () => {
    toast.success("Pembayaran Manual Berhasil Ditambahkan", {
      description: "Data pembayaran manual telah berhasil disimpan ke sistem.",
      duration: 3000,
    });
    setManualPaymentSheetOpen(false);
    setManualPaymentForm({
      name: "",
      houseNumber: "",
      period: "",
      date: "",
      totalAmount: "",
    });
  };

  const updateManualPaymentForm = (field: string, value: string) => {
    setManualPaymentForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProofPaymentClick = (payment: VerificationData) => {
    if (payment.proofPayment === "Lihat Bukti Bayar") {
      setSelectedPayment(payment);
      setTransferReceiptModalOpen(true);
    }
  };
  const handleFileUpload = (file: File) => {
    setBuktiBayar(file);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-lg font-semibold">Table Iuran Bulanan</span>
          <p className="text-xs font-semibold border border-[#E4E4E7] rounded-full px-2 py-1">
            Bulan Juli 2025
          </p>
        </div>
        <Button
          variant="outline"
          className="bg-white border border-border text-black"
          size="sm"
          onClick={() => setManualPaymentSheetOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Pembayaran Manual
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 px-4">
                <Checkbox
                  checked={
                    currentData.length > 0 &&
                    selectedItems.length === currentData.length
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Nama Warga
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Kontak
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Pembayaran
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Bulan
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Tanggal Bayar
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Total Tagihan
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Metode
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Bukti Bayar
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Status
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-center"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((item) => (
              <TableRow key={item.id} className="hover:bg-gray-50 text-black">
                <TableCell className="p-4">
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={(checked) =>
                      handleSelectItem(item.id, checked as boolean)
                    }
                  />
                </TableCell>
                <TableCell className="">{item.name}</TableCell>
                <TableCell className="">{item.contact}</TableCell>
                <TableCell className="">
                  <span className="text-xs font-semibold border border-border rounded-full px-2 py-1">
                    {item.payment}
                  </span>
                </TableCell>
                <TableCell className="">{item.month}</TableCell>
                <TableCell className="">{item.paymentDate}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="">{item.totalAmount}</span>
                    {item.name === "Mathew Alexander" && (
                      <span className="text-sm text-red-500">-Rp20.000</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="">
                  <span className="text-xs font-semibold bg-secondary rounded-full px-2 py-1">
                    {item.method}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-foreground underline font-normal"
                    size="sm"
                    onClick={() => handleProofPaymentClick(item)}
                  >
                    {item.proofPayment}
                  </Button>
                </TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="link"
                    className="h-auto p-0 text-[#178C4E] font-normal"
                    size="sm"
                    onClick={() => handleVerificationClick(item)}
                  >
                    <Check className="h-4 w-4" />
                    {item.verificationStatus}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground w-fit">
          Menampilkan {currentData.length} dari {filteredData.length} List Warga
        </p>
        <div className="w-fit">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={() => setCurrentPage(currentPage - 1)}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink href="#" isActive>
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={() => setCurrentPage(currentPage + 1)}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      {/* Transfer Receipt Modal */}
      <Dialog
        open={transferReceiptModalOpen}
        onOpenChange={setTransferReceiptModalOpen}
      >
        <DialogContent className="max-w-md p-0 gap-0 bg-white min-h-[80vh]">
          <DialogHeader className="p-4 pb-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold">
                Bukti Transfer Bank
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="p-4">
            <div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-96 flex items-center justify-center bg-gray-50">
                <p className="text-gray-400 text-sm">
                  Bukti Transfer Bank Placeholder
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual Payment Sheet */}
      <Sheet
        open={manualPaymentSheetOpen}
        onOpenChange={setManualPaymentSheetOpen}
      >
        <SheetContent className="w-[500px] sm:w-[500px] overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle>Pembayaran Manual</SheetTitle>
            <SheetDescription>
              Edit informasi pembayaran iuran jika terjadi kesalahan input atau
              perubahan data.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 px-5">
            {/* Nama Warga */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Nama Warga</Label>
              <Select
                value={manualPaymentForm.name}
                onValueChange={(value) =>
                  updateManualPaymentForm("name", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Mathew Alexander" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mathew Alexander">
                    Mathew Alexander
                  </SelectItem>
                  <SelectItem value="Susi Pujianti">Susi Pujianti</SelectItem>
                  <SelectItem value="Isabella Nguyen">
                    Isabella Nguyen
                  </SelectItem>
                  <SelectItem value="Olivia Martin">Olivia Martin</SelectItem>
                  <SelectItem value="Jackson Lee">Jackson Lee</SelectItem>
                  <SelectItem value="Marthin Luther">Marthin Luther</SelectItem>
                  <SelectItem value="Cania Martin">Cania Martin</SelectItem>
                  <SelectItem value="William Kim">William Kim</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Nomor Rumah */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Nomor Rumah</Label>
              <Input
                value={manualPaymentForm.houseNumber}
                onChange={(e) =>
                  updateManualPaymentForm("houseNumber", e.target.value)
                }
                placeholder="No1 Blok A"
                disabled
                className="bg-gray-100"
              />
            </div>

            {/* Periode Bayar/Bulan */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Periode Bayar/Bulan <span className="text-red-500">*</span>
              </Label>
              <Input
                value={manualPaymentForm.period}
                onChange={(e) =>
                  updateManualPaymentForm("period", e.target.value)
                }
                placeholder="Juli 2025"
              />
            </div>

            {/* Tanggal */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Tanggal <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={manualPaymentForm.date}
                  onChange={(e) =>
                    updateManualPaymentForm("date", e.target.value)
                  }
                  placeholder="06/07/2025"
                  className="pr-10"
                />
              </div>
            </div>

            {/* Total Tagihan */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Total Tagihan <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  value={manualPaymentForm.totalAmount}
                  onChange={(e) =>
                    updateManualPaymentForm("totalAmount", e.target.value)
                  }
                  placeholder="Rp120.000"
                  className="pr-10"
                />
                <DollarSign className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-6 flex justify-end">
              <Button
                className="bg-black text-white hover:bg-black/90"
                onClick={handleManualPaymentSubmit}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Bayar Iuran
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Verification Sheet */}
      <Sheet
        open={verificationSheetOpen}
        onOpenChange={setVerificationSheetOpen}
      >
        <SheetContent className="w-[500px] sm:w-[500px] overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle>Verifikasi Pembayaran</SheetTitle>
            <SheetDescription>
              Periksa dan validasi pembayaran yang telah dilakukan warga sebelum
              dicatat sebagai pemasukan resmi
            </SheetDescription>
          </SheetHeader>

          {selectedPayment && (
            <div className="space-y-4 px-4">
              {/* Nama Warga */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Nama Warga</Label>
                <Input
                  value={selectedPayment.name}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              {/* Kontak */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Kontak</Label>
                <Input
                  value={selectedPayment.contact}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              {/* Pembayaran */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Pembayaran</Label>
                <Input
                  value={selectedPayment.payment}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              {/* Bulan */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Bulan</Label>
                <Select value={selectedPayment.month.split(" ")[0]} disabled>
                  <SelectTrigger className="bg-gray-50 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Juli">Juli 2025</SelectItem>
                    <SelectItem value="Agustus">Agustus 2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tanggal Bayar */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tanggal Bayar</Label>
                <Input
                  value={selectedPayment.paymentDate}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              {/* Jumlah Bayar */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Jumlah Bayar <span className="text-red-500">*</span>
                </Label>
                <div className="flex flex-col items-start">
                  <Input value="" placeholder="Rp120.000" className="pr-20" />
                  <div className="">
                    <span className="text-sm text-red-500">
                      Kurang Rp20.000
                    </span>
                  </div>
                </div>
              </div>

              {/* Metode Bayar */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Metode Bayar</Label>
                <Select value={selectedPayment.method} disabled>
                  <SelectTrigger className="bg-gray-50 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Transfer">Transfer</SelectItem>
                    <SelectItem value="Qris">Qris</SelectItem>
                    <SelectItem value="Xendit">Xendit</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bukti Bayar */}
              <div className="space-y-2">
                <Label htmlFor="buktiBayar" className="text-sm font-medium">
                  Bukti Bayar
                </Label>
                <div className="relative">
                  <input
                    id="buktiBayar"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex items-center space-x-2 px-3 py-2 border border-input rounded-md">
                    <span className="font-medium text-sm">Choose file</span>
                    <span className="text-sm text-gray-500">
                      {buktiBayar ? buktiBayar.name : "No file chosen"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-6 pb-6">
                <Button
                  variant="outline"
                  className="flex-1 border-none bg-secondary"
                  onClick={handleRejectPayment}
                >
                  <X className="h-4 w-4 mr-2" />
                  Tolak
                </Button>
                <Button
                  className="flex-1 bg-black text-white hover:bg-black/90"
                  onClick={handleApprovePayment}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Terima
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Reject Confirmation Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-md p-0 gap-0 bg-white">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-lg font-semibold">
              Tolak Verifikasi Pembayaran?
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 pb-6">
            <p className="text-sm text-gray-600 mb-4">
              Pembayaran akan ditandai sebagai tidak valid. Pastikan ada alasan
              yang jelas sebelum menolak. Anda bisa meminta ulang bukti
              pembayaran dari warga.
            </p>

            <div className="space-y-2 mb-6">
              <Label className="text-sm font-medium">
                Tuliskan alasan menolak pembayaran
              </Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Contoh: Bukti transfer tidak jelas, nominal tidak sesuai, dll."
                className="min-h-[80px] resize-none"
              />
            </div>

            <div className="flex space-x-3 justify-end">
              <Button
                className="flex bg-red-600 text-white hover:bg-red-700"
                onClick={handleConfirmReject}
              >
                Tolak Pembayaran
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
