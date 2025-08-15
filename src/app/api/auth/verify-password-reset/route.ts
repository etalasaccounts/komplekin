import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Inisialisasi Supabase admin client dengan service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    // Validasi environment variables
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not set');
      return NextResponse.json({ error: 'Admin service not configured' }, { status: 500 });
    }

    const { token, purpose, newPassword } = await request.json();

    // Validasi parameter yang diperlukan
    if (!token || !purpose || !newPassword) {
      return NextResponse.json({ 
        error: 'Missing required parameters: token, purpose, and newPassword' 
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