import { useState, useEffect } from "react";

export interface OriginalInvoiceData {
  id: string;
  user_id: string;
  cluster_id: string;
  amount_paid: number;
  bill_amount: number;
  due_date: string;
  payment_date: string | null;
  payment_method: string | null;
  receipt: string | null;
  payment_purpose: string;
  invoice_status: "Kurang bayar" | "Belum Bayar" | "Lunas";
  verification_status: "Belum dicek" | "Ditolak" | "Terverifikasi";
  created_at: string;
  updated_at: string;
}

export interface DetailedInvoice {
  id: string;
  keterangan: string;
  jatuhTempo: string;
  status: string;
  nominal: string;
  metode: string;
  tanggalBayar: string;
  buktiBayar: string;
  originalData: OriginalInvoiceData;
}

interface UseDetailedInvoicesReturn {
  invoices: DetailedInvoice[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  processPayment: (
    invoiceId: string,
    paymentData: FormData
  ) => Promise<boolean>;
  paymentLoading: boolean;
}

export const useDetailedInvoices = (): UseDetailedInvoicesReturn => {
  const [invoices, setInvoices] = useState<DetailedInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/user/invoices/detailed");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch invoices");
      }

      if (result.success) {
        setInvoices(result.data);
      } else {
        throw new Error(result.error || "Failed to fetch invoices");
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async (
    invoiceId: string,
    paymentData: FormData
  ): Promise<boolean> => {
    try {
      setPaymentLoading(true);

      // Add invoice ID to form data
      paymentData.append("invoiceId", invoiceId);

      const response = await fetch("/api/user/invoices/pay", {
        method: "POST",
        body: paymentData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to process payment");
      }

      if (result.success) {
        // Refresh invoices after successful payment
        await fetchInvoices();
        return true;
      } else {
        throw new Error(result.error || "Failed to process payment");
      }
    } catch (err) {
      console.error("Error processing payment:", err);
      setError(err instanceof Error ? err.message : "Payment failed");
      return false;
    } finally {
      setPaymentLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const refetch = () => {
    fetchInvoices();
  };

  return {
    invoices,
    loading,
    error,
    refetch,
    processPayment,
    paymentLoading,
  };
};
