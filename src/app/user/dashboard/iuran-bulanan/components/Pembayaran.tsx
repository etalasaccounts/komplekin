"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DollarSign, X, Copy, ArrowRight, ArrowLeft } from "lucide-react";
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
import { ChooseFile } from "@/components/input/chooseFile";
import StatusPembayaran from "./StatusPembayaran";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { toast } from "sonner";
import { DetailedInvoice } from "@/hooks/useDetailedInvoices";
import { useClusterBankAccounts } from "@/hooks/useClusterBankAccounts";

type PembayaranProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIuran: DetailedInvoice | null;
  onPaymentSuccess: () => void;
};

export default function Pembayaran({
  open,
  onOpenChange,
  selectedIuran,
  onPaymentSuccess,
}: PembayaranProps) {
  const [paymentStep, setPaymentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    transferBank: "",
    totalBayar: "",
    tanggalBayar: "",
  });

  // Fetch bank accounts
  const { bankAccounts } = useClusterBankAccounts();

  const [paymentForm, setPaymentForm] = useState({
    pembayaran: "",
    periode: "",
    tanggalBayar: new Date(),
    totalTagihan: "",
    jumlahBayar: "",
    metodeBayar: "",
    rekening: "",
    buktiPembayaran: null as File | null,
  });

  // Auto-select bank account if only one exists and transfer method is selected
  useEffect(() => {
    if (
      bankAccounts.length === 1 &&
      paymentForm.metodeBayar === "transfer" &&
      !paymentForm.rekening
    ) {
      setPaymentForm((prev) => ({
        ...prev,
        rekening: bankAccounts[0].id,
      }));
    } else if (paymentForm.metodeBayar !== "transfer") {
      // Clear bank account selection if not using transfer
      setPaymentForm((prev) => ({
        ...prev,
        rekening: "",
      }));
    }
  }, [bankAccounts, paymentForm.metodeBayar, paymentForm.rekening]);

  // Populate form data when selectedIuran changes and modal is open
  useEffect(() => {
    if (open && selectedIuran) {
      // Use due date from originalData to create period (month and year)
      const dueDate = new Date(selectedIuran.originalData.due_date);
      const periode = dueDate.toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      });

      setPaymentForm({
        pembayaran:
          selectedIuran.originalData.payment_purpose || "Iuran Bulanan",
        periode: periode, // Use due date month and year
        tanggalBayar: new Date(),
        totalTagihan: selectedIuran.nominal, // Keep formatted version for display
        jumlahBayar: selectedIuran.nominal, // Keep formatted version for display
        metodeBayar: "",
        rekening: "",
        buktiPembayaran: null,
      });
      setPaymentStep(1);
    }
  }, [open, selectedIuran, bankAccounts]);

  // Debug step changes
  useEffect(() => {
    console.log("Payment step changed to:", paymentStep);
    if (paymentStep === 3) {
      console.log("Step 3 - paymentDetails:", paymentDetails);
    }
  }, [paymentStep, paymentDetails]);

  // Reset form and step when modal opens
  const handleModalOpen = (isOpen: boolean) => {
    onOpenChange(isOpen);
  };

  const handleNextStep = () => {
    if (paymentStep === 1) {
      // Remove metodeBayar validation from step 1 since it's selected in step 2
      setPaymentStep(2);
    } else if (paymentStep === 2) {
      handlePaymentSubmit();
    }
  };

  const handlePrevStep = () => {
    setPaymentStep(1);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedIuran) return;

    try {
      setIsSubmitting(true);

      // Validate required fields
      if (
        !paymentForm.metodeBayar ||
        !paymentForm.jumlahBayar ||
        !paymentForm.buktiPembayaran
      ) {
        toast.error("Data Tidak Lengkap", {
          description: "Harap lengkapi semua data pembayaran",
        });
        return;
      }

      // Debug: Log the data being sent
      console.log("Submitting payment with data:", {
        invoiceId: selectedIuran.id,
        paymentMethod: paymentForm.metodeBayar,
        paymentAmount: paymentForm.jumlahBayar
          .replace("Rp", "")
          .replace(/\./g, ""),
        selectedIuran: selectedIuran,
      });

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("invoiceId", selectedIuran.id); // Add the missing invoiceId
      formData.append("paymentMethod", paymentForm.metodeBayar);
      formData.append(
        "paymentAmount",
        paymentForm.jumlahBayar.replace("Rp", "").replace(/\./g, "")
      );

      if (paymentForm.buktiPembayaran) {
        formData.append("receipt", paymentForm.buktiPembayaran);
      }

      // Call payment API
      const response = await fetch("/api/user/invoices/pay", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("API Response:", result);

      if (!response.ok) {
        throw new Error(result.error || "Payment failed");
      }

      if (result.success) {
        // Save payment details for step 3 before resetting form
        const selectedAccount = bankAccounts.find(
          (account) => account.id === paymentForm.rekening
        );

        const savedPaymentDetails = {
          transferBank: selectedAccount?.bank_name || "Bank",
          totalBayar: paymentForm.jumlahBayar,
          tanggalBayar: paymentForm.tanggalBayar.toLocaleDateString("id-ID"),
        };
        setPaymentDetails(savedPaymentDetails);

        console.log(
          "Payment successful, setting step to 3. Payment details:",
          savedPaymentDetails
        );
        handleModalOpen(false);

        toast.success("Pembayaran Berhasil", {
          description: "Pembayaran telah dikirim dan menunggu verifikasi admin",
        });

        setPaymentStep(3); // Go to success step first
        console.log("Payment step set to 3");
        onPaymentSuccess(); // Refresh parent data

        // Auto close modal after 3 seconds and reset form
        setTimeout(() => {
          setPaymentForm({
            pembayaran: "",
            periode: "",
            tanggalBayar: new Date(),
            totalTagihan: "",
            jumlahBayar: "",
            metodeBayar: "",
            rekening: "",
            buktiPembayaran: null,
          });
          setPaymentDetails({
            transferBank: "",
            totalBayar: "",
            tanggalBayar: "",
          });
          onOpenChange(false);
          setPaymentStep(1); // Reset to first step
        }, 3000); // Increased to 3 seconds
      } else {
        throw new Error(result.error || "Payment failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Pembayaran Gagal", {
        description:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat memproses pembayaran",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleModalOpen}>
      <DialogContent className="max-w-xs" showCloseButton={false}>
        <DialogHeader
          className={`${
            paymentStep === 3
              ? "sr-only"
              : "flex flex-row items-center justify-between p-0"
          }`}
        >
          {paymentStep === 3 ? (
            <VisuallyHidden>
              <DialogTitle>Status Pembayaran</DialogTitle>
            </VisuallyHidden>
          ) : (
            <>
              <DialogTitle className="text-sm font-semibold">
                {paymentStep === 1
                  ? "Detail Pembayaran"
                  : paymentStep === 2
                  ? "Metode Pembayaran"
                  : "Status Pembayaran"}
              </DialogTitle>
              <div className="text-sm text-black">
                Step <span className="text-black">{paymentStep}</span> /{" "}
                <span
                  className={`${
                    paymentStep === 2 ? "text-black" : "text-gray-500"
                  }`}
                >
                  2
                </span>
              </div>
            </>
          )}
        </DialogHeader>

        {paymentStep === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Lengkapi rincian iuran yang ingin Anda bayarkan.
            </p>

            {/* Pembayaran */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Pembayaran *</Label>
              <Input
                value={paymentForm.pembayaran}
                className="bg-gray-50 text-sm"
                readOnly
              />
            </div>

            {/* Periode Bayar/Bulan */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Periode Bayar/Bulan</Label>
              <Input
                value={paymentForm.periode}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, periode: e.target.value })
                }
                className="bg-gray-50 text-sm"
                readOnly
              />
            </div>

            {/* Tanggal Bayar */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tanggal Bayar *</Label>
              <Input
                value={paymentForm.tanggalBayar.toLocaleDateString("id-ID")}
                className="bg-gray-50 text-sm"
                readOnly
              />
            </div>

            {/* Total Tagihan */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Total Tagihan</Label>
              <Input
                value={paymentForm.totalTagihan}
                className="bg-gray-50 text-sm"
                readOnly
              />
            </div>

            {/* Jumlah Bayar */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Jumlah Bayar *</Label>
              <Input
                value={paymentForm.jumlahBayar}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    jumlahBayar: e.target.value,
                  })
                }
                className="text-sm"
                placeholder="Rp100.000"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                <X className="w-4 h-4" />
                Batal
              </Button>
              <Button
                className="flex-1 bg-black text-white hover:bg-black/90"
                onClick={handleNextStep}
              >
                Lanjut
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {paymentStep === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Pilih cara bayar dan unggah bukti transfer Anda.
            </p>

            {/* Payment Summary */}
            <div className="bg-gray-50 rounded-lg border border-gray-300 p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-base text-gray-600">Total Tagihan</span>
                <span className="text-base text-gray-600">
                  {paymentForm.totalTagihan}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base">Total Bayar</span>
                <span className="text-base">{paymentForm.jumlahBayar}</span>
              </div>
            </div>

            {/* Metode Bayar */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Metode Bayar *</Label>
              <Select
                value={paymentForm.metodeBayar}
                onValueChange={(value) =>
                  setPaymentForm({ ...paymentForm, metodeBayar: value })
                }
              >
                <SelectTrigger className="w-full text-sm">
                  <SelectValue placeholder="Pilih Metode Bayar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="e-wallet">E-Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentForm.metodeBayar === "transfer" && (
              <>
                {/* Pilih Rekening */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Pilih Rekening</Label>
                  <Select
                    value={paymentForm.rekening}
                    onValueChange={(value) =>
                      setPaymentForm({ ...paymentForm, rekening: value })
                    }
                    disabled={bankAccounts.length === 1}
                  >
                    <SelectTrigger className="w-full text-sm">
                      <SelectValue placeholder="Pilih rekening bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.bank_name} - {account.account_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {bankAccounts.length === 1 && (
                    <p className="text-xs text-gray-500">
                      Rekening bank telah dipilih secara otomatis
                    </p>
                  )}
                </div>

                {/* Nomor Rekening */}
                <div className="space-y-2 flex items-start justify-between bg-gray-50 rounded-lg border border-gray-300 p-4">
                  <div className="flex flex-col items-start gap-2">
                    <p className="text-base text-gray-400">Nomor Rekening</p>
                    <p className="text-base">
                      {(() => {
                        const selectedAccount = bankAccounts.find(
                          (account) => account.id === paymentForm.rekening
                        );
                        return selectedAccount
                          ? selectedAccount.account_number
                          : "Pilih rekening terlebih dahulu";
                      })()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      const selectedAccount = bankAccounts.find(
                        (account) => account.id === paymentForm.rekening
                      );
                      const accountNumber =
                        selectedAccount?.account_number || "";

                      if (accountNumber) {
                        navigator.clipboard.writeText(accountNumber);
                        toast.success("Berhasil disalin", {
                          description:
                            "Nomor rekening telah disalin ke clipboard",
                        });
                      } else {
                        toast.error("Pilih rekening terlebih dahulu");
                      }
                    }}
                    disabled={!paymentForm.rekening}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}

            {/* Bukti Bayar */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Bukti Bayar *</Label>
              <ChooseFile
                value={paymentForm.buktiPembayaran}
                onChange={(file) => {
                  setPaymentForm({
                    ...paymentForm,
                    buktiPembayaran: file,
                  });
                }}
                accept="image/*"
                placeholder="Pilih file bukti pembayaran"
                maxSizeInMB={2}
              />
              <p className="text-xs text-gray-500">
                Format file .jpg, .png max 2MB
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handlePrevStep}
                disabled={isSubmitting}
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali
              </Button>
              <Button
                className="flex-1 bg-black text-white hover:bg-black/90"
                onClick={handleNextStep}
                disabled={isSubmitting}
              >
                <DollarSign className="w-4 h-4" />
                {isSubmitting ? "Memproses..." : "Bayar Iuran"}
              </Button>
            </div>
          </div>
        )}

        {paymentStep === 3 && (
          <StatusPembayaran
            status="pending"
            embedded={true}
            paymentDetails={paymentDetails}
            onClose={() => {
              onOpenChange(false);
              setPaymentStep(1);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
