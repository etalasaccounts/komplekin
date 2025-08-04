import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

interface POApprovalEmailTemplateProps {
  userName: string;
  poNumber: string;
  poTitle: string;
  amount: string;
  requestedBy: string;
  approvalUrl: string;
  rejectUrl: string;
}

const POApprovalEmailTemplate = ({ 
  userName, 
  poNumber, 
  poTitle, 
  amount, 
  requestedBy,
  approvalUrl,
  rejectUrl
}: POApprovalEmailTemplateProps) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>KomplekIn - Persetujuan Purchase Order</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 5px; }
          .approve-btn { background: #10b981; }
          .reject-btn { background: #ef4444; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; }
          .po-box { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6; }
          .action-box { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; text-align: center; }
          .info-box { background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
          .amount { font-size: 20px; font-weight: bold; color: #7c3aed; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">KomplekIn</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Persetujuan Purchase Order</p>
        </div>
        <div class="content">
          <h2 style="color: #1f2937; margin-top: 0;">Halo ${userName}!</h2>
          <p>Terdapat Purchase Order baru yang memerlukan persetujuan Anda. Mohon tinjau detail berikut dan berikan keputusan Anda.</p>
          
          <div class="po-box">
            <h3 style="margin: 0 0 15px 0; color: #1f2937;">Detail Purchase Order</h3>
            <p style="margin: 5px 0;"><strong>Nomor PO:</strong> #${poNumber}</p>
            <p style="margin: 5px 0;"><strong>Judul:</strong> ${poTitle}</p>
            <p style="margin: 5px 0;"><strong>Nilai:</strong> <span class="amount">Rp ${amount}</span></p>
            <p style="margin: 5px 0;"><strong>Diminta oleh:</strong> ${requestedBy}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> Menunggu Persetujuan</p>
          </div>

          <div class="action-box">
            <h3 style="margin: 0 0 15px 0; color: #1f2937;">Aksi yang Diperlukan</h3>
            <p style="margin-bottom: 20px;">Silakan pilih salah satu tindakan berikut:</p>
            <div>
              <a href="${approvalUrl}" class="button approve-btn">Setujui PO</a>
              <a href="${rejectUrl}" class="button reject-btn">Tolak PO</a>
            </div>
          </div>

          <div class="info-box">
            <p style="margin: 0; font-size: 14px; color: #1e40af;"><strong>Informasi Penting:</strong></p>
            <ul style="margin: 10px 0; padding-left: 20px; font-size: 14px;">
              <li>Tinjau detail PO dengan seksama sebelum memberikan keputusan</li>
              <li>Pastikan anggaran tersedia untuk pembelian ini</li>
              <li>Hubungi pemohon jika diperlukan klarifikasi tambahan</li>
              <li>Keputusan Anda akan dikirimkan otomatis ke pemohon</li>
            </ul>
          </div>

          <p style="margin-top: 30px;">Terima kasih atas perhatian Anda dalam proses persetujuan ini.</p>
          <p style="margin: 20px 0 0 0; font-size: 14px; color: #6b7280;">Jika Anda memiliki pertanyaan, silakan hubungi tim administrasi atau support KomplekIn.</p>
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
    const { userName, poNumber, poTitle, amount, requestedBy, approvalUrl, rejectUrl, email } = await request.json();

    // Debug logging
    console.log('Attempting to send PO approval email to:', email);
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
    if (!userName || !poNumber || !poTitle || !amount || !requestedBy || !approvalUrl || !rejectUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: [email],
      subject: `Persetujuan PO #${poNumber} - KomplekIn`,
      html: POApprovalEmailTemplate({ 
        userName, 
        poNumber, 
        poTitle, 
        amount, 
        requestedBy, 
        approvalUrl, 
        rejectUrl 
      }),
    });

    if (error) {
      console.error('Resend API error:', error);
      return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
    }

    console.log('PO approval email sent successfully:', data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error in PO approval email API:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, { status: 500 });
  }
}