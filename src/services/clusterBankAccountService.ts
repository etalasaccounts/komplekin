import { createClient } from "@/lib/supabase/client";
import { ClusterBankAccount } from "@/types/cluster_bank_accounts";

const supabase = createClient();

export const clusterBankAccountService = {
    async getClusterBankAccounts(): Promise<ClusterBankAccount[]> {
        const { data, error } = await supabase.from("cluster_bank_account").select("*");
        if (error) {
            throw error;
        }
        return data;
    },
    async createClusterBankAccount(clusterBankAccount: ClusterBankAccount): Promise<ClusterBankAccount> {
        // Omit id on insert if not provided to allow DB default to generate it
        const { id, ...rest } = clusterBankAccount as ClusterBankAccount & { id?: string };
        const insertPayload = id ? clusterBankAccount : rest;
        const { data, error } = await supabase
            .from("cluster_bank_account")
            .insert(insertPayload as unknown as ClusterBankAccount)
            .select()
            .single();
        if (error) {
            throw error;
        }
        return data as unknown as ClusterBankAccount;
    },
    async updateClusterBankAccount(clusterBankAccount: ClusterBankAccount): Promise<ClusterBankAccount> {
        const { data, error } = await supabase
            .from("cluster_bank_account")
            .update(clusterBankAccount)
            .eq("id", clusterBankAccount.id)
            .select()
            .single();
        if (error) {
            throw error;
        }
        return data as unknown as ClusterBankAccount;
    },
    async deleteClusterBankAccount(id: string): Promise<void> {
        const { error } = await supabase.from("cluster_bank_account").delete().eq("id", id);
        if (error) {
            throw error;
        }
    }
}