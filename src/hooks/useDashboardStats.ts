import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export interface DashboardStats {
  totalWarga: {
    value: string
    change: string
    changeType: 'positive' | 'negative'
    description: string
  }
  saldo: {
    value: string
    change: string
    changeType: 'positive' | 'negative'
    description: string
  }
  pemasukanKas: {
    value: string
    change: string
    changeType: 'positive' | 'negative'
    description: string
  }
  pengeluaranRT: {
    value: string
    change: string
    changeType: 'positive' | 'negative'
    description: string
  }
  recentPemasukan: Array<{
    name: string
    description: string
    amount: string
    date: string
  }>
  recentPengeluaran: Array<{
    name: string
    description: string
    amount: string
    date: string
  }>
  wargaMenunggak: Array<{
    name: string
    address: string
    amount: string
  }>
}

export const useDashboardStats = () => {
  const [data, setData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/dashboard-stats')
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch dashboard data')
      }
      
      setData(result.data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data dashboard'
      setError(errorMessage)
      toast.error('Error', {
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return {
    data,
    loading,
    error,
    refetch: fetchData
  }
}
