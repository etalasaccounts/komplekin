import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

interface ConfirmEmailTemplateProps {
  userName: string;
  confirmationUrl: string;
}

const ConfirmEmailTemplate = ({ userName, confirmationUrl }: ConfirmEmailTemplateProps) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>KomplekIn - Konfirmasi Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; }
          .info-box { background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
          .warning-box { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
          .security-box { background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">KomplekIn</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Konfirmasi Email Anda</p>
        </div>
        <div class="content">
          <h2 style="color: #1f2937; margin-top: 0;">Halo ${userName}!</h2>
          <p>Terima kasih telah mendaftar di KomplekIn! Untuk melanjutkan penggunaan sistem manajemen komplek, silakan konfirmasi alamat email Anda.</p>
          
          <div class="info-box">
            <h3 style="margin: 0 0 15px 0; color: #1f2937;">Konfirmasi Email</h3>
            <p style="margin: 0 0 15px 0;">Klik tombol di bawah ini untuk mengkonfirmasi alamat email Anda:</p>
            <div style="text-align: center;">
              <a href="${confirmationUrl}" class="button">Konfirmasi Email</a>
            </div>
          </div>

          <div class="warning-box">
            <p style="margin: 0; font-size: 14px;"><strong>Jika tombol tidak berfungsi:</strong><br />
            Salin dan tempel link berikut di browser Anda:</p>
            <p style="background: #f9fafb; padding: 10px; border-radius: 4px; word-break: break-all; margin: 10px 0 0 0; font-size: 12px; color: #6b7280;">
              ${confirmationUrl}
            </p>
          </div>

          <div class="security-box">
            <p style="margin: 0; font-size: 14px; color: #dc2626;"><strong>Keamanan:</strong></p>
            <ul style="margin: 10px 0; padding-left: 20px; font-size: 14px;">
              <li>Link konfirmasi ini akan kedaluwarsa dalam 24 jam</li>
              <li>Jika Anda tidak mendaftar di KomplekIn, abaikan email ini</li>
              <li>Jangan bagikan link ini kepada orang lain</li>
            </ul>
          </div>

          <p style="margin-top: 30px;">Setelah email dikonfirmasi, Anda dapat mulai menggunakan semua fitur KomplekIn!</p>
          <p style="margin: 20px 0 0 0; font-size: 14px; color: #6b7280;">Jika Anda mengalami kesulitan, silakan hubungi tim support KomplekIn.</p>
        </div>
        <div class="footer">
          <p style="margin: 0;">© 2025 KomplekIn. Sistem Manajemen Komplek Modern.</p>
          <p style="margin: 5px 0 0 0;">Email ini dikirim secara otomatis, mohon tidak membalas.</p>
        </div>
      </body>
    </html>
  `;
};

export async function POST(request: Request) {
  try {
    const { userName, email, confirmationUrl } = await request.json();

    // Debug logging
    console.log('Attempting to send confirmation email to:', email);
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL);

    // Validate required environment variables
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    // RESEND_FROM_EMAIL is optional, will use default 'onboarding@resend.dev' if not set

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Validate required fields
    if (!userName || !confirmationUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: [email],
      subject: 'Konfirmasi Email - KomplekIn',
      html: ConfirmEmailTemplate({ userName, confirmationUrl }),
    });

    if (error) {
      console.error('Resend API error:', error);
      return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
    }

    console.log('Confirmation email sent successfully:', data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error in confirmation email API:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, { status: 500 });
  }
}