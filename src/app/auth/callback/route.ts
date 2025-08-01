import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next')
  const type = requestUrl.searchParams.get('type')
  const setup = requestUrl.searchParams.get('setup') // New setup parameter for magic link flow
  const magic = requestUrl.searchParams.get('magic') // New magic flag
  const verifyTemp = requestUrl.searchParams.get('verify_temp') // New temp password verification flag

  console.log('Auth callback params:', { code: !!code, next, type, setup, magic, verifyTemp })

  // MAGIC LINK FLOW - Handle all magic link scenarios (most robust detection)
  // For magic link from admin creation, we expect setup=true
  if (setup === 'true' || type === 'magiclink' || magic === 'true') {
    console.log('Processing magic link callback', { type, setup, next })
    
    if (code) {
      try {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (error) {
          console.error('Magic link auth error:', error)
          const errorRedirect = next === 'admin' 
            ? '/admin/auth/reset-password?error=magic_link_failed&new_user=true'
            : '/user/auth/reset-password?error=magic_link_failed&new_user=true'
          return NextResponse.redirect(`${requestUrl.origin}${errorRedirect}`)
        }

        if (data.user) {
          console.log('Magic link authentication successful for user:', data.user.email)
          console.log('User metadata:', data.user.user_metadata)
          console.log('Setup required:', setup === 'true')
          console.log('Verify temp required:', verifyTemp === 'true')
          
          let redirectUrl: string
          
          // Check if this is a new user that needs temporary password verification
          if (verifyTemp === 'true' && setup === 'true') {
            // New user from admin creation - needs to verify temporary password first
            redirectUrl = next === 'admin' 
              ? '/admin/auth/verify?new_user=true&magic_link=true'
              : '/user/auth/verify-temp-password?new_user=true&magic_link=true'
          } else if (setup === 'true') {
            // Legacy flow - direct to reset password
            redirectUrl = next === 'admin' 
              ? '/admin/auth/reset-password?new_user=true&magic_link=true'
              : '/user/auth/reset-password?new_user=true&magic_link=true'
          } else {
            // Fallback - go to dashboard (shouldn't happen for magic link)
            try {
              const { data: permissions } = await supabase
                .from('user_permissions')
                .select('role')
                .eq('user_id', data.user.id)
                .single()

              const role = permissions?.role || next
              
              redirectUrl = role === 'admin' 
                ? '/admin/dashboard'
                : '/user/dashboard'
            } catch {
              // Fallback if permissions query fails
              redirectUrl = next === 'admin' 
                ? '/admin/dashboard'
                : '/user/dashboard'
            }
          }

          console.log('Redirecting to:', redirectUrl)

          // Return HTML that handles client-side redirect with authenticated session
          const html = `
            <!DOCTYPE html>
            <html>
              <head>
                <title>Magic Link Authentication</title>
                <script>
                  // Set appropriate flags
                  localStorage.setItem('magic_link_setup_mode', 'true');
                  localStorage.setItem('new_user_setup', 'true');
                  localStorage.setItem('magic_link_authenticated', 'true');
                  localStorage.setItem('magic_link_timestamp', Date.now().toString());
                  
                  console.log('Magic link authenticated, redirecting to:', '${redirectUrl}');
                  
                  // Wait a bit for session to settle, then redirect
                  setTimeout(() => {
                    window.location.href = '${redirectUrl}';
                  }, 1000);
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
                      border-top: 4px solid #22c55e; 
                      border-radius: 50%; 
                      animation: spin 1s linear infinite; 
                      margin: 0 auto 16px;
                    "></div>
                    <p style="color: #666; margin: 0;">
                      Magic Link berhasil! Menyiapkan akun Anda...
                    </p>
                    <p style="color: #999; margin: 8px 0 0; font-size: 14px;">
                      ${verifyTemp === 'true' 
                        ? 'Anda akan diminta verifikasi password sementara' 
                        : 'Anda akan diarahkan untuk membuat password'}
                    </p>
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
        }
      } catch (err) {
        console.error('Magic link processing error:', err)
        const errorRedirect = next === 'admin' 
          ? '/admin/auth/reset-password?error=magic_link_error&new_user=true'
          : '/user/auth/reset-password?error=magic_link_error&new_user=true'
        return NextResponse.redirect(`${requestUrl.origin}${errorRedirect}`)
      }
    } else {
      // No code but setup=true - this might be hash fragment authentication
      // Redirect to appropriate page where client-side can handle hash fragment
      console.log('Magic link callback without code - redirecting to handle hash fragment')
      let redirectUrl: string
      
      if (verifyTemp === 'true') {
        // Redirect to temp password verification page
        redirectUrl = next === 'admin' 
          ? '/admin/auth/verify?new_user=true&magic_link=true&check_hash=true'
          : '/user/auth/verify-temp-password?new_user=true&magic_link=true&check_hash=true'
      } else {
        // Legacy flow - redirect to reset password
        redirectUrl = next === 'admin' 
          ? '/admin/auth/reset-password?new_user=true&magic_link=true&check_hash=true'
          : '/user/auth/reset-password?new_user=true&magic_link=true&check_hash=true'
      }
      
      return NextResponse.redirect(`${requestUrl.origin}${redirectUrl}`)
    }
  }

  // Legacy: Handle magic link differently - need to authenticate first
  if (type === 'magic') {
    console.log('Processing legacy magic link callback')
    
    // For magic link, we need to handle the code properly
    if (code) {
      try {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (error) {
          console.error('Magic link auth error:', error)
          const errorRedirect = next === 'admin' 
            ? '/admin/auth/reset-password?error=magic_link_failed'
            : '/user/auth/reset-password?error=magic_link_failed'
          return NextResponse.redirect(`${requestUrl.origin}${errorRedirect}`)
        }

        if (data.user) {
          // User authenticated via magic link, redirect to reset password
          console.log('Magic link authentication successful for user:', data.user.email)
          console.log('User session established:', !!data.session)
          
          const redirectUrl = next === 'admin' 
            ? '/admin/auth/reset-password'
            : '/user/auth/reset-password'

          // Return HTML that handles client-side redirect with authenticated session
          const html = `
            <!DOCTYPE html>
            <html>
              <head>
                <title>Magic Link Authenticated</title>
                <script>
                  // Set flag for magic link mode (authenticated)
                  localStorage.setItem('magic_link_mode', 'true');
                  localStorage.setItem('magic_link_timestamp', Date.now().toString());
                  
                  // Wait a bit for session to settle, then redirect
                  setTimeout(() => {
                    window.location.href = '${redirectUrl}';
                  }, 500);
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
                    <p style="color: #666; margin: 0;">Authenticating magic link...</p>
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
        }
      } catch (err) {
        console.error('Magic link processing error:', err)
        const errorRedirect = next === 'admin' 
          ? '/admin/auth/reset-password?error=magic_link_error'
          : '/user/auth/reset-password?error=magic_link_error'
        return NextResponse.redirect(`${requestUrl.origin}${errorRedirect}`)
      }
    }
    
    // No code for magic link - redirect with error
    const errorRedirect = next === 'admin' 
      ? '/admin/auth/reset-password?error=magic_link_invalid'
      : '/user/auth/reset-password?error=magic_link_invalid'
    return NextResponse.redirect(`${requestUrl.origin}${errorRedirect}`)
  }

  // Regular auth flow (reset password, forgot password, etc)
  if (code) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Exchange error:', error)
        
        // For recovery, redirect to reset-password
        if (type === 'recovery') {
          const errorRedirect = next === 'admin' 
            ? '/admin/auth/reset-password?error=recovery_failed'
            : '/user/auth/reset-password?error=recovery_failed'
          return NextResponse.redirect(`${requestUrl.origin}${errorRedirect}`)
        }
        
        // For regular auth flows, redirect to forgot-password
        const errorRedirect = next === 'admin' 
          ? '/admin/auth/forgot-password?error=exchange_failed'
          : '/user/auth/forgot-password?error=exchange_failed'
        return NextResponse.redirect(`${requestUrl.origin}${errorRedirect}`)
      }

      // Success - redirect to reset password
      let redirectUrl = '/user/auth/reset-password'

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
                <p style="color: #666; margin: 0;">Processing reset password...</p>
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
    } catch (err) {
      console.error('Callback error:', err)
      
      // For recovery, redirect to reset-password
      if (type === 'recovery') {
        const errorRedirect = next === 'admin' 
          ? '/admin/auth/reset-password?error=recovery_error'
          : '/user/auth/reset-password?error=recovery_error'
        return NextResponse.redirect(`${requestUrl.origin}${errorRedirect}`)
      }
      
      // For regular flows, redirect to forgot-password
      const errorRedirect = next === 'admin' 
        ? '/admin/auth/forgot-password?error=exchange_error'
        : '/user/auth/forgot-password?error=exchange_error'
      return NextResponse.redirect(`${requestUrl.origin}${errorRedirect}`)
    }
  }

  // No code parameter - redirect based on type
  if (type === 'recovery') {
    const errorRedirect = next === 'admin' 
      ? '/admin/auth/reset-password?error=recovery_invalid'
      : '/user/auth/reset-password?error=recovery_invalid'
    return NextResponse.redirect(`${requestUrl.origin}${errorRedirect}`)
  }

  const errorRedirect = next === 'admin' 
    ? '/admin/auth/forgot-password?error=no_code'
    : '/user/auth/forgot-password?error=no_code'
  return NextResponse.redirect(`${requestUrl.origin}${errorRedirect}`)
} 