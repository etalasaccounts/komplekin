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
} from 'lucide-react'

const statCards = [
  {
    title: 'Total Jumlah Warga',
    value: '112 KK',
    change: '+2%',
    changeType: 'positive',
    description: 'Warga baru sejak bulan lalu',
    link: 'Lihat Jumlah Warga',
    icon: Users,
    iconBg: 'bg-[#E9358F]',
    iconColor: 'text-white',
  },
  {
    title: 'Saldo/kas',
    value: 'Rp12.000.000',
    change: '+750rb',
    changeType: 'positive',
    description: 'Saldo naik dari bulan lalu',
    link: 'Lihat Jumlah Saldo',
    icon: Wallet,
    iconBg: 'bg-[#35ADE9]',
    iconColor: 'text-white',
  },
  {
    title: 'Pemasukan kas',
    value: 'Rp3.000.000',
    change: '-750rb',
    changeType: 'negative',
    description: 'Lebih rendah dari bulan lalu',
    link: 'Lihat Jumlah Pemasukan',
    icon: ReceiptText,
    iconBg: 'bg-[#693EE0]',
    iconColor: 'text-white',
  },
  {
    title: 'Pengeluaran RT',
    value: 'Rp3.000.000',
    change: '-750rb',
    changeType: 'negative',
    description: 'Pengeluaran turun bulan ini',
    link: 'Lihat Jumlah Pengeluaran',
    icon: LineChart,
    iconBg: 'bg-[#1DAF9C]',
    iconColor: 'text-white',
  },
]

const pemasukanData = [
  {
    name: 'Iuran Mathew Alexander',
    description: 'Pembayaran iuran bulan Juli 2025',
    amount: 'Rp120.000',
    date: 'Jul 25',
  },
  {
    name: 'Iuran Mathew Alexander',
    description: 'Pembayaran iuran bulan Juni 2025',
    amount: 'Rp120.000',
    date: 'Sep 18',
  },
]

const pengeluaranData = [
  {
    name: 'Gaji Satpam Komplek',
    description: 'Gaji bulanan pak satpam komplek',
    amount: 'Rp4.000.000',
    date: 'Juli 2025',
  },
  {
    name: 'Acara 17 Agustus 2025',
    description: 'Pengeluaran untuk acara 17 Agustu...',
    amount: 'Rp12.000.000',
    date: 'Agustus 2025',
  },
]

const wargaMenunggakData = [
    { name: 'Olivia Martin', address: 'Komplek Mahata Margonda No34...', amount: 'Rp120.000' },
    { name: 'Jackson Lee', address: 'Komplek Mahata Margonda No12...', amount: 'Rp120.000' },
    { name: 'Isabella Nguyen', address: 'Komplek Mahata Margonda No24...', amount: 'Rp120.000' },
    { name: 'William Kim', address: 'Komplek Mahata Margonda No18...', amount: 'Rp120.000' },
    { name: 'Sofia Davis', address: 'Komplek Mahata Margonda No34...', amount: 'Rp120.000' },
]

export default function AdminDashboardPage() {
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
              <div className="text-3xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                {card.description}
                <Badge
                  variant="outline"
                  className={`ml-2 ${
                    card.changeType === 'positive'
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : 'bg-red-100 text-red-800 border-red-200'
                  }`}
                >
                  {card.change}
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
        ))}
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
                {pemasukanData.map((item, index) => (
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
                ))}
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
                {pengeluaranData.map((item, index) => (
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
                ))}
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
            <CardDescription>Ada {wargaMenunggakData.length} warga yang menunggak bulan ini</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {wargaMenunggakData.map((warga, index) => (
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
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 