"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface PreviewImageProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  imageSrc?: string | File;
  imageAlt?: string;
  className?: string;
  showActions?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  approveLabel?: string;
  rejectLabel?: string;
  approveLoading?: boolean;
  rejectLoading?: boolean;
}

export function PreviewImage({
  open,
  onOpenChange,
  title = "Preview Gambar",
  imageSrc,
  imageAlt = "Preview image",
  className,
  showActions = false,
  onApprove,
  onReject,
  approveLabel = "Terima",
  rejectLabel = "Tolak",
  approveLoading = false,
  rejectLoading = false,
}: PreviewImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const defaultImageSrc = "/images/bukti-pembayaran.png";

  // Handle different types of image sources
  const getImageSrc = () => {
    if (!imageSrc) return defaultImageSrc;

    if (typeof imageSrc === "string") {
      return imageSrc;
    }

    if (imageSrc instanceof File) {
      return URL.createObjectURL(imageSrc);
    }

    return defaultImageSrc;
  };

  const displayImageSrc = getImageSrc();

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-w-2xl min-w-xl p-0 gap-0 bg-white min-h-[80vh] ${
          className || ""
        }`}
      >
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-6 flex-1 flex items-center justify-center">
          <div className="w-full h-150 relative rounded-lg overflow-hidden">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
              </div>
            )}

            {imageError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                <div className="text-4xl mb-2">📷</div>
                <p className="text-sm">Gagal memuat gambar</p>
              </div>
            ) : (
              <Image
                src={displayImageSrc}
                alt={imageAlt}
                fill
                className="object-contain"
                onLoad={handleImageLoad}
                onError={handleImageError}
                unoptimized={imageSrc instanceof File}
              />
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
            <Button
              variant="outline"
              onClick={onReject}
              disabled={rejectLoading}
              className="min-w-[100px]"
            >
              {rejectLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2" />
              ) : null}
              {rejectLabel}
            </Button>
            <Button
              onClick={onApprove}
              disabled={approveLoading}
              className="min-w-[100px] bg-green-600 hover:bg-green-700"
            >
              {approveLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : null}
              {approveLabel}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
