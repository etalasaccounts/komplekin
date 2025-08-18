import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || 'user'
  const setup = requestUrl.searchParams.get('setup')
  const verifyTemp = requestUrl.searchParams.get('verify_temp')

  console.log('=== AUTH CALLBACK START ===')
  console.log('URL:', requestUrl.href)
  console.log('Code:', code)
  console.log('Next:', next)
  console.log('Setup required:', setup === 'true')
  console.log('Verify temp required:', verifyTemp === 'true')

  if (code) {
    const supabase = await createClient()

    try {
      // Exchange code for session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Code exchange error:', error)
        return NextResponse.redirect(`${requestUrl.origin}/auth/error?message=${encodeURIComponent(error.message)}`)
      }

      if (data?.session) {
        console.log('Session created for user:', data.session.user.email)
        
        // Determine redirect URL based on parameters
        let redirectUrl: string
        
        // Check if this is a new user that needs temporary password verification
        if (verifyTemp === 'true' && setup === 'true') {
          // New user from admin creation - needs to verify temporary password first
          redirectUrl = next === 'admin' 
            ? '/admin/auth/verify?new_user=true&magic_link=true'
            : '/auth/verify?new_user=true&magic_link=true'
        } else if (setup === 'true') {
          // Legacy flow - direct to reset password
          redirectUrl = next === 'admin' 
            ? '/admin/auth/reset-password?new_user=true&magic_link=true'
            : '/user/auth/reset-password?new_user=true&magic_link=true'
        } else {
          // Regular email confirmation - check if user needs verification
          try {
            const { data: permissions } = await supabase
              .from('user_permissions')
              .select('role')
              .eq('user_id', data.session.user.id)
              .single()

            const role = permissions?.role || next
            
            // For new admin registrations, go to verify page first
            if (role === 'admin' && next === 'admin') {
              redirectUrl = '/admin/auth/verify?new_user=true&magic_link=true'
            } else if (role === 'admin') {
              redirectUrl = '/admin/dashboard/manajemen-warga'
            } else {
              redirectUrl = '/user/dashboard'
            }
          } catch (err) {
            console.error('Error fetching user role:', err)
            // Fallback - for admin registration, go to verify first
            if (next === 'admin') {
              redirectUrl = '/admin/auth/verify?new_user=true&magic_link=true'
            } else {
              redirectUrl = '/user/dashboard'
            }
          }
        }

        console.log('Redirecting to:', redirectUrl)
        return NextResponse.redirect(`${requestUrl.origin}${redirectUrl}`)
      }
    } catch (error) {
      console.error('Session exchange error:', error)
      
      // Handle specific PKCE/code verifier errors for new admin registrations
      if (error instanceof Error && error.message.includes('code verifier') && next === 'admin') {
        console.log('PKCE error detected for admin registration, redirecting to verify page with hash check')
        return NextResponse.redirect(`${requestUrl.origin}/admin/auth/verify?new_user=true&magic_link=true&check_hash=true`)
      }
      
      return NextResponse.redirect(`${requestUrl.origin}/auth/error?message=Session creation failed`)
    }
  } else if (setup === 'true') {
    // No code but setup=true - this might be hash fragment authentication
    // Redirect to appropriate page where client-side can handle hash fragment
    console.log('Magic link callback without code - redirecting to handle hash fragment')
    let redirectUrl: string
    
    if (verifyTemp === 'true') {
      // Redirect to temp password verification page
      redirectUrl = next === 'admin' 
        ? '/admin/auth/verify?new_user=true&magic_link=true&check_hash=true'
        : '/auth/verify?new_user=true&magic_link=true&check_hash=true'
    } else {
      // Legacy flow - redirect to reset password
      redirectUrl = next === 'admin' 
        ? '/admin/auth/reset-password?new_user=true&magic_link=true&check_hash=true'
        : '/user/auth/reset-password?new_user=true&magic_link=true&check_hash=true'
    }
    
    return NextResponse.redirect(`${requestUrl.origin}${redirectUrl}`)
  }

  // Legacy: Handle magic link differently - need to authenticate first
  if (request.url.includes('#access_token')) {
    console.log('Hash fragment authentication detected')
    
    // For magic links with hash fragments, redirect to a client-side handler
    const redirectUrl = verifyTemp === 'true' 
      ? '/auth/verify?new_user=true&magic_link=true&check_hash=true'
      : '/user/dashboard'
    
    return NextResponse.redirect(`${requestUrl.origin}${redirectUrl}`)
  }

  // Default fallback
  console.log('No valid auth flow detected, redirecting to login')
  return NextResponse.redirect(`${requestUrl.origin}/auth`)
}