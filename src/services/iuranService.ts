import { createClient } from '@/lib/supabase/client';
import { Iuran, CreateIuranRequest, UpdateIuranRequest } from '@/types/iuran';
import { InvoiceStatus, VerificationStatus } from '@/types/invoice';

const supabase = createClient();

export const iuranService = {
  async getIuran(): Promise<Iuran[]> {
    const { data, error } = await supabase
      .from('master_iuran')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getIuranById(id: string): Promise<Iuran | null> {
    const { data, error } = await supabase
      .from('master_iuran')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return data;
  },

  async createIuran(iuranData: CreateIuranRequest): Promise<Iuran> {
    const { data, error } = await supabase
      .from('master_iuran')
      .insert([iuranData])
      .select()
      .single();

    if (error) throw error;

    await this.generateInvoicesForParticipants(data, iuranData);

    return data;
  },

  async generateInvoicesForParticipants(data: Iuran, iuranData: CreateIuranRequest): Promise<void> {
    try {
      const startDate = new Date(iuranData.start_date);
      const dueDate = new Date(startDate.getFullYear(), startDate.getMonth(), iuranData.due_date);

      const invoices = iuranData.participants.map(participant => ({
        user_id: participant,
        cluster_id: iuranData.cluster_id,
        bill_amount: iuranData.amount,
        due_date: `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`,
        invoice_status: InvoiceStatus.UNPAID,
        verification_status: VerificationStatus.NOT_YET_CHECKED,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        iuran: data.id
      }))

      // Insert all invoices
      const { error: invoiceError } = await supabase
        .from('invoices')
        .insert(invoices);

      if (invoiceError) throw invoiceError;
    } catch (error) {
      console.error('Error generating invoices:', error);
      throw error;
    }
  },

  async updateIuran(id: string, iuranData: UpdateIuranRequest): Promise<Iuran> {
    const { data, error } = await supabase
      .from('master_iuran')
      .update(iuranData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async deleteIuran(id: string): Promise<void> {
    const { error } = await supabase
      .from('master_iuran')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getIuranWithParticipants(): Promise<Iuran[]> {
    const { data, error } = await supabase
      .from('master_iuran')
      .select(`
        *,
        profiles:participants(
          id,
          fullname,
          no_telp,
          house_number,
          house_type
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  }
};