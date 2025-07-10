'use client'

import { useState, useEffect } from 'react'
import { authService } from '@/services/auth'
import { AuthUser, AuthSession } from '@/types/supabase'

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await authService.getSession()
      setSession(session as AuthSession)
      setUser(session?.user as AuthUser || null)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        setSession(session as AuthSession)
        setUser(session?.user as AuthUser || null)
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    setLoading(true)
    await authService.signOut()
    setUser(null)
    setSession(null)
    setLoading(false)
  }

  return {
    user,
    session,
    loading,
    signOut,
    isAuthenticated: !!user,
  }
} 