import { useState, useEffect } from "react";
import { clusterBankAccountService } from "@/services/clusterBankAccountService";
import { ClusterBankAccount } from "@/types/cluster_bank_accounts";
import { toast } from "sonner";

export const useClusterBankAccountsAdmin = () => {
    const [bankAccounts, setBankAccounts] = useState<ClusterBankAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBankAccounts = async () => {
        try {
            setLoading(true);
            const data = await clusterBankAccountService.getClusterBankAccounts();
            setBankAccounts(data);
        } catch (error) {
            setError(error as string);
        } finally {
            setLoading(false);
        }
    }

    const updateClusterBankAccount = async (data: ClusterBankAccount): Promise<ClusterBankAccount | null> => {
        try {
            const response = await clusterBankAccountService.updateClusterBankAccount(data);
            if (response) {
                fetchBankAccounts();
                toast.success("Rekening berhasil diupdate");
            }
            return response;
        } catch (error) {
            setError(error as string);
            return null;
        }
    }

    const createClusterBankAccount = async (data: ClusterBankAccount): Promise<ClusterBankAccount | null> => {
        try {
            const response = await clusterBankAccountService.createClusterBankAccount(data);
            if (response) {
                fetchBankAccounts();
                toast.success("Rekening berhasil dibuat");
            }
            return response;
        } catch (error) {
            setError(error as string);
            return null;
        }
    }

    useEffect(() => {
        fetchBankAccounts();
    }, []);

    return { bankAccounts, loading, error, updateClusterBankAccount, createClusterBankAccount };
}