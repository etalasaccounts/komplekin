import { createClient } from '@/lib/supabase/client';
import { Iuran, CreateIuranRequest, UpdateIuranRequest } from '@/types/iuran';
import { InvoiceStatus, VerificationStatus, Invoice } from '@/types/invoice';

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
      await this.checkAndSendImmediateReminders(dueDate, iuranData.participants, iuranData.amount);
    } catch (error) {
      console.error('Error generating invoices:', error);
      throw error;
    }
  },

  async checkAndSendImmediateReminders(dueDate: Date, participants: string[], amount: number): Promise<void> {
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

        const {data: userPermissionData, error: userPermissionError} = await supabase
          .from('user_permissions')
          .select('*')

        const profileIds = userPermissionData?.filter(userPermission => participants.includes(userPermission.id)).map(userPermission => userPermission.profile_id) || [];
        
        if (userPermissionError) {
          console.error('Error fetching user permissions:', userPermissionError);
          return;
        }
        
        // Get participant details for email sending
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, fullname, email')
          .in('id', profileIds);

          console.log('Profiles:', profiles);
          
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
    try {
      // Get current iuran data to compare participants
      const currentIuran = await this.getIuranById(id);
      if (!currentIuran) {
        throw new Error('Iuran not found');
      }

      // Update the iuran
      const { data, error } = await supabase
        .from('master_iuran')
        .update(iuranData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Handle participant changes if participants array is provided
      if (iuranData.participants) {
        await this.handleParticipantChanges(
          id,
          currentIuran.participants,
          iuranData.participants,
          currentIuran,
          iuranData
        );
      }

      return data;
    } catch (error) {
      console.error('Error updating iuran:', error);
      throw error;
    }
  },

  async handleParticipantChanges(
    iuranId: string,
    oldParticipants: string[],
    newParticipants: string[],
    currentIuran: Iuran,
    updateData: UpdateIuranRequest
  ): Promise<void> {
    try {
      // Find added and removed participants
      const addedParticipants = newParticipants.filter(p => !oldParticipants.includes(p));
      const removedParticipants = oldParticipants.filter(p => !newParticipants.includes(p));

      console.log('Added participants:', addedParticipants);
      console.log('Removed participants:', removedParticipants);

      // Handle removed participants - delete their invoices
      if (removedParticipants.length > 0) {
        await this.deleteInvoicesForParticipants(iuranId, removedParticipants);
      }

      // Handle added participants - generate past invoices
      if (addedParticipants.length > 0) {
        await this.generatePastInvoicesForNewParticipants(
          iuranId,
          addedParticipants,
          currentIuran,
          updateData
        );
      }
    } catch (error) {
      console.error('Error handling participant changes:', error);
      throw error;
    }
  },

  async deleteInvoicesForParticipants(iuranId: string, participantIds: string[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('iuran', iuranId)
        .in('user_id', participantIds);

      if (error) throw error;

      console.log(`Deleted invoices for ${participantIds.length} removed participants`);
    } catch (error) {
      console.error('Error deleting invoices for removed participants:', error);
      throw error;
    }
  },

  async generatePastInvoicesForNewParticipants(
    iuranId: string,
    newParticipantIds: string[],
    currentIuran: Iuran,
    updateData: UpdateIuranRequest
  ): Promise<void> {
    try {
      const startDate = new Date(updateData.start_date || currentIuran.start_date);
      const endDate = new Date(updateData.end_date || currentIuran.end_date);
      const dueDay = updateData.due_date || currentIuran.due_date;
      const amount = updateData.amount || currentIuran.amount;
      const currentDate = new Date();

      const invoicesToCreate = [];

      // Generate invoices for each month from start_date to current month (or end_date if earlier)
      const currentMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      const lastMonth = new Date(Math.min(endDate.getTime(), currentDate.getTime()));

      while (currentMonth <= lastMonth) {
        const dueDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dueDay);
        
        // Create invoice for each new participant for this month
        for (const participantId of newParticipantIds) {
          invoicesToCreate.push({
            user_id: participantId,
            cluster_id: currentIuran.cluster_id,
            bill_amount: amount,
            due_date: `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`,
            invoice_status: InvoiceStatus.UNPAID,
            verification_status: VerificationStatus.NOT_YET_CHECKED,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            iuran: iuranId
          });
        }

        // Move to next month
        currentMonth.setMonth(currentMonth.getMonth() + 1);
      }

      if (invoicesToCreate.length > 0) {
        // Insert all past invoices
        const { error: invoiceError } = await supabase
          .from('invoices')
          .insert(invoicesToCreate);

        if (invoiceError) throw invoiceError;

        console.log(`Generated ${invoicesToCreate.length} past invoices for ${newParticipantIds.length} new participants`);

        // Send immediate email reminders for overdue invoices
        const currentDay = currentDate.getDate();
        if (currentDay > 2) {
          // Check if any of the generated invoices are overdue and send reminders
          const overdueInvoices = invoicesToCreate.filter(invoice => {
            const invoiceDueDate = new Date(invoice.due_date);
            return invoiceDueDate < currentDate;
          });

          if (overdueInvoices.length > 0) {
            await this.sendRemindersForOverdueInvoices(newParticipantIds, overdueInvoices);
          }
        }
      }
    } catch (error) {
      console.error('Error generating past invoices for new participants:', error);
      throw error;
    }
  },

  async sendRemindersForOverdueInvoices(
    participantIds: string[],
    overdueInvoices: Invoice[],
  ): Promise<void> { 
    try {
      const {data: userPermissionData, error: userPermissionError} = await supabase
          .from('user_permissions')
          .select('*')

        const profileIds = userPermissionData?.filter(userPermission => participantIds.includes(userPermission.id)).map(userPermission => userPermission.profile_id) || [];
        
        if (userPermissionError) {
          console.error('Error fetching user permissions:', userPermissionError);
          return;
        }
      // Get participant details for email sending
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, fullname, email')
        .in('id', profileIds);
        
      if (profileError) {
        console.error('Error fetching participant profiles:', profileError);
        return;
      }
      
      // Send email to each participant with overdue invoices
      for (const profile of profiles || []) {
        if (profile.email) {
          
          if (overdueInvoices.length > 0) {
            try {
              const response = await fetch('/api/send-email/invoice-reminder', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  userName: profile.fullname || 'Warga',
                  amount: overdueInvoices[0]?.bill_amount?.toLocaleString('id-ID') || '0',
                  dueDate: new Date(overdueInvoices[0].due_date).toLocaleDateString('id-ID', {
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
                console.log(`Email reminder sent successfully to ${profile.email} for ${overdueInvoices.length} overdue invoices`);
              }
            } catch (emailError) {
              console.error(`Error sending email to ${profile.email}:`, emailError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in sendRemindersForOverdueInvoices:', error);
    }
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