import { createClient } from "@/lib/supabase/client";
import { Ledger } from "@/types/ledger";

const supabase = createClient();

export const ledgerService = {
  async getLedgers(): Promise<Ledger[]> {
    const { data, error } = await supabase
    .from("ledgers")
    .select(`
        *, 
        cluster:clusters(*), 
        invoice:invoices(*, user_permission:user_permissions(*, profile:profiles(*)), master_iuran:master_iuran!iuran(*)), 
        coa:chart_of_accounts(*)`)
    .order("updated_at", { ascending: false });
    if (error) {
      throw error;
    }
    return data;
  },
};