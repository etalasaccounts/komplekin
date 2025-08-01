import { useState, useEffect } from "react";

export interface ClusterBankAccount {
  id: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  account_usage: string;
}

interface UseClusterBankAccountsReturn {
  bankAccounts: ClusterBankAccount[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useClusterBankAccounts = (): UseClusterBankAccountsReturn => {
  const [bankAccounts, setBankAccounts] = useState<ClusterBankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBankAccounts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/user/cluster-bank-accounts");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch bank accounts");
      }

      if (result.success) {
        setBankAccounts(result.data);
      } else {
        throw new Error(result.error || "Failed to fetch bank accounts");
      }
    } catch (err) {
      console.error("Error fetching bank accounts:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch bank accounts"
      );
      setBankAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const refetch = () => {
    fetchBankAccounts();
  };

  return {
    bankAccounts,
    loading,
    error,
    refetch,
  };
};
