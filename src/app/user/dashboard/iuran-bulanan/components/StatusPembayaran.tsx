"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  Clock,
  Share,
  Download,
  FileText,
  CheckCircle,
  XCircle,
} from "lucide-react";

type StatusPembayaranProps = {
  status: "success" | "failed" | "pending";
  isOpen?: boolean;
  onClose?: () => void;
  paymentDetails?: {
    transferBank: string;
    totalBayar: string;
    tanggalBayar: string;
  };
  embedded?: boolean; // For when used inside another modal
};

const StatusPembayaran = ({
  status,
  isOpen = false,
  onClose,
  paymentDetails = {
    transferBank: "BCA",
    totalBayar: "Rp100.000",
    tanggalBayar: "16 Juli 2025",
  },
  embedded = false,
}: StatusPembayaranProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case "success":
        return {
          icon: <CheckCircle className="w-10 h-10 text-green-600" />,
          bgColor: "bg-green-100",
          title: "Pembayaran Berhasil",
          message: "Pembayaran Anda telah berhasil diproses dan dikonfirmasi.",
        };
      case "failed":
        return {
          icon: <XCircle className="w-10 h-10 text-red-600" />,
          bgColor: "bg-red-100",
          title: "Pembayaran Gagal",
          message:
            "Pembayaran Anda gagal diproses. Silakan coba lagi atau hubungi admin.",
        };
      case "pending":
        return {
          icon: <Clock className="w-10 h-10 text-orange-600" />,
          bgColor: "bg-orange-100",
          title: "Pembayaran Berhasil Dikirim",
          message:
            "Pembayaran Anda sedang dalam proses verifikasi. Harap tunggu maksimal 1×24 jam.",
        };
      default:
        return {
          icon: <Clock className="w-10 h-10 text-gray-600" />,
          bgColor: "bg-gray-100",
          title: "Status Tidak Diketahui",
          message: "Status pembayaran tidak dapat ditentukan.",
        };
    }
  };

  const statusConfig = getStatusConfig();

  const handleShare = () => {
    console.log("Share payment details");
    // Implement share functionality
  };

  const handleDownload = () => {
    console.log("Download payment receipt");
    // Implement download functionality
  };

  const handleRiwayatBayar = () => {
    console.log("Navigate to payment history");
    if (onClose) onClose();
    // Navigate to payment history page
  };

  const statusContent = (
    <div className="space-y-8 text-center">
      {/* Status Icon */}
      <div className="flex justify-center">
        <div
          className={`w-20 h-20 ${statusConfig.bgColor} rounded-full flex items-center justify-center`}
        >
          {statusConfig.icon}
        </div>
      </div>

      {/* Status Message */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">{statusConfig.title}</h3>
        <p className="text-sm text-muted-foreground">{statusConfig.message}</p>
      </div>

      {/* Payment Details */}
      <div className="space-y-2 text-left">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Transfer Bank</span>
          <span>{paymentDetails.transferBank}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Tota Bayar</span>
          <span>{paymentDetails.totalBayar}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Tanggal Bayar</span>
          <span>{paymentDetails.tanggalBayar}</span>
        </div>
      </div>

      {/* Action Buttons */}
      {(status === "success" || status === "pending") && (
        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="icon"
            className="flex-1"
            onClick={handleShare}
          >
            <Share className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="flex-1"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            className="w-fit bg-black text-white hover:bg-black/90"
            onClick={handleRiwayatBayar}
          >
            <FileText className="w-4 h-4" />
            Riwayat Bayar
          </Button>
        </div>
      )}

      {/* Main Action Button */}
    </div>
  );

  // If embedded, return just the content without Dialog wrapper
  if (embedded) {
    return statusContent;
  }

  // If standalone, return with Dialog wrapper
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm" showCloseButton={false}>
        <DialogHeader>
          <VisuallyHidden>
            <DialogTitle>{statusConfig.title}</DialogTitle>
          </VisuallyHidden>
        </DialogHeader>
        {statusContent}
      </DialogContent>
    </Dialog>
  );
};

export default StatusPembayaran;
