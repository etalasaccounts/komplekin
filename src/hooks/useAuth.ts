'use client'

import { useState, useEffect } from 'react'
import { authService } from '@/services/auth'
import { AuthUser } from '@/types/supabase'

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<{ id: string, fullname: string, email: string } | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getInitialSession = async () => {
      const { user, role, profile } = await authService.getAuthenticatedUserProfile();
      setUser(user as AuthUser)
      setUserRole(role)
      
      // Ensure profile is a single object, not array
      if (profile && typeof profile === 'object' && !Array.isArray(profile)) {
        setProfile(profile)
      } else {
        setProfile(null)
      }
      
      setLoading(false)
    }

    getInitialSession()

    const { data: { subscription } } = authService.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_IN') {
          getInitialSession();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setUserRole(null);
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await authService.signOut();
      if (error) {
        throw error;
      }
      // State cleanup is handled by onAuthStateChange
    } catch (error) {
      console.error('Error during sign out:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data, error } = await authService.signIn(email, password)
      
      if (error) {
        setLoading(false)
        return { success: false, error: 'Email atau password salah' }
      }

      if (data.user) {
        // Get role from database instead of user_metadata
        const userPermissions = await authService.getUserPermissions(data.user.id)
        
        if (!userPermissions?.role) {
          setLoading(false)
          return { success: false, error: 'User tidak memiliki role yang valid' }
        }
        
        const redirectPath = userPermissions.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'
        setLoading(false)
        return { success: true, redirectPath }
      }

      setLoading(false)
      return { success: false, error: 'Login gagal' }
    } catch {
      setLoading(false)
      return { success: false, error: 'Terjadi kesalahan saat login' }
    }
  }

  return {
    user,
    profile,
    userRole,
    loading,
    signOut,
    signIn,
    isAuthenticated: !!user,
  }
} 