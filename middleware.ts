import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createMiddlewareClient(request, response)

  // Get current user session
  const { data: { session } } = await supabase.auth.getSession()

  // Define protected routes
  const protectedRoutes = ['/apps', '/admin']
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // If accessing protected route without authentication, redirect to auth
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/auth', request.url)
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Additional protection for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const userRole = session?.user?.user_metadata?.role
    if (userRole !== 'admin') {
      // Redirect to unauthorized page or apps
      return NextResponse.redirect(new URL('/apps', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (auth pages)
     * - public assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|auth|.*\\.).*)',
  ],
} 