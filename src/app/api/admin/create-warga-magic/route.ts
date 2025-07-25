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
  citizenStatus?: 'Pindah' | 'Warga Baru'
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
      citizenStatus = 'new_citizen'
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

    // 4. Create user dengan email confirmation disabled
    const { data: createUserResult, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      email_confirm: false, // User akan confirm via reset password email
      user_metadata: {
        fullname: fullname,
        clusterId: clusterId,
        role: role,
        created_by_admin: true
      }
    })

    if (createUserError || !createUserResult.user) {
      throw new Error(`User creation failed: ${createUserError?.message}`)
    }

    const userId = createUserResult.user.id

    // 5. Create profile dulu, kemudian user_permissions
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
          citizen_status: citizenStatus || 'Warga baru'
        })
        .select('id')
        .single()

      if (profileError) {
        throw new Error(`Profile creation failed: ${profileError.message}`)
      }

      const { error: permissionError } = await supabaseAdmin
        .from('user_permissions')
        .insert({
          id: Math.floor(Date.now() + Math.random() * 1000),
          user_id: userId,
          profile_id: profileData.id,
          cluster_id: clusterId,
          role: role
        })

      if (permissionError) {
        throw new Error(`Permission creation failed: ${permissionError.message}`)
      }

      // 6. Send reset password email (most reliable email method)
      const { createClient } = await import('@/lib/supabase/server')
      const supabaseClient = await createClient()
      
      const { error: resetError } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=${role}`
      })

      if (resetError) {
        console.warn('Reset password email failed:', resetError.message)
      }

      // 7. Reset password email dikirim otomatis
      console.log('Reset password email sent to:', email)
      console.log('User created with ID:', userId)
      console.log('Profile dan permissions sudah siap')

    } catch (profilePermissionError) {
      // Rollback user creation if profile/permission creation fails
      await supabaseAdmin.auth.admin.deleteUser(userId)
      throw new Error(`Failed to create user profile/permission: ${profilePermissionError instanceof Error ? profilePermissionError.message : String(profilePermissionError)}`)
    }

    // 8. Return success response
    return NextResponse.json({
      success: true,
      message: `Warga ${fullname} berhasil dibuat`,
      data: {
        userId: userId,
        email: email,
        profileId: 'created',
        permissionId: 'created',
        cluster: cluster.id,
        magicLink: null // magicLinkResult?.properties?.action_link || null
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

 