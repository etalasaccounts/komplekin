import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  complexName: string;
}

const ContactNotificationTemplate = ({ name, email, phone, complexName }: ContactFormData) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>KomplekIn - New Contact Form Submission</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #EE7C2B 0%, #D65A0A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EE7C2B; }
          .contact-details { background: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; }
          .contact-item { margin: 15px 0; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
          .contact-item:last-child { border-bottom: none; }
          .label { font-weight: bold; color: #374151; display: inline-block; width: 120px; }
          .value { color: #1f2937; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; }
          .priority-box { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">KomplekIn</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">New Contact Form Submission</p>
        </div>
        <div class="content">
          <h2 style="color: #1f2937; margin-top: 0;">📧 New Contact Request Received</h2>
          <p>Someone has submitted a contact form on the KomplekIn website and is interested in learning more about our services.</p>
          
          <div class="info-box">
            <h3 style="margin: 0 0 15px 0; color: #1f2937;">📋 Contact Details</h3>
            <div class="contact-details">
              <div class="contact-item">
                <span class="label">Name:</span>
                <span class="value">${name}</span>
              </div>
              <div class="contact-item">
                <span class="label">Email:</span>
                <span class="value">${email}</span>
              </div>
              <div class="contact-item">
                <span class="label">Phone:</span>
                <span class="value">${phone}</span>
              </div>
              <div class="contact-item">
                <span class="label">Complex:</span>
                <span class="value">${complexName}</span>
              </div>
            </div>
          </div>

          <div class="priority-box">
            <p style="margin: 0; font-size: 14px;"><strong>⚡ Action Required:</strong><br />
            Please follow up with this potential customer within 24 hours to discuss their complex management needs and schedule a demo if appropriate.</p>
          </div>

          <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3 style="margin: 0 0 15px 0; color: #1f2937;">💡 Next Steps</h3>
            <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
              <li>Send a personalized welcome email to ${email}</li>
              <li>Schedule a demo call to showcase KomplekIn features</li>
              <li>Prepare a customized proposal based on their complex size</li>
              <li>Follow up via phone if no response within 48 hours</li>
            </ul>
          </div>

          <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
            This contact form was submitted from the KomplekIn website contact section. 
            The customer has expressed interest in our complex management solution.
          </p>
        </div>
        <div class="footer">
          <p style="margin: 0;">© 2025 KomplekIn. Sistem Manajemen Komplek Modern.</p>
          <p style="margin: 5px 0 0 0;">This is an automated notification from the KomplekIn contact form system.</p>
        </div>
      </body>
    </html>
  `;
};

export async function POST(request: Request) {
  try {
    const { name, email, phone, complexName }: ContactFormData = await request.json();

    // Debug logging
    console.log('Attempting to send contact form notification for:', name, email);

    // Validate required environment variables
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
    if (!name || !phone || !complexName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Send notification to support team
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: ['hello@etalas.com'],

      subject: `New Contact Form Submission from ${name} - ${complexName}`,
      html: ContactNotificationTemplate({ name, email, phone, complexName }),
    });

    if (error) {
      console.error('Resend API error:', error);
      return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
    }

    console.log('Contact form notification sent successfully:', data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error in contact form API:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, { status: 500 });
  }
}
