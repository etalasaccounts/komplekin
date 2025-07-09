import Link from 'next/link'
import { Button } from 'ui'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-6">
          Komplekin Admin Dashboard
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Selamat datang di dashboard admin Komplekin
        </p>
        <div className="space-x-4">
          <Button asChild>
            <Link href="/auth">
              Masuk ke Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 