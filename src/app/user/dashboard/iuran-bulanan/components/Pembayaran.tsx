"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DollarSign, X, Copy, ArrowRight } from "lucide-react";
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
import { SingleDatePicker } from "@/components/input/singleDatePicker";
import { ChooseFile } from "@/components/input/chooseFile";
import StatusPembayaran from "./StatusPembayaran";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

type IuranItem = {
  keterangan: string;
  jatuhTempo: string;
  status: string;
  nominal: string;
  metode: string;
  tanggalBayar: string;
  buktiBayar: string;
};

type PembayaranProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIuran: IuranItem | null;
};

export default function Pembayaran({
  open,
  onOpenChange,
  selectedIuran,
}: PembayaranProps) {
  const [paymentStep, setPaymentStep] = useState(1);
  const [paymentForm, setPaymentForm] = useState({
    pembayaran: "Iuran RT",
    periode: "Juli 2025",
    tanggalBayar: undefined as Date | undefined,
    totalTagihan: "Rp100.000",
    jumlahBayar: "Rp100.000",
    metodeBayar: "Transfer",
    rekening: "BCA-Mathew Alexander",
    buktiPembayaran: null as File | null,
  });

  // Reset form and step when modal opens
  const handleModalOpen = (isOpen: boolean) => {
    if (isOpen && selectedIuran) {
      setPaymentForm({
        pembayaran: "Iuran RT",
        periode: selectedIuran.keterangan.replace("Iuran ", ""),
        tanggalBayar: new Date(),
        totalTagihan: selectedIuran.nominal,
        jumlahBayar: "",
        metodeBayar: "",
        rekening: "",
        buktiPembayaran: null,
      });
      setPaymentStep(1);
    }
    onOpenChange(isOpen);
  };

  const handleNextStep = () => {
    setPaymentStep(2);
  };

  const handlePrevStep = () => {
    setPaymentStep(1);
  };

  const handlePaymentSubmit = () => {
    // Handle payment submission here
    console.log("Payment submitted:", paymentForm);
    setPaymentStep(3);
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
              <Select
                value={paymentForm.pembayaran}
                onValueChange={(value) =>
                  setPaymentForm({ ...paymentForm, pembayaran: value })
                }
              >
                <SelectTrigger className="w-full text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Iuran RT">Iuran RT</SelectItem>
                  <SelectItem value="Iuran Keamanan">Iuran Keamanan</SelectItem>
                  <SelectItem value="Iuran Kebersihan">
                    Iuran Kebersihan
                  </SelectItem>
                </SelectContent>
              </Select>
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
              <SingleDatePicker
                value={paymentForm.tanggalBayar}
                onChange={(date) =>
                  setPaymentForm({ ...paymentForm, tanggalBayar: date })
                }
                placeholder="06/07/2025"
                buttonClassName="w-full text-sm"
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
                  <SelectValue placeholder="Transfer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="e-wallet">E-Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pilih Rekening */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Pilih Rekening</Label>
              <Select
                value={paymentForm.rekening}
                onValueChange={(value) =>
                  setPaymentForm({ ...paymentForm, rekening: value })
                }
              >
                <SelectTrigger className="w-full text-sm    ">
                  <SelectValue placeholder="BCA-Mathew Alexander" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bca-mathew">
                    BCA-Mathew Alexander
                  </SelectItem>
                  <SelectItem value="bca-john">BCA-John Doe</SelectItem>
                  <SelectItem value="mandiri-admin">
                    Mandiri-Admin RT
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Nomor Rekening */}
            <div className="space-y-2 flex items-start justify-between bg-gray-50 rounded-lg border border-gray-300 p-4">
              <div className="flex flex-col items-start gap-2">
                <p className="text-base text-gray-400">Nomor Rekening</p>
                <p className="text-base">0831417463</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  navigator.clipboard.writeText("0831417463");
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            {/* Bukti Bayar */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Bukti Bayar *</Label>
              <ChooseFile
                onChange={(file) => {
                  setPaymentForm({
                    ...paymentForm,
                    buktiPembayaran: file,
                  });
                }}
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
              >
                <X className="w-4 h-4" />
                Batal
              </Button>
              <Button
                className="flex-1 bg-black text-white hover:bg-black/90"
                onClick={handlePaymentSubmit}
              >
                <DollarSign className="w-4 h-4" />
                Bayar Iuran
              </Button>
            </div>
          </div>
        )}

        {paymentStep === 3 && (
          <StatusPembayaran
            status="pending"
            embedded={true}
            paymentDetails={{
              transferBank: "BCA",
              totalBayar: "Rp100.000",
              tanggalBayar: "16 Juli 2025",
            }}
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
