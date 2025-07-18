"use client";

import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X, Check } from "lucide-react";

interface TolakPendaftaranModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (alasan: string) => void;
}

export default function TolakPendaftaranModal({ open, onOpenChange, onConfirm }: TolakPendaftaranModalProps) {
  const [alasan, setAlasan] = useState('');

  const handleConfirm = () => {
    onConfirm(alasan);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold">Tolak Pendaftaran Warga?</AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            Masukkan alasan mengapa pendaftaran warga ini ditolak. Alasan ini akan diberikan ke warga dan mereka akan mendapatkan pemberitahuannya.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Textarea 
          placeholder="Tuliskan alasan mengapa pendaftaran warga ini ditolak"
          value={alasan}
          onChange={(e) => setAlasan(e.target.value)}
          className="resize-none h-20"
          rows={4}
        />
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">
              <X className="h-4 w-4" /> Batal
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={handleConfirm} className="bg-black text-white hover:bg-black/90">
              <Check className="h-4 w-4" /> Konfirmasi
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 