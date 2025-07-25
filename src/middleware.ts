import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Helper function untuk create supabase client dengan proper SSR handling
function createSupabaseClient(request: NextRequest, response: NextResponse) {
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
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    })
  } catch (error) {
    console.error('Error creating Supabase client in middleware:', error)
    return null
  }
}

// Helper function untuk create admin client (untuk bypass RLS)
function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return null
  }

  try {
    return createServerClient(supabaseUrl, serviceRoleKey, {
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // No-op for admin client
        },
      },
    })
  } catch (error) {
    console.error('Error creating Supabase admin client:', error)
    return null
  }
}

// Enhanced user check - get role from database for accurate detection
async function getAuthenticatedUser(request: NextRequest, response: NextResponse) {
  const supabase = createSupabaseClient(request, response)
  
  if (!supabase) {
    return { user: null, role: null }
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      // Don't log AuthSessionMissingError as it's expected for non-authenticated users
      if (error.message?.includes('Auth session missing') || error.name === 'AuthSessionMissingError') {
        return { user: null, role: null }
      }
      console.error('Auth error in middleware:', error)
      return { user: null, role: null }
    }

    if (!user) {
      return { user: null, role: null }
    }

    // Get role from database for accurate detection using admin client
    const adminClient = createSupabaseAdminClient()
    if (adminClient) {
      try {
        const { data: permissionsData } = await adminClient
          .from('user_permissions')
          .select('role')
          .eq('user_id', user.id)
          .single()

        const userRole = permissionsData?.role || null
        console.log('Middleware - User:', user.email, 'Role:', userRole)

    return { user, role: userRole }
      } catch {
        // Fallback to metadata if database query fails
        const fallbackRole = user?.user_metadata?.role || user?.app_metadata?.role || null
        console.log('Middleware - DB query failed, using fallback role:', fallbackRole)
        return { user, role: fallbackRole }
      }
    } else {
      // No admin client available, use metadata fallback
      const fallbackRole = user?.user_metadata?.role || user?.app_metadata?.role || null
      console.log('Middleware - No admin client, using fallback role:', fallbackRole)
      return { user, role: fallbackRole }
    }

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

  // Skip middleware for static files, API routes, and auth callbacks
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('/callback') ||
    pathname.includes('/reset-password') ||
    pathname.includes('/verification') ||
    pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|webp)$/)
  ) {
    return response
  }

  // Only get user authentication for routes that need it
  const { user } = await getAuthenticatedUser(request, response)

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
    // Simple redirect: if accessing admin auth, go to admin dashboard, else user dashboard
    if (pathname.startsWith('/admin/auth')) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/user/dashboard', request.url))
    }
  }

  // Let pages handle role-based access control
  // Middleware only ensures authentication, not authorization

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