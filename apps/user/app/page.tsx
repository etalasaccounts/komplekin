import { Button } from 'ui'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-6">
          Selamat Datang di Komplekin
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Platform yang memudahkan kebutuhan harian Anda
        </p>
        <div className="space-x-4">
          <Button>
            Mulai Sekarang
          </Button>
          <Button variant="outline">
            Pelajari Lebih Lanjut
          </Button>
        </div>
      </div>
    </div>
  )
} 