'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input } from 'ui'
import { createClient } from 'supabase'
import type { LoginCredentials } from 'types'

export default function LoginPage() {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        setError(error.message)
      } else {
        // Redirect to dashboard
        router.push('/dashboard')
      }
    } catch (err) {
      setError('Terjadi kesalahan saat login')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Login Admin
          </h1>
          <p className="text-muted-foreground mt-2">
            Masuk ke dashboard admin Komplekin
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@komplekin.com"
              value={credentials.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Masukkan password"
              value={credentials.password}
              onChange={handleInputChange}
              required
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? 'Sedang masuk...' : 'Masuk'}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          <p>Demo login untuk testing</p>
        </div>
      </div>
    </div>
  )
} 