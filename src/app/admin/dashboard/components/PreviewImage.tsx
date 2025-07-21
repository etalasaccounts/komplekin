"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import Image from "next/image";
import { ArrowLeft, XIcon } from "lucide-react";

// Helper component for rendering an image with loading/error states
const ImageWithState = ({
  src,
  alt,
  title,
}: {
  src?: string;
  alt: string;
  title: string;
}) => {
  const [imageError, setImageError] = React.useState(false);
  const [imageLoading, setImageLoading] = React.useState(true);

  if (!src) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-48 w-full flex items-center justify-center bg-gray-50">
        <p className="text-gray-400 text-sm">{title} tidak tersedia.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
      <div className="w-full h-auto relative">
        {imageLoading && (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
          </div>
        )}

        {imageError ? (
          <div className="flex flex-col items-center justify-center text-gray-400 ">
            <div className="text-4xl mb-2">📷</div>
            <p className="text-sm">Gagal memuat gambar</p>
          </div>
        ) : (
          <Image
            src={src}
            alt={alt}
            width={500}
            height={300}
            className="object-contain w-full h-auto rounded-lg border"
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
            }}
          />
        )}
      </div>
    </div>
  );
};

interface PreviewImageProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  ktpSrc?: string;
  kkSrc?: string;
  className?: string;
}

export function PreviewImage({
  open,
  onOpenChange,
  title = "Preview Dokumen",
  ktpSrc,
  kkSrc,
  className,
}: PreviewImageProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-w-md w-[90vw] p-0 gap-0 bg-white max-h-[90vh] rounded-3xl flex flex-col ${
          className || ""
        }`}
        showCloseButton={false}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b relative flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <DialogClose className="p-1 rounded-md hover:bg-gray-200 transition-colors bg-[#E8E8E8]">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </DialogClose>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                {title}
              </DialogTitle>
            </div>
            <DialogClose className="p-1 rounded-md bg-[#FFC0C5] text-[#D02533] opacity-100 hover:opacity-80">
              <XIcon className="size-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col items-center gap-6">
            {ktpSrc && <ImageWithState src={ktpSrc} alt="Foto KTP" title="Foto KTP" />}
            {kkSrc && <ImageWithState
              src={kkSrc}
              alt="Foto Kartu Keluarga"
              title="Foto Kartu Keluarga"
            />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
