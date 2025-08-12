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
        coa:chart_of_accounts(*),
        user_permission:user_permissions(*, profile:profiles(*))
        `)
    .order("updated_at", { ascending: false });
    if (error) {
      throw error;
    }
    return data;
  },

  async uploadFileToBucket(file: File, bucketName: string = 'payment-receipts'): Promise<string> {
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucketName', bucketName);

      // Upload using existing API
      const response = await fetch('/api/admin/upload-receipt', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  async deleteFileFromBucket(fileUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const url = new URL(fileUrl);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(-2).join('/'); // Get folder/filename
      
      const { error } = await supabase.storage
        .from('payment-receipts')
        .remove([filePath]);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },

  async createLedger(ledgerData: Ledger & { receipt?: string | File }): Promise<Ledger> {
    try {
      // Handle file upload if there's a file
      let receiptUrl = ledgerData.receipt as string;
      if (ledgerData.receipt && typeof ledgerData.receipt !== 'string') {
        receiptUrl = await this.uploadFileToBucket(ledgerData.receipt as File);
      }

      const { data, error } = await supabase
        .from("ledgers")
        .insert({
          ...ledgerData,
          receipt: receiptUrl
        })
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error creating ledger:', error);
      throw error;
    }
  },

  async updateLedger(id: string, ledgerData: Ledger & { receipt?: string | File }): Promise<Ledger> {
    try {
      // Handle file upload if there's a new file
      let receiptUrl = ledgerData.receipt as string;
      if (ledgerData.receipt && typeof ledgerData.receipt !== 'string') {
        receiptUrl = await this.uploadFileToBucket(ledgerData.receipt as File);
      }

      const { data, error } = await supabase
        .from("ledgers")
        .update({
          ...ledgerData,
          receipt: receiptUrl
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error updating ledger:', error);
      throw error;
    }
  },
};