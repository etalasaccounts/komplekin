'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Users,
  Wallet,
  ReceiptText,
  LineChart,
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  CircleDollarSign,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import type { DashboardStats } from '@/hooks/useDashboardStats'

type StatCardKey = 'totalWarga' | 'saldo' | 'pemasukanKas' | 'pengeluaranRT'

const statCards = [
  {
    title: 'Total Jumlah Warga',
    link: 'Lihat Jumlah Warga',
    icon: Users,
    iconBg: 'bg-[#E9358F]',
    iconColor: 'text-white',
    key: 'totalWarga' as StatCardKey,
  },
  {
    title: 'Saldo/kas',
    link: 'Lihat Jumlah Saldo',
    icon: Wallet,
    iconBg: 'bg-[#35ADE9]',
    iconColor: 'text-white',
    key: 'saldo' as StatCardKey,
  },
  {
    title: 'Pemasukan kas',
    link: 'Lihat Jumlah Pemasukan',
    icon: ReceiptText,
    iconBg: 'bg-[#693EE0]',
    iconColor: 'text-white',
    key: 'pemasukanKas' as StatCardKey,
  },
  {
    title: 'Pengeluaran RT',
    link: 'Lihat Jumlah Pengeluaran',
    icon: LineChart,
    iconBg: 'bg-[#1DAF9C]',
    iconColor: 'text-white',
    key: 'pengeluaranRT' as StatCardKey,
  },
]

export default function AdminDashboardPage() {
  const { data: dashboardData, loading, error, refetch } = useDashboardStats()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Dashboard utama untuk melihat status iuran, data warga, dan aktivitas harian.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <Card key={card.title} className="flex flex-col rounded-xl pt-4 pb-0">
              <CardHeader className="flex flex-row items-center gap-x-4 pb-2">
                <div className={`p-3 rounded-lg ${card.iconBg}`}>
                  <card.icon className={`h-4 w-4 ${card.iconColor}`} />
                </div>
                <CardTitle className="text-base font-medium">{card.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex items-center justify-center h-16">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="h-6 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-muted animate-pulse rounded-full" />
                        <div className="space-y-2">
                          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                          <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-12 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Dashboard utama untuk melihat status iuran, data warga, dan aktivitas harian.
          </p>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refetch} variant="outline">
              Coba Lagi
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Dashboard utama untuk melihat status iuran, data warga, dan aktivitas harian.
          </p>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground">Tidak ada data tersedia</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Dashboard utama untuk melihat status iuran, data warga, dan aktivitas harian.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const data = dashboardData[card.key] as DashboardStats[StatCardKey]
          return (
            <Card key={card.title} className="flex flex-col rounded-xl pt-4 pb-0">
              <CardHeader className="flex flex-row items-center gap-x-4 pb-2">
                <div className={`p-3 rounded-lg ${card.iconBg}`}>
                  <card.icon className={`h-4 w-4 ${card.iconColor}`} />
                </div>
                <CardTitle className="text-base font-medium">{card.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-3xl font-bold">{data.value}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  {data.description}
                  <Badge
                    variant="outline"
                    className={`ml-2 ${
                      data.changeType === 'positive'
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-red-100 text-red-800 border-red-200'
                    }`}
                  >
                    {data.change}
                  </Badge>
                </p>
              </CardContent>
               <div className="border-t px-6 py-3">
                <a href="#" className="text-sm font-medium text-primary hover:underline flex items-center justify-center gap-2">
                  <span>{card.link}</span>
                  <ArrowRight className="h-4 w-4 mt-1" />
                </a>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowDownLeft className="h-5 w-5 text-[#09090B]" />
              <CardTitle>Pemasukkan Kas RT</CardTitle>
            </div>
            <Button size="sm" className='bg-[#F4F4F5] text-[#18181B] hover:!bg-[#E4E4E7] px-3 py-1 cursor-pointer'>Lihat Semua</Button>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="masuk">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="masuk" className='cursor-pointer'>Masuk</TabsTrigger>
                <TabsTrigger value="pending" className='cursor-pointer'>Pending</TabsTrigger>
              </TabsList>
              <TabsContent value="masuk" className="space-y-4 pt-4">
                {dashboardData.recentPemasukan.length > 0 ? (
                  dashboardData.recentPemasukan.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-[#FFFFFF] rounded-full border border-[#E4E4E7]">
                          <CircleDollarSign className="h-5 w-5 text-[#71717A]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="font-semibold">{item.amount}</p>
                          <p className="text-sm text-muted-foreground">{item.date}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-40">
                    <p className="text-muted-foreground">Tidak ada pemasukan terbaru.</p>
                  </div>
                )}
              </TabsContent>
               <TabsContent value="pending">
                <div className="flex flex-col items-center justify-center h-40">
                  <p className="text-muted-foreground">Tidak ada pemasukan pending.</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
             <div className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-[#09090B]" />
              <CardTitle>Pengeluaran Kas RT</CardTitle>
            </div>
            <Button size="sm" className='bg-[#F4F4F5] text-[#18181B] hover:!bg-[#E4E4E7] px-3 py-1 cursor-pointer'>Lihat Semua</Button>
          </CardHeader>
          <CardContent>
             <Tabs defaultValue="keluar">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="keluar" className='cursor-pointer'>Keluar</TabsTrigger>
                <TabsTrigger value="pending" className='cursor-pointer'>Pending</TabsTrigger>
              </TabsList>
              <TabsContent value="keluar" className="space-y-4 pt-4">
                {dashboardData.recentPengeluaran.length > 0 ? (
                  dashboardData.recentPengeluaran.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="p-2.5 bg-[#FFFFFF] rounded-full border border-[#E4E4E7]">
                          <CircleDollarSign className="h-5 w-5 text-[#71717A]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="font-semibold">{item.amount}</p>
                          <p className="text-sm text-muted-foreground">{item.date}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-40">
                    <p className="text-muted-foreground">Tidak ada pengeluaran terbaru.</p>
                  </div>
                )}
              </TabsContent>
               <TabsContent value="pending">
                <div className="flex flex-col items-center justify-center h-40">
                  <p className="text-muted-foreground">Tidak ada pengeluaran pending.</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Warga Menunggak</CardTitle>
            <CardDescription>Ada {dashboardData.wargaMenunggak.length} warga yang menunggak bulan ini</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardData.wargaMenunggak.length > 0 ? (
              dashboardData.wargaMenunggak.map((warga, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${warga.name.replace(/\s/g, '')}`} alt={warga.name} />
                      <AvatarFallback>{warga.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{warga.name}</p>
                      <p className="text-xs text-muted-foreground">{warga.address}</p>
                    </div>
                  </div>
                  <div className="text-sm font-semibold">{warga.amount}</div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-40">
                <p className="text-muted-foreground">Tidak ada warga yang menunggak.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 