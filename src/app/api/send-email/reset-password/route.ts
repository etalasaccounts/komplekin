import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

interface ResetPasswordEmailTemplateProps {
  resetUrl: string;
  userName?: string;
  isAdmin?: boolean;
}

const ResetPasswordEmailTemplate = ({ resetUrl, userName, isAdmin = false }: ResetPasswordEmailTemplateProps) => {
  const userType = isAdmin ? 'Admin' : 'Warga';
  const headerColor = isAdmin ? 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
  const buttonColor = isAdmin ? '#1e40af' : '#10b981';
  const infoBoxColor = isAdmin ? '#eff6ff' : '#ecfdf5';
  const borderColor = isAdmin ? '#1e40af' : '#10b981';
  const badgeBg = isAdmin ? '#1e40af' : '#10b981';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>KomplekIn - Reset Password ${userType}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
          .header { background: ${headerColor}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: ${buttonColor}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; }
          .info-box { background: ${infoBoxColor}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${borderColor}; }
          .warning-box { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
          .security-box { background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444; }
          .user-badge { background: ${badgeBg}; color: white; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; display: inline-block; margin-bottom: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">KomplekIn</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Reset Password ${userType}</p>
        </div>
        <div class="content">
          <div class="user-badge">${userType.toUpperCase()} ACCESS</div>
          <h2 style="color: #1f2937; margin-top: 0;">
            Halo${userName ? ` ${userName}` : ''}!
          </h2>
          <p>Kami menerima permintaan untuk mereset password akun ${userType.toLowerCase()} Anda di KomplekIn. Jika Anda tidak meminta reset password, abaikan email ini.</p>
          
          <div class="info-box">
            <h3 style="margin: 0 0 15px 0; color: #1f2937;">Reset Password ${userType}</h3>
            <p style="margin: 0 0 15px 0;">Klik tombol di bawah ini untuk mereset password Anda:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
          </div>

          <div class="warning-box">
            <p style="margin: 0; font-size: 14px;"><strong>Jika tombol tidak berfungsi:</strong><br />
            Salin dan tempel link berikut di browser Anda:</p>
            <p style="background: #f9fafb; padding: 10px; border-radius: 4px; word-break: break-all; margin: 10px 0 0 0; font-size: 12px; color: #6b7280;">
              ${resetUrl}
            </p>
          </div>

          <div class="security-box">
            <p style="margin: 0; font-size: 14px; color: #dc2626;"><strong>Keamanan:</strong></p>
            <ul style="margin: 10px 0; padding-left: 20px; font-size: 14px;">
              <li>Link reset password ini akan kedaluwarsa dalam 1 jam</li>
              <li>Hanya untuk reset password - jangan bagikan dengan siapapun</li>
              <li>Jika Anda tidak meminta reset password, abaikan email ini</li>
              <li>Password baru akan segera aktif setelah Anda membuat yang baru</li>
            </ul>
          </div>

          <p style="margin-top: 30px;">Setelah password direset, Anda dapat login kembali ke akun ${userType.toLowerCase()} KomplekIn!</p>
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
    const { resetUrl, email, userName, isAdmin = false } = await request.json();

    // Debug logging
    console.log('Attempting to send reset password email to:', email);
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

    // Validate resetUrl is provided
    if (!resetUrl || typeof resetUrl !== 'string') {
      return NextResponse.json({ error: 'Invalid reset URL' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: [email],
      subject: `Reset Password ${isAdmin ? 'Admin' : 'Warga'} - KomplekIn`,
      html: ResetPasswordEmailTemplate({ resetUrl, userName, isAdmin }),
    });

    if (error) {
      console.error('Resend API error:', error);
      return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
    }

    console.log('Reset password email sent successfully:', data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error in reset password email API:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, { status: 500 });
  }
}