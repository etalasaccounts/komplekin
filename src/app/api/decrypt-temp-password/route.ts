import { NextRequest, NextResponse } from 'next/server';
import { decryptTempPassword } from '@/lib/crypto';

export async function POST(request: NextRequest) {
  try {
    const { encryptedPassword } = await request.json();

    if (!encryptedPassword) {
      return NextResponse.json(
        { error: 'Encrypted password is required' },
        { status: 400 }
      );
    }

    const decryptedPassword = decryptTempPassword(encryptedPassword);

    return NextResponse.json({ 
      success: true, 
      password: decryptedPassword 
    });

  } catch (error) {
    console.error('Decryption API error:', error);
    return NextResponse.json(
      { error: 'Failed to decrypt password' },
      { status: 500 }
    );
  }
}