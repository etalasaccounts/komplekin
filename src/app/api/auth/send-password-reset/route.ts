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

    const { email, isAdmin = false } = await request.json();

    // Validasi input
    if (!email) {
      return NextResponse.json({ error: 'Missing required field: email' }, { status: 400 });
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Cari user berdasarkan email
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userError) {
      console.error('Error fetching users:', userError);
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }

    const user = userData.users.find(u => u.email === email);
    if (!user) {
      // Return success untuk security (tidak reveal user existence)
      console.log('Password reset requested for non-existent email:', email);
      return NextResponse.json({ 
        success: true, 
        message: 'If the email exists, a password reset link has been sent' 
      });
    }

    // Cari user_permissions berdasarkan user.id
    const { data: userPermissions, error: permissionsError } = await supabaseAdmin
      .from('user_permissions')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (permissionsError || !userPermissions) {
      console.error('Error fetching user permissions:', permissionsError);
      return NextResponse.json({ error: 'Failed to fetch user permissions' }, { status: 500 });
    }

    // Generate cryptographically secure random token (32 bytes = 256 bits)
    const plainToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token menggunakan SHA-256 sebelum disimpan ke database
    const hashedToken = crypto.createHash('sha256').update(plainToken).digest('hex');
    
    // Set expiration time (1 jam dari sekarang untuk password reset)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Simpan token yang sudah di-hash ke database
    const { error: tokenError } = await supabaseAdmin
      .from('user_tokens')
      .insert({
        user_id: userPermissions.id, // Menggunakan user_permissions.id
        token: hashedToken,
        purpose: 'password_reset',
        expires_at: expiresAt.toISOString(),
      });

    if (tokenError) {
      console.error('Error saving token to database:', tokenError);
      return NextResponse.json({ error: 'Failed to generate reset token' }, { status: 500 });
    }

    // Buat URL reset password
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const userType = isAdmin ? 'admin' : 'user';
    const resetUrl = `${baseUrl}/${userType}/auth/reset-password?token=${plainToken}&purpose=password_reset`;

    // Ambil nama user dari metadata atau gunakan email
    const userName = user.user_metadata?.fullname || user.email?.split('@')[0] || 'User';

    // Kirim email menggunakan API send-email/reset-password
    try {
      const emailResponse = await fetch(`${baseUrl}/api/send-email/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resetUrl,
          email,
          userName,
          isAdmin
        })
      });

      if (!emailResponse.ok) {
        console.error('Failed to send email via send-email API');
        // Token sudah dibuat, jadi kita tidak return error
        // User bisa request ulang jika email tidak terkirim
      }
    } catch (emailError) {
      console.error('Error calling send-email API:', emailError);
      // Token sudah dibuat, jadi kita tidak return error
    }

    console.log('Password reset token generated successfully for:', email);
    
    return NextResponse.json({ 
      success: true, 
      message: 'If the email exists, a password reset link has been sent',
      data: {
        tokenGenerated: true,
        resetUrl: resetUrl
      }
    });

  } catch (error) {
    console.error('Unexpected error in password reset token generation:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, { status: 500 });
  }
} 