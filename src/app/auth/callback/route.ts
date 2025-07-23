import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') // Optional parameter to determine redirect

  if (code) {
    try {
      const supabase = await createClient()
      
      // Exchange code for session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        // Determine error redirect based on 'next' parameter
        const errorRedirect = next === 'admin' 
          ? '/admin/auth/forgot-password?error=exchange_failed'
          : '/user/auth/forgot-password?error=exchange_failed'
        return NextResponse.redirect(`${requestUrl.origin}${errorRedirect}`)
      }

      // Instead of direct redirect, return HTML that will handle client-side redirect
      // This ensures the session is properly available in the browser
      let redirectUrl = '/user/auth/reset-password'

      // Get user role to determine correct redirect
      if (data.user) {
        try {
          const { data: permissions } = await supabase
            .from('user_permissions')
            .select('role')
            .eq('user_id', data.user.id)
            .single()

          const role = permissions?.role
          
          if (role === 'admin') {
            redirectUrl = '/admin/auth/reset-password'
          } else {
            redirectUrl = '/user/auth/reset-password'
          }
        } catch {
          redirectUrl = next === 'admin' 
            ? '/admin/auth/reset-password'
            : '/user/auth/reset-password'
        }
      }

      // Return HTML page that handles client-side redirect
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Redirecting...</title>
            <script>
              // Set flag that user is in password recovery mode
              localStorage.setItem('password_recovery_mode', 'true');
              localStorage.setItem('password_recovery_timestamp', Date.now().toString());
              
              // Wait a bit for session to be set, then redirect
              setTimeout(() => {
                window.location.href = '${redirectUrl}';
              }, 100);
            </script>
          </head>
          <body>
            <div style="
              display: flex; 
              align-items: center; 
              justify-content: center; 
              height: 100vh; 
              font-family: system-ui, sans-serif;
              background: #f8f9fa;
            ">
              <div style="text-align: center;">
                <div style="
                  width: 40px; 
                  height: 40px; 
                  border: 4px solid #e0e0e0; 
                  border-top: 4px solid #2563eb; 
                  border-radius: 50%; 
                  animation: spin 1s linear infinite; 
                  margin: 0 auto 16px;
                "></div>
                <p style="color: #666; margin: 0;">Memproses reset password...</p>
              </div>
            </div>
            <style>
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            </style>
          </body>
        </html>
      `

      return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html' },
      })
    } catch {
      const errorRedirect = next === 'admin' 
        ? '/admin/auth/forgot-password?error=exchange_error'
        : '/user/auth/forgot-password?error=exchange_error'
      return NextResponse.redirect(`${requestUrl.origin}${errorRedirect}`)
    }
  }

  const errorRedirect = next === 'admin' 
    ? '/admin/auth/forgot-password?error=no_code'
    : '/user/auth/forgot-password?error=no_code'
  return NextResponse.redirect(`${requestUrl.origin}${errorRedirect}`)
} 