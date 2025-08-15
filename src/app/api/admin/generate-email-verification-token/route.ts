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

    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const { userPermissionId} = await request.json();

    // Validasi input
    if (!userPermissionId) {
      return NextResponse.json({ error: 'Missing required fields: userPermissionId' }, { status: 400 });
    }

    // Generate cryptographically secure random token (32 bytes = 256 bits)
    const plainToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token menggunakan SHA-256 sebelum disimpan ke database
    const hashedToken = crypto.createHash('sha256').update(plainToken).digest('hex');
    
    // Set expiration time (24 jam dari sekarang)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Simpan token yang sudah di-hash ke database
    const { error: tokenError } = await supabaseAdmin
      .from('user_tokens')
      .insert({
        user_id: userPermissionId,
        token: hashedToken,
        purpose: 'email_verification',
        expires_at: expiresAt.toISOString(),
      });

    if (tokenError) {
      console.error('Error saving token to database:', tokenError);
      return NextResponse.json({ error: 'Failed to generate verification token' }, { status: 500 });
    }

    // Buat URL konfirmasi
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const confirmationUrl = `${baseUrl}/admin/auth/verify?token=${plainToken}&purpose=email_verification`;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Verification email sent successfully',
      data: {
        confirmationUrl: confirmationUrl,
        token: hashedToken
      }
    });

  } catch (error) {
    console.error('Unexpected error in admin confirmation API:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, { status: 500 });
  }
} 