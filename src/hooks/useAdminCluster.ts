'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { authService } from '@/services/auth'

export interface AdminClusterInfo {
  clusterId: string | null
  clusterName: string | null
  loading: boolean
  error: string | null
}

export const useAdminCluster = (): AdminClusterInfo => {
  const { user, userRole } = useAuth()
  const [clusterId, setClusterId] = useState<string | null>(null)
  const [clusterName, setClusterName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getAdminCluster = async () => {
      if (!user || userRole !== 'admin') {
        setLoading(false)
        return
      }

      try {
        const supabase = authService.getClient()
        
        // Get cluster_id from user_permissions
        const { data: permissions, error: permError } = await supabase
          .from('user_permissions')
          .select(`
            cluster_id,
            clusters (
              id,
              cluster_name
            )
          `)
          .eq('user_id', user.id)
          .single()

        if (permError) {
          throw new Error('Gagal mengambil informasi cluster admin')
        }

        if (permissions?.cluster_id) {
          setClusterId(permissions.cluster_id)
          
          // Extract cluster name safely
          const clusterData = Array.isArray(permissions.clusters) 
            ? permissions.clusters[0] 
            : permissions.clusters

          setClusterName(clusterData?.cluster_name || null)
        } else {
          setError('Admin tidak memiliki cluster yang ditetapkan')
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan'
        setError(errorMessage)
        console.error('Error getting admin cluster:', err)
      } finally {
        setLoading(false)
      }
    }

    getAdminCluster()
  }, [user, userRole])

  return {
    clusterId,
    clusterName,
    loading,
    error
  }
} 