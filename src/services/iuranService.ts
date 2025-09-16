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

      // Check if we need to send immediate email reminders
      await this.checkAndSendImmediateReminders(dueDate, iuranData.participants, iuranData.amount, data.id);
    } catch (error) {
      console.error('Error generating invoices:', error);
      throw error;
    }
  },

  async checkAndSendImmediateReminders(dueDate: Date, participants: string[], amount: number, iuranName: string): Promise<void> {
    try {
      const currentDate = new Date();
      const currentDay = currentDate.getDate();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      const dueDateMonth = dueDate.getMonth();
      const dueDateYear = dueDate.getFullYear();
      
      // Check if we're in the same month and year as the due date
      // and if current date is past the 2nd (reminder date)
      const shouldSendReminder = (
        currentMonth === dueDateMonth && 
        currentYear === dueDateYear && 
        currentDay > 2
      );
      
      if (shouldSendReminder) {
        console.log('Sending immediate email reminders for overdue invoices');
        
        // Get participant details for email sending
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, fullname, email')
          .in('id', participants);
          
        if (profileError) {
          console.error('Error fetching participant profiles:', profileError);
          return;
        }
        
        // Send email to each participant
        for (const profile of profiles || []) {
          if (profile.email) {
            try {
              const response = await fetch('/api/send-email/invoice-reminder', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                   userName: profile.fullname || 'Warga',
                   amount: amount.toLocaleString('id-ID'),
                   dueDate: dueDate.toLocaleDateString('id-ID', {
                     year: 'numeric',
                     month: 'long',
                     day: 'numeric'
                   }),
                   email: profile.email
                 })
              });
              
              if (!response.ok) {
                console.error(`Failed to send email to ${profile.email}:`, await response.text());
              } else {
                console.log(`Email reminder sent successfully to ${profile.email}`);
              }
            } catch (emailError) {
              console.error(`Error sending email to ${profile.email}:`, emailError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in checkAndSendImmediateReminders:', error);
      // Don't throw error here to avoid breaking the main iuran creation process
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