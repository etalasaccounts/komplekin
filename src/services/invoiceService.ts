import { createClient } from "@/lib/supabase/client";
import { Invoice, InvoiceStatus, VerificationStatus } from "@/types/invoice";

const supabase = createClient();

export const invoiceService = {
  async getInvoices(): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from("invoices")
      .select(
        `*, 
        user_permission:user_permissions!user_id(
        *, 
        profile:profiles!profile_id(*)
        )
        `,
      )
    if (error) throw error;
    return data;
  },
  async createInvoice(invoice: Invoice): Promise<Invoice> {
    const { data, error } = await supabase
      .from("invoices")
      .insert(invoice)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateInvoiceStatus(invoice: Invoice): Promise<Invoice> {
    const { data, error } = await supabase
      .from("invoices")
      .update({
        verification_status: invoice.verification_status,
        invoice_status: invoice.invoice_status,
      })
      .eq("id", invoice.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getInvoicesByUserId(userId: string): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", userId);
    if (error) throw error;
    return data;
  },

  async uploadFileToStorage(file: File, bucketName: string = "payment-receipts"): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucketName', bucketName);

      const response = await fetch('/api/admin/upload-receipt', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading file to storage:', error);
      throw error;
    }
  },

  async createManualPayment(invoice: Invoice, uploadedReceipt: File): Promise<Invoice> {
    try {
      // Upload file to storage first
      const receiptUrl = await this.uploadFileToStorage(uploadedReceipt);
      
      const { data, error } = await supabase
        .from("invoices")
        .update({
          amount_paid: invoice.amount_paid,
          payment_method: invoice.payment_method,
          receipt: receiptUrl,
          invoice_status: InvoiceStatus.PAID,
          verification_status: VerificationStatus.VERIFIED,
          payment_date: invoice.payment_date,
        })
        .eq("id", invoice.id)
        .select()
        .single();
      if (error) throw error;

      const {error: ledgerError} = await supabase.from("ledgers").insert({
        user_id: invoice.user_id,
        cluster_id: invoice.cluster_id,
        invoice_id: invoice.id,
        coa_id: "c1a4073d-5b8e-4bc4-adf0-290b58194d2f",
        ledger_type: "Credit",
        account_type: "Revenue",
        description: `Pembayaran manual untuk ${invoice.payment_purpose}`,
        amount: invoice.amount_paid,
        date: new Date().toISOString(),
        receipt: receiptUrl,
      })
      if (ledgerError) throw ledgerError;
      return data;
    } catch (error) {
      console.error('Error creating manual payment:', error);
      throw error;
    }
  },
};