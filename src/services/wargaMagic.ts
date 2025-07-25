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
  citizenStatus?: 'Pindah' | 'Warga baru'
}

export interface CreateWargaMagicResult {
  success: boolean
  message?: string
  error?: string
  data?: {
    userId: string
    email: string
    profileId: string
    permissionId: string
    cluster: string
    magicLink: string | null
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

      // Call API route yang baru (create user + profile + permissions + magic link sekaligus)
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
          error: result.error || 'Gagal membuat warga baru'
        }
      }

      return {
        success: true,
        message: result.message,
        data: result.data
      }

    } catch (error: unknown) {
      console.error('Unexpected error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak terduga'
      return {
        success: false,
        error: errorMessage
      }
    }
  }
} 