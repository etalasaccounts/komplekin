'use client'

import { useState, useEffect, useCallback } from 'react'
import { authService } from '@/services/auth'
import { AuthUser } from '@/types/supabase'

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [profile, setProfile] = useState<{ id: string; fullname: string; email: string } | null>(null)
  const [clusterId, setClusterId] = useState<string | null>(null)
  const [clusterName, setClusterName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  const getAuthDataWithCluster = useCallback(async () => {
    try {
      const { user, role, profile, cluster } = await authService.getAuthenticatedUserProfile();
    setUser(user as AuthUser)
    setUserRole(role)
    
    // Ensure profile is a single object, not array
    if (profile && typeof profile === 'object' && !Array.isArray(profile)) {
      setProfile(profile)
    } else {
      setProfile(null)
    }
    
      // Set cluster data untuk admin
      if (user && role === 'admin' && cluster) {
        setClusterId(cluster.id)
        setClusterName(cluster.cluster_name)
        } else {
        setClusterId(null)
        setClusterName(null)
      }
      
    } catch (error) {
      console.error('Error in getAuthDataWithCluster:', error)
    }
  }, [])

  useEffect(() => {
    let isMounted = true;

    const getInitialSession = async () => {
      if (isMounted) {
      await getAuthDataWithCluster()
        if (isMounted) {
      setLoading(false)
          setInitialized(true)
        }
      }
    }

    getInitialSession()

    const { data: { subscription } } = authService.onAuthStateChange(
      (event) => {
        if (!isMounted) return;
        
        if (event === 'SIGNED_IN') {
          getAuthDataWithCluster();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserRole(null);
          setProfile(null);
          setClusterId(null);
          setClusterName(null);
          setLoading(false);
          setInitialized(false);
        }
      }
    )

    return () => {
      isMounted = false;
      subscription?.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Intentionally empty to prevent infinite loops

  const signOut = async () => {
    setLoading(true);
    try {
      // Clear cache before signing out
      authService.clearCache();
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
    userRole,
    profile,
    clusterId,
    clusterName,
    loading,
    initialized,
    signOut,
    signIn,
    refetch: getAuthDataWithCluster,
    isAuthenticated: !!user,
    isAdmin: userRole === 'admin',
  }
} 