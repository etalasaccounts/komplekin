import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

interface InvoiceReminderEmailTemplateProps {
  userName: string;
  amount: string;
  dueDate: string;
}

const InvoiceReminderEmailTemplate = ({ 
  userName,
  amount, 
  dueDate 
}: InvoiceReminderEmailTemplateProps) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>KomplekIn - Pengingat Tagihan</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; }
          .invoice-box { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
          .warning-box { background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444; }
          .info-box { background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
          .amount { font-size: 24px; font-weight: bold; color: #d97706; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">KomplekIn</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Pengingat Tagihan</p>
        </div>
        <div class="content">
          <h2 style="color: #1f2937; margin-top: 0;">Halo ${userName}!</h2>
          <p>Ini adalah pengingat untuk tagihan yang akan jatuh tempo. Mohon segera lakukan pembayaran untuk menghindari keterlambatan.</p>
          
          <div class="invoice-box">
            <h3 style="margin: 0 0 15px 0; color: #1f2937;">Detail Tagihan</h3>
            <p style="margin: 5px 0;"><strong>Jumlah Tagihan:</strong> <span class="amount">Rp ${amount}</span></p>
            <p style="margin: 5px 0;"><strong>Jatuh Tempo:</strong> ${dueDate}</p>
          </div>

          ${new Date(dueDate) <= new Date() ? `
          <div class="warning-box">
            <p style="margin: 0; font-size: 14px; color: #dc2626;"><strong>Perhatian: Tagihan Telah Jatuh Tempo!</strong></p>
            <p style="margin: 10px 0 0 0; font-size: 14px;">Segera lakukan pembayaran untuk menghindari denda keterlambatan.</p>
          </div>
          ` : `
          <div class="info-box">
            <p style="margin: 0; font-size: 14px; color: #1e40af;"><strong>Informasi Pembayaran:</strong></p>
            <ul style="margin: 10px 0; padding-left: 20px; font-size: 14px;">
              <li>Lakukan pembayaran sebelum tanggal jatuh tempo</li>
              <li>Hubungi admin komplek jika ada pertanyaan</li>
              <li>Simpan bukti pembayaran untuk referensi</li>
            </ul>
          </div>
          `}

          <div style="text-align: center; margin: 30px 0;">
            <p style="margin-bottom: 15px;">Untuk melakukan pembayaran atau melihat detail tagihan:</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || '#'}/dashboard/tagihan" class="button">
              Lihat Detail Tagihan
            </a>
          </div>

          <p style="margin-top: 30px;">Terima kasih atas perhatian Anda dalam menjaga kelancaran administrasi komplek.</p>
          <p style="margin: 20px 0 0 0; font-size: 14px; color: #6b7280;">Jika Anda memiliki pertanyaan, silakan hubungi admin komplek atau tim support KomplekIn.</p>
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
    const { userName, invoiceNumber, amount, dueDate, email } = await request.json();

    // Debug logging
    console.log('Attempting to send invoice reminder email to:', email);
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
    if (!userName || !invoiceNumber || !amount || !dueDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: [email],
      subject: `Pengingat Tagihan - KomplekIn`,
      html: InvoiceReminderEmailTemplate({ userName, amount, dueDate }),
    });

    if (error) {
      console.error('Resend API error:', error);
      return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
    }

    console.log('Invoice reminder email sent successfully:', data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error in invoice reminder email API:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, { status: 500 });
  }
}