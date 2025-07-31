import { useState, useEffect } from "react";

interface Invoice {
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
}

interface InvoiceStatistics {
  total: number;
  unpaid: number;
  paid: number;
  overdue: number;
  totalUnpaidAmount: number;
}

interface UseUserInvoicesReturn {
  invoices: Invoice[];
  statistics: InvoiceStatistics;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useUserInvoices = (): UseUserInvoicesReturn => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [statistics, setStatistics] = useState<InvoiceStatistics>({
    total: 0,
    unpaid: 0,
    paid: 0,
    overdue: 0,
    totalUnpaidAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/user/invoices");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch invoices");
      }

      if (result.success) {
        setInvoices(result.data.invoices);
        setStatistics(result.data.statistics);
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

  useEffect(() => {
    fetchInvoices();
  }, []);

  const refetch = () => {
    fetchInvoices();
  };

  return {
    invoices,
    statistics,
    loading,
    error,
    refetch,
  };
};
