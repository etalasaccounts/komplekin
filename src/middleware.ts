import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Helper function untuk create supabase client dengan error handling
function createSupabaseClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables in middleware')
    return null
  }

  try {
    return createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
        },
      },
    })
  } catch (error) {
    console.error('Error creating Supabase client in middleware:', error)
    return null
  }
}

// Simplified user check - only check if user is authenticated, not role
async function getAuthenticatedUser(request: NextRequest) {
  const supabase = createSupabaseClient(request)
  
  if (!supabase) {
    return { user: null, role: null }
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Auth error in middleware:', error)
      return { user: null, role: null }
    }

    // Basic role detection from user metadata (fallback)
    const userRole = user?.user_metadata?.role || user?.app_metadata?.role || null

    return { user, role: userRole }
  } catch (error) {
    console.error('Error getting user in middleware:', error)
    return { user: null, role: null }
  }
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const { pathname } = request.nextUrl

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('/callback') ||
    pathname.includes('/reset-password') ||
    pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|webp)$/)
  ) {
    return response
  }

  // Get user authentication status
  const { user, role } = await getAuthenticatedUser(request)

  // Protect dashboard routes
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

  // Redirect authenticated users away from auth pages
  if (user && (pathname.startsWith('/user/auth') || pathname.startsWith('/admin/auth'))) {
    // Skip redirect for reset-password and callback
    if (pathname.includes('/reset-password') || pathname.includes('/callback')) {
      return response
    }
    
    // Use role-based redirect with fallback
    const homeUrl = (role === 'admin') ? '/admin/dashboard' : '/user/dashboard'
    return NextResponse.redirect(new URL(homeUrl, request.url))
  }

  // Basic admin protection (will be double-checked in actual pages)
  if (user && pathname.startsWith('/admin/dashboard')) {
    // If we can't determine role from middleware, let the page handle it
    if (role && role !== 'admin') {
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
     * - api routes (let them handle their own auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 