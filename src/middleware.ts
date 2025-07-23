import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getServerUserWithRole } from '@/lib/supabase/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh session cookies
  await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Skip middleware for callback routes (important for auth flows)
  if (pathname.includes('/callback')) {
    return response
  }

  // Skip middleware for reset-password routes during password recovery
  if (pathname.includes('/reset-password')) {
    return response
  }

  // Get user with role from database
  const { user, role } = await getServerUserWithRole(request)

  // Protect dashboard routes - more specific path checking
  if (!user) {
    if (pathname.startsWith('/admin/dashboard') || pathname === '/admin/dashboard') {
      return NextResponse.redirect(new URL('/admin/auth', request.url))
    }
    
    if (pathname.startsWith('/user/dashboard') || pathname === '/user/dashboard') {
      return NextResponse.redirect(new URL('/user/auth', request.url))
    }
    
    // Check for any other dashboard routes
    if (pathname.includes('/dashboard')) {
      return NextResponse.redirect(new URL('/user/auth', request.url))
    }
  }

  // Redirect authenticated users away from auth pages (except callback and reset-password)
  if (user && (pathname.startsWith('/user/auth') || pathname.startsWith('/admin/auth'))) {
    // Skip redirect for reset-password and callback (already handled above)
    if (pathname.includes('/reset-password') || pathname.includes('/callback')) {
      return response
    }
    
    const homeUrl = role === 'admin' ? '/admin/dashboard' : '/user/dashboard'
    return NextResponse.redirect(new URL(homeUrl, request.url))
  }

  // Admin role protection
  if (user && pathname.startsWith('/admin/dashboard')) {
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/user/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 