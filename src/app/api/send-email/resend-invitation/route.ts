import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

interface TemporaryPasswordEmailTemplateProps {
  userName: string;
  email: string;
  temporaryPassword: string;
  magicLink: string;
  clusterName: string;
  role: string;
}

const TemporaryPasswordEmailTemplate = ({ 
  userName, 
  email, 
  temporaryPassword, 
  magicLink, 
  clusterName, 
  role 
}: TemporaryPasswordEmailTemplateProps) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>KomplekIn - Undangan Warga Baru</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f8fafc;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
          }
          .header { 
            background: linear-gradient(135deg, #0f766e 0%, #134e4a 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
            border-radius: 12px 12px 0 0; 
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header h1 {
            margin: 0;
            font-size: 32px;
            font-weight: 700;
            letter-spacing: -0.5px;
          }
          .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
            font-weight: 300;
          }
          .content { 
            background: white; 
            padding: 40px 30px; 
            border-radius: 0 0 12px 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .content h2 {
            color: #0f172a;
            margin-top: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .content p {
            color: #475569;
            font-size: 16px;
            margin: 16px 0;
          }
          .button { 
            display: inline-block; 
            background: linear-gradient(135deg, #0f766e 0%, #134e4a 100%); 
            color: white; 
            padding: 16px 32px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s ease;
            box-shadow: 0 4px 12px rgba(15, 118, 110, 0.3);
          }
          .button:hover {
            transform: translateY(-2px);
          }
          .footer { 
            text-align: center; 
            margin-top: 30px; 
            color: #64748b; 
            font-size: 14px; 
          }
          .credentials { 
            background: linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%); 
            padding: 24px; 
            border-radius: 12px; 
            margin: 24px 0; 
            border-left: 4px solid #0f766e;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          }
          .credentials h3 {
            margin: 0 0 16px 0;
            color: #0f172a;
            font-size: 18px;
            font-weight: 600;
          }
          .credentials p {
            margin: 8px 0;
            font-size: 15px;
          }
          .temp-password {
            background: #fff;
            padding: 12px 16px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 18px;
            font-weight: bold;
            color: #dc2626;
            letter-spacing: 1px;
            border: 2px solid #e5e7eb;
            display: inline-block;
            margin: 8px 0;
          }
          .steps {
            margin: 32px 0;
          }
          .steps h3 {
            color: #0f172a;
            margin-bottom: 20px;
            font-size: 20px;
            font-weight: 600;
          }
          .step {
            margin-bottom: 20px;
            padding: 16px;
            border-left: 3px solid #0f766e;
            background: #f8fafc;
            border-radius: 0 8px 8px 0;
          }
          .step-number {
            color: #0f766e;
            font-weight: 700;
            font-size: 16px;
          }
          .step p {
            margin: 8px 0 0 0;
            color: #475569;
            font-size: 15px;
          }
          .button-container {
            text-align: center;
            margin: 24px 0;
          }
          .link-box { 
            background: #f1f5f9; 
            padding: 16px; 
            border-radius: 8px; 
            word-break: break-all; 
            margin: 16px 0; 
            font-size: 13px; 
            color: #475569;
            border: 1px solid #e2e8f0;
          }
          .warning { 
            background: linear-gradient(135deg, #fef3c7 0%, #fef7cd 100%); 
            padding: 20px; 
            border-radius: 8px; 
            margin: 24px 0; 
            border-left: 4px solid #f59e0b;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          }
          .warning h4 {
            margin: 0 0 12px 0;
            color: #92400e;
            font-size: 16px;
            font-weight: 600;
          }
          .warning p {
            margin: 0;
            color: #92400e;
            font-size: 14px;
          }
          .security { 
            background: linear-gradient(135deg, #fef2f2 0%, #fef7f7 100%); 
            padding: 20px; 
            border-radius: 8px; 
            margin: 24px 0; 
            border-left: 4px solid #ef4444;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          }
          .security h4 {
            margin: 0 0 12px 0;
            color: #dc2626;
            font-size: 16px;
            font-weight: 600;
          }
          .security ul {
            margin: 0;
            padding-left: 20px;
            color: #dc2626;
          }
          .security li {
            margin: 6px 0;
            font-size: 14px;
          }
          .welcome-message {
            background: linear-gradient(135deg, #f0fdf4 0%, #f7fee7 100%);
            padding: 20px;
            border-radius: 8px;
            margin: 32px 0;
            text-align: center;
            border-left: 4px solid #22c55e;
          }
          .welcome-message p {
            margin: 0;
            color: #166534;
            font-size: 16px;
            font-weight: 500;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>KomplekIn</h1>
            <p>Sistem Manajemen Komplek Modern</p>
          </div>
          <div class="content">
            <h2>Selamat Datang, ${userName}!</h2>
            <p>Akun KomplekIn Anda telah berhasil dibuat oleh administrator. Anda sekarang dapat mengakses sistem manajemen komplek untuk <strong>${clusterName}</strong>.</p>
            
            <div class="credentials">
              <h3>Informasi Akun Anda</h3>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Password Sementara:</strong></p>
              <div class="temp-password">${temporaryPassword}</div>
              <p><strong>Role:</strong> ${role === 'admin' ? 'Administrator Cluster' : 'Warga Cluster'}</p>
              <p><strong>Cluster:</strong> ${clusterName}</p>
            </div>

            <div class="steps">
              <h3>Cara Memulai</h3>
              
              <div class="step">
                <div class="step-number">1. Verifikasi Email</div>
                <p>Klik tombol di bawah untuk memverifikasi email Anda dan masuk ke sistem:</p>
                <div class="button-container">
                  <a href="${magicLink}" class="button">Verifikasi & Masuk KomplekIn</a>
                </div>
              </div>

              <div class="step">
                <div class="step-number">2. Input Password Sementara</div>
                <p>Pada halaman verifikasi, masukkan password sementara yang tertera di atas.</p>
              </div>

              <div class="step">
                <div class="step-number">3. Buat Password Baru</div>
                <p>Setelah verifikasi berhasil, Anda akan diminta membuat password baru yang aman.</p>
              </div>
            </div>

            <div class="warning">
              <h4>Jika Tombol Tidak Berfungsi</h4>
              <p>Salin dan tempel link berikut di browser Anda:</p>
              <div class="link-box">${magicLink}</div>
            </div>

            <div class="security">
              <h4>Penting untuk Keamanan</h4>
              <ul>
                <li>Link verifikasi ini berlaku selama 24 jam</li>
                <li>Segera ganti password setelah login pertama</li>
                <li>Jangan bagikan password sementara kepada siapa pun</li>
                <li>Hubungi admin komplek jika mengalami kendala</li>
              </ul>
            </div>

            <div class="welcome-message">
              <p>🏠 Selamat bergabung di komunitas digital ${clusterName}!</p>
            </div>

            <p style="margin-top: 32px; color: #64748b; font-size: 14px;">
              Jika Anda memiliki pertanyaan atau memerlukan bantuan, silakan hubungi administrator komplek Anda.
            </p>
          </div>
          <div class="footer">
            <p>© 2025 KomplekIn - Powered by DigitalPlace</p>
            <p style="margin: 8px 0 0 0; font-size: 13px;">Email otomatis dari admin@digitalplace.id - mohon tidak membalas.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

export async function POST(request: Request) {
  try {
    const { userName, email, temporaryPassword, magicLink, clusterName, role } = await request.json();

    // Debug logging
    console.log('Attempting to send invitation email to:', email);
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL);

    // Check if Resend API key is available
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Validate required fields
    if (!userName || !temporaryPassword || !magicLink) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if Resend is properly configured
    if (!process.env.RESEND_API_KEY) {
      console.log(`Development mode: No Resend API key, simulating email send to ${email}`);
      
      // Return success but don't actually send email
      return NextResponse.json({ 
        success: true, 
        development: true,
        message: `Email simulation successful to ${email} - No API key configured`,
        note: 'Configure RESEND_API_KEY to send actual emails'
      });
    }

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'admin@digitalplace.id',
      to: [email],
      subject: 'Selamat Datang di KomplekIn - Akun Warga Baru',
      html: TemporaryPasswordEmailTemplate({ 
        userName, 
        email, 
        temporaryPassword, 
        magicLink, 
        clusterName: clusterName || 'Komplek Anda', 
        role: role || 'Warga' 
      }),
    });

    if (error) {
      console.error('Resend API error:', error);
      return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
    }

    console.log('Invitation email sent successfully:', data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error in invitation email API:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, { status: 500 });
  }
}