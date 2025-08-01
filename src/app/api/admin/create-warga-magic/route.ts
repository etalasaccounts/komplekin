import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Create admin client dengan service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

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

// Helper function to generate secure temporary password
const generateTemporaryPassword = (length: number = 8): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*'
  
  // Ensure at least one number and one symbol
  let result = ''
  result += numbers.charAt(Math.floor(Math.random() * numbers.length))
  result += symbols.charAt(Math.floor(Math.random() * symbols.length))
  
  // Fill the rest with random characters
  for (let i = 2; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  
  // Shuffle the result
  return result.split('').sort(() => Math.random() - 0.5).join('')
}

// Database enum mapping
const mapCitizenStatusToDatabase = (frontendStatus: string): string => {
  switch (frontendStatus) {
    case 'Warga Baru':
      return 'Warga baru' // Database enum value
    case 'Pindah':
      return 'Pindah' // Database enum value
    case 'Aktif':
      return 'Warga baru' // Fallback to 'Warga baru' since 'Aktif' is not in database enum
    default:
      return 'Warga baru' // Default fallback
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: CreateWargaMagicData = await request.json()
    const {
      email,
      fullname,
      clusterId,
      role = 'user',
      noTelp = '',
      address = '',
      houseType = '',
      houseNumber = '',
      ownershipStatus = 'unknown',
      headOfFamily = '',
      emergencyJob = '',
      movingDate,
      citizenStatus = 'Warga Baru'
    } = body

    // 1. Validasi input
    if (!email || !fullname || !clusterId) {
      return NextResponse.json(
        { success: false, error: 'Email, fullname, dan clusterId wajib diisi' },
        { status: 400 }
      )
    }

    // 2. Validasi cluster exists
    const { data: cluster, error: clusterError } = await supabaseAdmin
      .from('clusters')
      .select('id, cluster_name')
      .eq('id', clusterId)
      .single()

    if (clusterError || !cluster) {
      return NextResponse.json(
        { success: false, error: 'Cluster tidak ditemukan' },
        { status: 400 }
      )
    }

    // 3. Cek apakah email sudah terdaftar
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const emailExists = existingUsers.users.some(user => user.email === email)

    if (emailExists) {
      return NextResponse.json(
        { success: false, error: 'Email sudah terdaftar di sistem' },
        { status: 400 }
      )
    }

    // 4. Generate temporary password
    const temporaryPassword = generateTemporaryPassword()
    console.log('Generated temporary password for', email, ':', temporaryPassword)

    // 5. Create user dengan email confirmation disabled dan temporary password
    const { data: createUserResult, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: temporaryPassword, // Set temporary password
      email_confirm: false, // User akan login via magic link
      user_metadata: {
        fullname: fullname,
        clusterId: clusterId,
        role: role,
        created_by_admin: true,
        needs_password_setup: true, // Flag untuk menandai user perlu setup password
        temporary_password: temporaryPassword, // Store for email template
        cluster_name: cluster.cluster_name
      }
    })

    if (createUserError || !createUserResult.user) {
      throw new Error(`User creation failed: ${createUserError?.message}`)
    }

    const userId = createUserResult.user.id

    // 6. Create profile dulu, kemudian user_permissions
    let magicLinkResult: { properties: { action_link: string } } | null = null
    
    try {
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          fullname: fullname,
          email: email,
          no_telp: noTelp,
          address: address,
          house_type: houseType,
          house_number: houseNumber,
          ownership_status: ownershipStatus,
          emergency_job: emergencyJob,
          head_of_family: headOfFamily,
          moving_date: movingDate ? new Date(movingDate) : null,
          citizen_status: mapCitizenStatusToDatabase(citizenStatus)
        })
        .select('id')
        .single()

      if (profileError) {
        throw new Error(`Profile creation failed: ${profileError.message}`)
      }

      const { error: permissionError } = await supabaseAdmin
        .from('user_permissions')
        .insert({
          user_id: userId,
          profile_id: profileData.id,
          cluster_id: clusterId,
          role: role
        })

      if (permissionError) {
        throw new Error(`Permission creation failed: ${permissionError.message}`)
      }

      // 7. Generate magic link with temporary password verification
      const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=${role}&setup=true&verify_temp=true`
      
      const { data: linkData, error: magicLinkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: email,
        options: {
          redirectTo: redirectUrl
        }
      })

      if (magicLinkError) {
        console.warn('Magic link generation failed:', magicLinkError.message)
        throw new Error(`Magic link generation failed: ${magicLinkError.message}`)
      }

      magicLinkResult = linkData

      // Note: Magic link dari generateLink tidak otomatis mengirim email
      // Admin perlu share magic link URL secara manual atau via external email service

      // 8. Magic link berhasil dibuat
      console.log('Magic link generated for:', email)
      console.log('User created with ID:', userId)
      console.log('Temporary password:', temporaryPassword)
      console.log('Profile dan permissions sudah siap')
      console.log('Magic link URL:', magicLinkResult?.properties?.action_link)

    } catch (profilePermissionError) {
      // Rollback user creation if profile/permission creation fails
      await supabaseAdmin.auth.admin.deleteUser(userId)
      throw new Error(`Failed to create user profile/permission: ${profilePermissionError instanceof Error ? profilePermissionError.message : String(profilePermissionError)}`)
    }

    // 9. Generate role description for email template
    const getRoleDescription = (userRole: string) => {
      switch (userRole) {
        case 'admin':
          return {
            title: 'Administrator Cluster',
            description: 'Anda memiliki akses penuh untuk mengelola cluster, warga, dan transaksi keuangan.',
            permissions: [
              'Mengelola data warga cluster',
              'Memverifikasi pembayaran iuran',
              'Melihat laporan keuangan',
              'Menambah/menghapus warga'
            ]
          }
        case 'user':
        default:
          return {
            title: 'Warga Cluster',
            description: 'Anda dapat mengakses informasi pribadi, membayar iuran, dan melihat riwayat pembayaran.',
            permissions: [
              'Melihat profil pribadi',
              'Membayar iuran bulanan',
              'Melihat riwayat pembayaran',
              'Update informasi kontak'
            ]
          }
      }
    }

    const roleInfo = getRoleDescription(role)

    // 10. Return success response with temporary password and role info
    return NextResponse.json({
      success: true,
      message: `Warga ${fullname} berhasil dibuat dengan magic link`,
      data: {
        userId: userId,
        email: email,
        fullname: fullname,
        profileId: 'created',
        permissionId: 'created',
        cluster: cluster.cluster_name,
        role: role,
        roleInfo: roleInfo,
        temporaryPassword: temporaryPassword,
        magicLink: magicLinkResult?.properties?.action_link || null,
        emailTemplate: {
          subject: `Selamat Datang di KomplekIn - Akun Anda Telah Dibuat`,
          greeting: `Halo ${fullname},`,
          intro: `Selamat datang di KomplekIn! Akun Anda telah berhasil dibuat untuk cluster "${cluster.cluster_name}".`,
          roleSection: {
            title: `Role Anda: ${roleInfo.title}`,
            description: roleInfo.description,
            permissions: roleInfo.permissions
          },
          instructionsSection: {
            title: 'Cara Mengakses Akun:',
            steps: [
              '1. Klik link magic di bawah ini',
              '2. Masukkan password sementara yang disediakan',
              '3. Buat password baru untuk keamanan akun Anda',
              '4. Mulai gunakan sistem KomplekIn'
            ]
          },
          credentials: {
            email: email,
            temporaryPassword: temporaryPassword
          },
          magicLink: magicLinkResult?.properties?.action_link || null,
          footer: 'Jika Anda mengalami kendala, silakan hubungi administrator cluster.'
        }
      }
    })

  } catch (error) {
    console.error('Unexpected error in create-warga-magic API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Terjadi kesalahan server' 
      },
      { status: 500 }
    )
  }
}

 