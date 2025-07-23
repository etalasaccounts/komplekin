import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export const createClient = async () => {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Get user with role from database untuk server-side (middleware)
export async function getServerUserWithRole(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {
          // For middleware, we don't need to set cookies here
        },
      },
    }
  )

  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { user: null, role: null }

    const { data: permissions, error } = await supabase
      .from('user_permissions')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching user permissions:', error)
      return { user, role: null }
    }

    return {
      user,
      role: permissions?.role || null
    }
  } catch (error) {
    console.error('Error in getServerUserWithRole:', error)
    return { user: null, role: null }
  }
} 