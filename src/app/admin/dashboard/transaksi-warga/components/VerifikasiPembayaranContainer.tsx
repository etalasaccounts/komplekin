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
import PaginationComponent from "./PaginationComponent";
import { Plus, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { PreviewImage } from "@/components/modal/previewImage";
import ManualPaymentSheet from "./ManualPaymentSheet";
import RejectConfirmationDialog from "./RejectConfirmationDialog";
import { Invoice, InvoiceStatus, VerificationStatus } from "@/types/invoice";
import { TableEmptyState } from "@/components/ui/empty-state";



interface VerifikasiPembayaranContainerProps {
  searchTerm: string;
  paidInvoices: Invoice[];
  loading: boolean;
  updateInvoice: (invoice: Invoice) => Promise<Invoice | null>;
  getInvoicesByUserId: (userId: string) => void;
  invoiceByUserId: Invoice[];
  createManualPayment: (invoice: Invoice, uploadedReceipt: File) => Promise<Invoice | null>;
}

export default function VerifikasiPembayaranContainer({
  searchTerm,
  paidInvoices,
  loading,
  updateInvoice,
  getInvoicesByUserId,
  invoiceByUserId,
  createManualPayment,
}: VerifikasiPembayaranContainerProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [manualPaymentSheetOpen, setManualPaymentSheetOpen] = useState(false);
  const [transferReceiptModalOpen, setTransferReceiptModalOpen] =
    useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] =
    useState<Invoice | null>(null);
  // Update manual payment form state type
  const [manualPaymentForm, setManualPaymentForm] = useState({
    name: "",
    contact: "",
    payment: "",
    period: "",
    date: undefined as Date | undefined,
    totalAmount: "",
    paidAmount: "",
    paymentMethod: "",
    proofPayment: null as File | null,
  });
  const [rejectReason, setRejectReason] = useState("");
  const itemsPerPage = 10;

  // Reset to first page when search term changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Filter data based on search term
  const filteredData = paidInvoices.filter(
    (item) =>
      item.user_permission?.profile?.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.user_permission?.profile?.no_telp?.includes(searchTerm) ||
      item.payment_method?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(
        currentData.map((item) => item.id!).filter(Boolean)
      );
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter((item) => item !== itemId));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case VerificationStatus.VERIFIED:
        return <Badge className="bg-[#178C4E] rounded-full">Terverifikasi</Badge>;
      case VerificationStatus.UNVERIFIED:
        return <Badge className="bg-[#D02533] rounded-full">Ditolak</Badge>;
      case VerificationStatus.NOT_YET_CHECKED:
        return <Badge className="bg-[#CE5E12] rounded-full">Belum dicek</Badge>;  
      default:
        return <Badge className="bg-[#C99A2C] rounded-full">Pending</Badge>;
    }
  };



  const handleApprovePayment = async () => {
    const invoice = selectedInvoice!;
    invoice.verification_status = VerificationStatus.VERIFIED;
    const updatedInvoice = await updateInvoice(invoice);
    if (updatedInvoice) {
      toast.success("Pembayaran Berhasil Diverifikasi", {
        description: `Pembayaran dari ${updatedInvoice.user_permission?.profile?.fullname} telah disetujui dan diverifikasi.`,
        duration: 3000,
      });
      setTransferReceiptModalOpen(false);
      setSelectedInvoice(null);
    }
  };

  const handleRejectPayment = () => {
    setRejectDialogOpen(true);
    setTransferReceiptModalOpen(false);
  };

  const handleConfirmReject = async () => {
    const invoice = selectedInvoice!;
      invoice.verification_status = VerificationStatus.UNVERIFIED;
      const updatedInvoice = await updateInvoice(invoice);
      if (updatedInvoice) {
        toast.error("Pembayaran Telah Ditolak", {
          description: `Alasan: ${rejectReason}`,
          duration: 3000,
        });
        setRejectDialogOpen(false);
        setTransferReceiptModalOpen(false);
        setSelectedInvoice(null);
        setRejectReason("");
      }
  };



  const updateManualPaymentForm = (
    field: string,
    value: string | Date | File | null | undefined | number
  ) => {
    setManualPaymentForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };



  const handleProofPaymentClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setTransferReceiptModalOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              size="sm"
              className="bg-black text-white hover:bg-black/90 cursor-pointer"
              onClick={() => setManualPaymentSheetOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Pembayaran Manual
            </Button>
          </div>
        </div>

        {/* Loading Table */}
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 px-4">
                  <Checkbox disabled />
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
              {Array.from({ length: 8 }).map((_, index) => (
                <TableRow key={index} className="hover:bg-gray-50 text-black">
                  <TableCell className="p-4">
                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell className="">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                  </TableCell>
                  <TableCell className="">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                  </TableCell>
                  <TableCell className="">
                    <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div>
                  </TableCell>
                  <TableCell className="">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                  </TableCell>
                  <TableCell className="">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                  </TableCell>
                  <TableCell className="">
                    <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-lg font-semibold">Table Invoice Bulanan</span>
          <p className="text-xs font-semibold border border-[#E4E4E7] rounded-full px-2 py-1">
            Bulan {new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
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
      <div className="rounded-md border bg-card relative z-0">
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
                Status
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Bukti Bayar
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-center"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length === 0 ? (
              <TableEmptyState
                icon={<CheckCircle className="h-12 w-12" />}
                title="Belum ada pembayaran untuk diverifikasi"
                description="Belum ada pembayaran yang perlu diverifikasi. Data akan muncul setelah warga melakukan pembayaran."
                colSpan={11}
              />
            ) : (
              currentData.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50 text-black">
                  <TableCell className="p-4">
                    <Checkbox
                      checked={selectedItems.includes(item.id!)}
                      onCheckedChange={(checked) =>
                        handleSelectItem(item.id!, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell className="">{item.user_permission?.profile?.fullname || "Nama tidak tersedia"}</TableCell>
                  <TableCell className="">{item.user_permission?.profile?.no_telp || "Kontak tidak tersedia"}</TableCell>
                  <TableCell className="">
                    <span className="text-xs font-semibold border border-border rounded-full px-2 py-1">
                      {item.payment_purpose || '-'}
                    </span>
                  </TableCell>
                  <TableCell className="">Juli 2025</TableCell>
                  <TableCell className="">{item.payment_date || "-"}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="">Rp{item.bill_amount?.toLocaleString() || "0"}</span>
                      {Number(item.amount_paid) < Number(item.bill_amount) && (
                        <span className="text-sm text-red-500">-Rp{(Number(item.bill_amount) - Number(item.amount_paid)).toLocaleString()}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="">
                    {item.payment_method ?
                    <span className="text-xs font-semibold bg-secondary rounded-full px-2 py-1">
                      {item.payment_method.charAt(0).toUpperCase() + item.payment_method.slice(1)}
                    </span>
                    : <span className="text-xs font-semibold">
                      -
                    </span>
                    }
                  </TableCell>
                  <TableCell>{getStatusBadge(item.verification_status as string)}</TableCell>
                  <TableCell>
                    {item.invoice_status === InvoiceStatus.PAID 
                    ? 
                    <Button
                        variant="link"
                        className="h-auto p-0 text-foreground underline font-normal"
                        size="sm"
                        onClick={() => handleProofPaymentClick(item)}
                      >
                      Lihat Bukti Bayar
                    </Button>
                    : <span className="text-xs font-semibold">
                      -
                    </span>
                    }
                    
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <PaginationComponent
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredData.length}
        itemsPerPage={itemsPerPage}
        startIndex={startIndex}
        endIndex={endIndex}
        onPageChange={setCurrentPage}
        itemLabel="List Warga"
      />

      {/* Preview Image Modal */}
      <PreviewImage
        open={transferReceiptModalOpen}
        onOpenChange={setTransferReceiptModalOpen}
        title="Bukti Transfer Bank"
        imageSrc={
          selectedInvoice?.receipt
        }
        imageAlt={`Bukti Transfer Bank - ${selectedInvoice?.user_permission?.profile?.fullname || "Payment"}`}
        showActions={true && selectedInvoice?.verification_status === VerificationStatus.NOT_YET_CHECKED}
        onApprove={handleApprovePayment}
        onReject={handleRejectPayment}
        approveLabel="Terima Pembayaran"
        rejectLabel="Tolak Pembayaran"
      />

      {/* Manual Payment Sheet */}
      <ManualPaymentSheet
        open={manualPaymentSheetOpen}
        onOpenChange={setManualPaymentSheetOpen}
        form={manualPaymentForm}
        updateForm={updateManualPaymentForm}
        getInvoicesByUserId={getInvoicesByUserId}
        invoiceByUserId={invoiceByUserId}
        createManualPayment={createManualPayment}
      />



      {/* Reject Confirmation Dialog */}
      <RejectConfirmationDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        rejectReason={rejectReason}
        onRejectReasonChange={setRejectReason}
        onConfirmReject={handleConfirmReject}
      />
    </div>
  );
}
