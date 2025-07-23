import { createClient } from '@/lib/supabase/client'

export interface InvitationData {
  email: string
  fullname: string
  clusterId: string
  role?: 'admin' | 'warga'
  noTelp?: string
  address?: string
  houseType?: string
  houseNumber?: string
  ownershipStatus?: 'sewa' | 'milik-sendiri' | 'milik-orang-tua' | 'unknown'
  headOfFamily?: string
  emergencyJob?: string
  movingDate?: string // Format: YYYY-MM-DD
  citizenStatus?: 'new_citizen' | 'active' | 'moved'
}

export const invitationService = {
  // Get supabase client
  getClient() {
    return createClient()
  },

  // Basic client-side validation (server-side validation lebih lengkap)
  validateInvitationData(data: InvitationData) {
    if (!data.email) {
      return { success: false, error: 'Email wajib diisi' }
    }
    
    if (!data.fullname) {
      return { success: false, error: 'Nama lengkap wajib diisi' }
    }
    
    if (!data.clusterId) {
      return { success: false, error: 'Cluster ID wajib diisi' }
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return { success: false, error: 'Format email tidak valid' }
    }

    return { success: true }
  },

  // Kirim undangan email menggunakan API Route (server-side)
  async sendInvitation(data: InvitationData) {
    try {
      // Kirim request ke API route
      const response = await fetch('/api/admin/invite-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          fullname: data.fullname,
          clusterId: data.clusterId,
          role: data.role || 'warga',
          noTelp: data.noTelp || '',
          address: data.address || '',
          houseType: data.houseType || '',
          houseNumber: data.houseNumber || '',
          ownershipStatus: data.ownershipStatus || 'unknown',
          headOfFamily: data.headOfFamily || '',
          emergencyJob: data.emergencyJob || '',
          movingDate: data.movingDate || null,
          citizenStatus: data.citizenStatus || 'new_citizen'
        })
      })

      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Gagal mengirim undangan'
        }
      }

      return {
        success: true,
        message: result.message,
        user: result.data?.user,
        metadata: result.data?.metadata
      }

    } catch (error: unknown) {
      console.error('Unexpected error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak terduga'
      return {
        success: false,
        error: errorMessage
      }
    }
  },

  // Resend invitation jika diperlukan
  async resendInvitation(email: string) {
    const supabase = this.getClient()

    try {
      const { error } = await supabase.auth.admin.inviteUserByEmail(email)
      
      if (error) {
        return { success: false, error: error.message }
      }

      return {
        success: true,
        message: 'Undangan berhasil dikirim ulang'
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal mengirim ulang undangan'
      return {
        success: false,
        error: errorMessage
      }
    }
  },

  // Get list of pending invitations (belum accept)
  async getPendingInvitations() {
    const supabase = this.getClient()

    try {
      // Query users yang email_confirmed_at masih null (belum konfirmasi email)
      const { data, error } = await supabase.auth.admin.listUsers()

      if (error) {
        return { success: false, error: error.message, data: [] }
      }

      // Filter user yang belum konfirmasi email
      const pendingUsers = data.users.filter(user => 
        !user.email_confirmed_at && user.invited_at
      )

      return {
        success: true,
        data: pendingUsers.map(user => ({
          id: user.id,
          email: user.email,
          invitedAt: user.invited_at,
          metadata: user.user_metadata
        }))
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal mengambil data undangan'
      return {
        success: false,
        error: errorMessage,
        data: []
      }
    }
  },

  // Delete/cancel invitation
  async cancelInvitation(userId: string) {
    const supabase = this.getClient()

    try {
      const { error } = await supabase.auth.admin.deleteUser(userId)
      
      if (error) {
        return { success: false, error: error.message }
      }

      return {
        success: true,
        message: 'Undangan berhasil dibatalkan'
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal membatalkan undangan'
      return {
        success: false,
        error: errorMessage
      }
    }
  }
} 