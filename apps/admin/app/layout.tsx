import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Komplekin Admin',
  description: 'Admin dashboard untuk aplikasi Komplekin',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  )
} 