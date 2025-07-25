import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Create admin client dengan service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key dari environment
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { 
      email, 
      fullname, 
      clusterId, 
      role = 'warga',
      noTelp = '',
      address = '',
      houseType = '',
      houseNumber = '',
      ownershipStatus = 'unknown',
      headOfFamily = '',
      emergencyJob = '',
      movingDate = null,
      citizenStatus = 'new_citizen'
    } = body

    // Validation
    if (!email || !fullname || !clusterId) {
      return NextResponse.json(
        { success: false, error: 'Email, fullname, dan clusterId wajib diisi' },
        { status: 400 }
      )
    }

    // 1. Validasi cluster exists
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

    // 2. Validasi email belum terdaftar
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const emailExists = existingUsers.users.some(user => user.email === email)

    if (emailExists) {
      return NextResponse.json(
        { success: false, error: 'Email sudah terdaftar di sistem' },
        { status: 400 }
      )
    }

    // 3. Siapkan metadata untuk user baru
    // Role sudah sesuai dengan database enum, tidak perlu mapping
    
    const userMetadata = {
      clusterId: clusterId,
      fullname,
      role, // Role sudah sesuai: 'user' atau 'admin'
      noTelp: noTelp,
      address,
      houseType: houseType,
      houseNumber: houseNumber,
      ownershipStatus: ownershipStatus,
      headOfFamily: headOfFamily,
      emergencyJob: emergencyJob,
      movingDate: movingDate,
      citizenStatus: citizenStatus
    }

    // 4. Log metadata untuk debugging
    console.log('User Metadata yang akan dikirim:', JSON.stringify(userMetadata, null, 2));

    // 4. Kirim undangan menggunakan Admin API
    const { data: inviteResult, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        data: userMetadata,
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=user`
      }
    )

    if (inviteError) {
      console.error('Error sending invitation:', inviteError)
      return NextResponse.json(
        { success: false, error: inviteError.message || 'Gagal mengirim undangan' },
        { status: 500 }
      )
    }

    // 5. Return success response
    return NextResponse.json({
      success: true,
      message: 'Undangan berhasil dikirim',
      data: {
        user: {
          id: inviteResult.user?.id,
          email: inviteResult.user?.email
        },
        cluster: cluster.cluster_name,
        metadata: userMetadata
      }
    })

  } catch (error) {
    console.error('Unexpected error in invite API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Terjadi kesalahan server' 
      },
      { status: 500 }
    )
  }
} 