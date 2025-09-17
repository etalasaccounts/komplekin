"use client";

import React from "react";
import Link from "next/link";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { WalletCards } from "lucide-react";
import { cn } from "@/lib/utils";

interface RekeningRTCalloutProps {
  show: boolean;
  className?: string;
}

export function RekeningRTCallout({ show, className }: RekeningRTCalloutProps) {
  if (!show) return null;

  return (
    <Alert 
      className={cn(
        "bg-blue-50 border-blue-200 text-blue-900 mb-6",
        className
      )}
    >
      <WalletCards className="text-blue-600" />
      <AlertTitle className="text-blue-900 font-semibold">
        Tambahkan Rekening RT
      </AlertTitle>
      <AlertDescription className="text-blue-700">
        <p className="mb-3">
          Untuk mulai menarik iuran, silakan tambahkan Rekening RT terlebih dahulu di menu Keuangan.
        </p>
        <Link href="/admin/dashboard/keuangan?tab=rekening-rt">
          <Button 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Tambah Rekening RT
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  );
}

export default RekeningRTCallout;