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
  async resetPassword(email: string) {
    const supabase = this.getClient()
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
  },

  // Update user
  async updateUser(attributes: { email?: string; password?: string; data?: Record<string, unknown> }) {
    const supabase = this.getClient()
    return await supabase.auth.updateUser(attributes)
  },
} 