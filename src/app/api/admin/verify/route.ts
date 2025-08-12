import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Inisialisasi Supabase admin client dengan service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    // Validasi environment variables
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not set');
      return NextResponse.json({ error: 'Admin service not configured' }, { status: 500 });
    }

    // Ambil query parameters
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const purpose = searchParams.get('purpose');

    // Validasi parameter yang diperlukan
    if (!token || !purpose) {
      return NextResponse.json({ 
        error: 'Missing required parameters: token and purpose' 
      }, { status: 400 });
    }

    // Validasi purpose
    if (purpose !== 'email_verification') {
      return NextResponse.json({ 
        error: 'Invalid purpose parameter' 
      }, { status: 400 });
    }

    // Hash token yang diterima untuk pencarian di database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Cari token yang valid di database
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('user_tokens')
      .select('*')
      .eq('token', hashedToken)
      .eq('purpose', 'email_verification')
      .is('consumed_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (tokenError || !tokenData) {
      console.error('Token validation error:', tokenError);
      return NextResponse.json({ 
        error: 'Invalid or expired verification token' 
      }, { status: 400 });
    }

    // Token ditemukan dan valid, sekarang update user profile
    const { error: profileError } = await supabaseAdmin
      .from('user_permissions')
      .update({ is_email_verified: true })
      .eq('id', tokenData.user_id);

    if (profileError) {
      console.error('Error updating user profile:', profileError);
      return NextResponse.json({ 
        error: 'Failed to verify user profile' 
      }, { status: 500 });
    }

    // Mark token sebagai consumed
    const { error: consumeError } = await supabaseAdmin
      .from('user_tokens')
      .update({ consumed_at: new Date().toISOString() })
      .eq('id', tokenData.id);

    if (consumeError) {
      console.error('Error marking token as consumed:', consumeError);
      // Tidak return error karena profile sudah berhasil diupdate
      console.warn('Token consumed_at update failed, but profile verification succeeded');
    }

    // Ambil informasi user untuk response
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(
      tokenData.user_id
    );

    if (userError) {
      console.error('Error fetching user data:', userError);
      // Tidak return error karena verifikasi sudah berhasil
    }

    console.log('Admin email verification successful for user:', tokenData.user_id);

    return NextResponse.json({
      success: true,
      message: 'Email verification successful',
      user: userData?.user ? {
        id: userData.user.id,
        email: userData.user.email,
        verified: true
      } : null
    });

  } catch (error) {
    console.error('Unexpected error in admin verification API:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, { status: 500 });
  }
} 