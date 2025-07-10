'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export default function AppsPage() {
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
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Aplikasi</h1>
              <p className="text-gray-600">Selamat datang, {user?.email}</p>
            </div>
            <Button onClick={handleSignOut} variant="outline">
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Fitur 1</CardTitle>
              <CardDescription>Deskripsi untuk fitur pertama</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Ini adalah contoh card untuk fitur aplikasi. Anda bisa menambahkan lebih banyak konten di sini.
              </p>
              <Button>Akses Fitur</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fitur 2</CardTitle>
              <CardDescription>Deskripsi untuk fitur kedua</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Ini adalah contoh card untuk fitur aplikasi. Anda bisa menambahkan lebih banyak konten di sini.
              </p>
              <Button>Akses Fitur</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fitur 3</CardTitle>
              <CardDescription>Deskripsi untuk fitur ketiga</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Ini adalah contoh card untuk fitur aplikasi. Anda bisa menambahkan lebih banyak konten di sini.
              </p>
              <Button>Akses Fitur</Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Informasi Akun</CardTitle>
            <CardDescription>Detail akun pengguna</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Email:</span> {user?.email}
              </div>
              <div>
                <span className="font-semibold">User ID:</span> {user?.id}
              </div>
              <div>
                <span className="font-semibold">Tanggal Daftar:</span> {new Date(user?.created_at || '').toLocaleDateString('id-ID')}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 