import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, NextRequest } from 'next/server';
import crypto from 'crypto';

// Inisialisasi Supabase admin client dengan service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function untuk create supabase client dengan proper SSR handling
function createSupabaseClient(request: NextRequest, response: NextResponse) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return null
  }

  try {
    return createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    })
  } catch (error) {
    console.error('Error creating Supabase client:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  const response = NextResponse.next();
  
  try {
    // Validasi environment variables
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not set');
      return NextResponse.json({ error: 'Admin service not configured' }, { status: 500 });
    }

    const { token, purpose, newPassword } = await request.json();

    // Validasi parameter yang diperlukan
    if (!newPassword) {
      return NextResponse.json({ 
        error: 'Missing required parameter: newPassword' 
      }, { status: 400 });
    }

    // Handle force_reset case (user already logged in)
    if (purpose === 'force_reset') {
      // Get current user from session using cookies
      const supabase = createSupabaseClient(request, response);
      if (!supabase) {
        return NextResponse.json({ 
          error: 'Failed to create Supabase client' 
        }, { status: 500 });
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        return NextResponse.json({ 
          error: 'User not authenticated. Please login again.' 
        }, { status: 401 });
      }

      // Update password for current user
      const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { password: newPassword }
      );

      if (passwordError) {
        console.error('Error updating user password:', passwordError);
        return NextResponse.json({ 
          error: 'Failed to update user password' 
        }, { status: 500 });
      }

      // Update email verification status to true after password reset
      console.log('Updating email verification status for user:', user.id);
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ 
          is_email_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select();

      if (profileError) {
        console.error('Error updating email verification status:', profileError);
        console.error('Profile error details:', JSON.stringify(profileError, null, 2));
        // Don't fail the password reset, just log the error
      } else {
        console.log('Email verification status updated successfully:', profileData);
        console.log('Profile data after update:', JSON.stringify(profileData, null, 2));
      }

      // Also flag user_permissions.is_email_verified = true to satisfy login check
      try {
        const { error: permError } = await supabaseAdmin
          .from('user_permissions')
          .update({ is_email_verified: true })
          .eq('user_id', user.id)

        if (permError) {
          console.error('Error updating user_permissions verification flag:', permError)
        }
      } catch (permEx) {
        console.error('Exception updating user_permissions verification flag:', permEx)
      }

      console.log('Force password reset successful for user:', user.id);

      return NextResponse.json({
        success: true,
        message: 'Password updated successfully',
        user: {
          id: user.id,
          email: user.email
        }
      });
    }

    // Handle regular password reset with token
    if (!token || !purpose) {
      return NextResponse.json({ 
        error: 'Missing required parameters: token and purpose' 
      }, { status: 400 });
    }

    // Validasi purpose
    if (purpose !== 'password_reset') {
      return NextResponse.json({ 
        error: 'Invalid purpose parameter' 
      }, { status: 400 });
    }

    // Validasi password strength
    if (newPassword.length < 8) {
      return NextResponse.json({ 
        error: 'Password must be at least 8 characters long' 
      }, { status: 400 });
    }

    // Hash token yang diterima untuk pencarian di database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Cari token yang valid di database
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('user_tokens')
      .select('*, user_permissions(user_id)')
      .eq('token', hashedToken)
      .eq('purpose', 'password_reset')
      .is('consumed_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (tokenError || !tokenData) {
      console.error('Token validation error:', tokenError);
      return NextResponse.json({ 
        error: 'Invalid or expired reset token' 
      }, { status: 400 });
    }

    // Token ditemukan dan valid, sekarang update password user
    // Ambil user_id dari user_permissions
    const userId = tokenData.user_permissions?.user_id;
    
    if (!userId) {
      console.error('User ID not found in user_permissions');
      return NextResponse.json({ 
        error: 'Invalid token: user not found' 
      }, { status: 400 });
    }

    const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (passwordError) {
      console.error('Error updating user password:', passwordError);
      return NextResponse.json({ 
        error: 'Failed to update user password' 
      }, { status: 500 });
    }

    // Update email verification status to true after password reset
    console.log('Updating email verification status for user (regular reset):', userId);
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        is_email_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select();

    if (profileError) {
      console.error('Error updating email verification status (regular reset):', profileError);
      console.error('Profile error details (regular reset):', JSON.stringify(profileError, null, 2));
      // Don't fail the password reset, just log the error
    } else {
      console.log('Email verification status updated successfully (regular reset):', profileData);
      console.log('Profile data after update (regular reset):', JSON.stringify(profileData, null, 2));
    }

    // Also set user_permissions.is_email_verified = true
    try {
      const { error: permError } = await supabaseAdmin
        .from('user_permissions')
        .update({ is_email_verified: true })
        .eq('user_id', userId)

      if (permError) {
        console.error('Error updating user_permissions verification flag (regular reset):', permError)
      }
    } catch (permEx) {
      console.error('Exception updating user_permissions verification flag (regular reset):', permEx)
    }

    // Mark token sebagai consumed
    const { error: consumeError } = await supabaseAdmin
      .from('user_tokens')
      .update({ consumed_at: new Date().toISOString() })
      .eq('id', tokenData.id);

    if (consumeError) {
      console.error('Error marking token as consumed:', consumeError);
      // Tidak return error karena password sudah berhasil diupdate
      console.warn('Token consumed_at update failed, but password update succeeded');
    }

    // Ambil informasi user untuk response
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(
      userId
    );

    if (userError) {
      console.error('Error fetching user data:', userError);
      // Tidak return error karena password update sudah berhasil
    }

    console.log('Password reset successful for user:', userId);

    return NextResponse.json({
      success: true,
      message: 'Password reset successful',
      user: userData?.user ? {
        id: userData.user.id,
        email: userData.user.email
      } : null
    });

  } catch (error) {
    console.error('Unexpected error in password reset verification API:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, { status: 500 });
  }
} 