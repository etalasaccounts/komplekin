import { createClient } from '@/lib/supabase/client'
import { AuthResponse, User, AuthChangeEvent, Session } from '@supabase/supabase-js'

export const authService = {
  // Get supabase client
  getClient() {
    return createClient()
  },

  // Sign up with email and password
  async signUp(email: string, password: string): Promise<AuthResponse> {
    const supabase = this.getClient()
    return await supabase.auth.signUp({
      email,
      password,
    })
  },

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<AuthResponse> {
    const supabase = this.getClient()
    return await supabase.auth.signInWithPassword({
      email,
      password,
    })
  },

  // Sign out
  async signOut(): Promise<{ error: Error | null }> {
    const supabase = this.getClient()
    return await supabase.auth.signOut()
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    const supabase = this.getClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Get user permissions from database
  async getUserPermissions(userId: string) {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from('user_permissions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      return null
    }

    return data
  },

  // Get user with profile and role from database
  async getAuthenticatedUserProfile(): Promise<{
    user: User | null;
    role: string | null;
    profile: { id: string; fullname: string; email: string } | null;
  }> {
    const supabase = this.getClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { user: null, role: null, profile: null }
    }

    try {
      console.log('🔍 Fetching data for user:', user.id)
      
      const { data, error } = await supabase
        .from('user_permissions')
        .select(`
          role,
          user_status,
          profiles:profile_id (
            id,
            fullname,
            email
          )
        `)
        .eq('user_id', user.id)
        .single()

      console.log('📊 Query result:', { data, error })

      if (error || !data) {
        console.log('❌ Error or no data found:', error)
        return { user, role: null, profile: null }
      }

      console.log('✅ Success! Profile data:', data.profiles)

      // Ensure profiles is a single object, not array
      const profileData = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;

      return {
        user,
        role: data.role,
        profile: profileData || null
      }

    } catch (err) {
      console.log('💥 Exception caught:', err)
      return { user, role: null, profile: null }
    }
  },

  // Get session
  async getSession() {
    const supabase = this.getClient()
    return await supabase.auth.getSession()
  },

  // Listen to auth changes
  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    const supabase = this.getClient()
    return supabase.auth.onAuthStateChange(callback)
  },

  // Reset password
  async resetPassword(email: string, isAdmin = false) {
    const supabase = this.getClient()
    const nextParam = isAdmin ? '?next=admin' : '?next=user'
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback${nextParam}`,
    })
  },

  // Update user
  async updateUser(attributes: { email?: string; password?: string; data?: Record<string, unknown> }) {
    const supabase = this.getClient()
    return await supabase.auth.updateUser(attributes)
  },

  // Login with redirect helper
  async loginWithRedirect(email: string, password: string, onSuccess?: (redirectPath: string) => void, onError?: (error: string) => void) {
    try {
      const { data, error } = await this.signIn(email, password)
      
      if (error) {
        onError?.('Email atau password salah')
        return { success: false, error: 'Email atau password salah' }
      }

      if (data.user) {
        // Get role from database instead of user_metadata
        const permissions = await this.getUserPermissions(data.user.id)
        const userRole = permissions?.role
        
        if (!userRole) {
          onError?.('User tidak memiliki role yang valid')
          return { success: false, error: 'User tidak memiliki role yang valid' }
        }
        
        const redirectPath = userRole === 'admin' ? '/admin/dashboard' : '/user/dashboard'
        onSuccess?.(redirectPath)
        return { success: true, redirectPath, role: userRole }
      }

      return { success: false, error: 'Login gagal' }
    } catch {
      const errorMessage = 'Terjadi kesalahan saat login'
      onError?.(errorMessage)
      return { success: false, error: errorMessage }
    }
  },
} 