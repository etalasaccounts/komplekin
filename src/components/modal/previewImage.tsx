"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

interface PreviewImageProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  imageSrc?: string | File;
  imageAlt?: string;
  className?: string;
}

export function PreviewImage({
  open,
  onOpenChange,
  title = "Preview Gambar",
  imageSrc,
  imageAlt = "Preview image",
  className,
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
      </DialogContent>
    </Dialog>
  );
}
