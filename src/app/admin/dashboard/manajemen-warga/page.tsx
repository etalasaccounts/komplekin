import React from 'react'
import EmptyState from '../components/empty'
import { Users } from 'lucide-react'

export default function ManajemenWargaPage() {
  return (
    <EmptyState
      icon={<Users />}
      title="Belum Ada Data Warga"
      description="Daftar warga akan ditampilkan di sini setelah Anda menambahkan data warga ke sistem."
    />
  )
}
