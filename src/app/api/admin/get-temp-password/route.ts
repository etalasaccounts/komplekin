import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Create admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Get user by email using admin client
    const { data: { users }, error: getUserError } = await supabaseAdmin.auth.admin.listUsers()

    if (getUserError) {
      console.error('Error fetching users:', getUserError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user data' },
        { status: 500 }
      )
    }

    // Find user by email
    const user = users.find(u => u.email === email)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Get temporary password from user metadata
    const temporaryPassword = user.user_metadata?.temporary_password

    if (!temporaryPassword) {
      return NextResponse.json(
        { success: false, error: 'Temporary password not found in user metadata' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      temporaryPassword: temporaryPassword
    })

  } catch (error) {
    console.error('Error in get-temp-password API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}