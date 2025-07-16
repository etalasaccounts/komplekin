'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const { user, signOut, loading } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
              <p className="text-gray-600">Selamat datang, Administrator {user?.email}</p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => router.push('/apps')} variant="outline">
                Ke Apps
              </Button>
              <Button onClick={handleSignOut} variant="outline">
                Logout
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">1,234</div>
              <p className="text-sm text-gray-600">+10% dari bulan lalu</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Active Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">567</div>
              <p className="text-sm text-gray-600">+5% dari bulan lalu</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">$12,345</div>
              <p className="text-sm text-gray-600">+15% dari bulan lalu</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Server Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">99.9%</div>
              <p className="text-sm text-gray-600">Uptime</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Manajemen Pengguna</CardTitle>
              <CardDescription>Kelola akun pengguna dan permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full">Lihat Semua Pengguna</Button>
              <Button variant="outline" className="w-full">Tambah Pengguna Baru</Button>
              <Button variant="outline" className="w-full">Kelola Permissions</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sistem & Konfigurasi</CardTitle>
              <CardDescription>Pengaturan aplikasi dan sistem</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full">Pengaturan Aplikasi</Button>
              <Button variant="outline" className="w-full">Backup & Restore</Button>
              <Button variant="outline" className="w-full">Log Aktivitas</Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Informasi Admin</CardTitle>
            <CardDescription>Detail akun administrator</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Email:</span> {user?.email}
              </div>
              <div>
                <span className="font-semibold">Role:</span> Administrator
              </div>
              <div>
                <span className="font-semibold">Last Login:</span> {new Date().toLocaleDateString('id-ID')}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 