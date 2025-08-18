export interface CreateWargaMagicData {
  email: string
  fullname: string
  clusterId: string
  role?: 'admin' | 'user'
  noTelp?: string
  address?: string
  houseType?: string
  houseNumber?: string
  ownershipStatus?: 'sewa' | 'milik-sendiri' | 'milik-orang-tua' | 'unknown'
  headOfFamily?: string
  emergencyJob?: string
  movingDate?: string // Format: YYYY-MM-DD
  citizenStatus?: 'Pindah' | 'Warga Baru' // Only valid database enum values
}

export interface CreateWargaMagicResult {
  success: boolean
  message?: string
  error?: string
  data?: {
    userId: string
    email: string
    fullname: string
    profileId: string
    permissionId: string
    cluster: string
    role: string
    roleInfo: {
      title: string
      description: string
      permissions: string[]
    }
    temporaryPassword: string
    emailTemplate: {
      subject: string
      greeting: string
      intro: string
      roleSection: {
        title: string
        description: string
        permissions: string[]
      }
      instructionsSection: {
        title: string
        steps: string[]
      }
      credentials: {
        email: string
        temporaryPassword: string
      }
      footer: string
    }
  }
}

// Helper function to map database values to display values
const mapCitizenStatusDisplay = (dbStatus: string): string => {
  switch (dbStatus) {
    case 'Warga baru':
      return 'Warga Baru'
    case 'Pindah':
      return 'Pindah'
    default:
      return 'Warga Baru'
  }
}

export const wargaMagicService = {
  // Validasi data warga (client-side)
  validateWargaData(data: CreateWargaMagicData): { success: boolean; error?: string } {
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

  // Client-side function untuk call API create warga dengan magic link
  async createWargaWithMagicLink(data: CreateWargaMagicData): Promise<CreateWargaMagicResult> {
    try {
      // Client-side validation terlebih dahulu
      const validation = this.validateWargaData(data)
      if (!validation.success) {
        return { success: false, error: validation.error }
      }

      // Call API route untuk create user + profile + permissions + magic link sekaligus
      const response = await fetch('/api/admin/create-warga-magic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Gagal membuat warga baru dengan magic link'
        }
      }

      return {
        success: true,
        message: result.message || 'Warga berhasil dibuat dengan magic link',
        data: result.data
      }

    } catch (error: unknown) {
      console.error('Unexpected error in createWargaWithMagicLink:', error)
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak terduga'
      return {
        success: false,
        error: errorMessage
      }
    }
  },

  // Helper untuk generate magic link preview (untuk testing/debugging)
  formatMagicLinkInfo(result: CreateWargaMagicResult) {
    if (!result.success || !result.data) {
      return null
    }

    return {
      email: result.data.email,
      fullname: result.data.fullname,
      cluster: result.data.cluster,
      role: result.data.role,
      roleInfo: result.data.roleInfo,
      temporaryPassword: result.data.temporaryPassword,
      userId: result.data.userId,
      emailTemplate: result.data.emailTemplate
    }
  },

  // Helper untuk mapping citizen status dari database ke display
  mapCitizenStatusDisplay
} 