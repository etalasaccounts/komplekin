"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  ChevronDown,
  Users,
  FileText,
  ClipboardList,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import WargaList from "./components/WargaList";
import PendaftaranTable from "./components/PendaftaranTable";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import AddWargaDrawer from "./components/AddWargaDrawer";
import WargaDetailModal, { WargaData } from "./components/WargaDetailModal";
import TolakPendaftaranModal from "./components/TolakPendaftaranModal";
import HapusWargaModal from "./components/HapusWargaModal";
import StatusWargaTable from "./components/StatusWargaTable";
import { PreviewImage } from "../components/PreviewImage";

// Dummy data, idealnya ini akan datang dari API
const pendaftaranData: (WargaData & { id: number })[] = [
  {
    id: 1,
    nama: "Mathew Alexander",
    alamat: "Komplek Mahata Margonda No12...",
    kontak: "089534924330",
    statusKepemilikan: "Sewa",
    tanggalTinggal: "06/07/2025",
    tanggalDaftar: "06/07/2025",
    status: "Perlu Persetujuan",
    role: "Warga Komplek",
    email: "mathewalexander@example.com",
    tipeRumah: "Tipe 42 A",
    kepalaKeluarga: "Mathew Alexander",
    kontakDarurat: "081234567890",
    pekerjaan: "Software Engineer",
    fotoKTP: "https://picsum.photos/800/500?random=1",
    fotoKK: "https://picsum.photos/800/600?random=2",
  },
  {
    id: 2,
    nama: "John Doe",
    alamat: "Komplek Mahata Margonda No13...",
    kontak: "081234567890",
    statusKepemilikan: "Milik Sendiri",
    tanggalTinggal: "01/01/2024",
    tanggalDaftar: "01/01/2024",
    status: "Ditolak",
    role: "Warga Komplek",
    email: "johndoe@example.com",
    tipeRumah: "Tipe 50 B",
    kepalaKeluarga: "John Doe",
    kontakDarurat: "089876543210",
    pekerjaan: "UI/UX Designer",
    fotoKTP: "https://picsum.photos/800/500?random=3",
    fotoKK: "https://picsum.photos/800/600?random=4",
  },
    {
    id: 3,
    nama: "Jane Smith",
    alamat: "Komplek Mahata Margonda No14...",
    kontak: "087654321098",
    statusKepemilikan: "Sewa",
    tanggalTinggal: "15/03/2023",
    tanggalDaftar: "15/03/2023",
    status: "Aktif",
    role: "Warga Komplek",
    email: "janesmith@example.com",
    tipeRumah: "Tipe 36 A",
    kepalaKeluarga: "Jane Smith",
    kontakDarurat: "081122334455",
    pekerjaan: "Product Manager",
    fotoKTP: "https://picsum.photos/800/500?random=5",
    fotoKK: "https://picsum.photos/800/600?random=6",
  },
  {
    id: 4,
    nama: "Michael Brown",
    alamat: "Komplek Mahata Margonda No15...",
    kontak: "081298765432",
    statusKepemilikan: "Milik Sendiri",
    tanggalTinggal: "20/08/2022",
    tanggalDaftar: "20/08/2022",
    status: "Pindah",
    role: "Warga Komplek",
    email: "michaelbrown@example.com",
    tipeRumah: "Tipe 60 C",
    kepalaKeluarga: "Michael Brown",
    kontakDarurat: "087712345678",
    pekerjaan: "Data Scientist",
    fotoKTP: "https://picsum.photos/800/500?random=7",
    fotoKK: "https://picsum.photos/800/600?random=8",
  },
  {
    id: 5,
    nama: "Sarah Wilson",
    alamat: "Komplek Mahata Margonda No16...",
    kontak: "085612345678",
    statusKepemilikan: "Sewa",
    tanggalTinggal: "10/10/2024",
    tanggalDaftar: "10/10/2024",
    status: "Warga Baru",
    role: "Warga Komplek",
    email: "sarahwilson@example.com",
    tipeRumah: "Tipe 36 B",
    kepalaKeluarga: "Sarah Wilson",
    kontakDarurat: "089987654321",
    pekerjaan: "Marketing",
    fotoKTP: "https://picsum.photos/800/500?random=9",
    fotoKK: "https://picsum.photos/800/600?random=10",
  },
];

function ManajemenWarga() {
  const [activeTab, setActiveTab] = useState("pendaftaran");
  const router = useRouter();
  const searchParams = useSearchParams();

  const modal = searchParams.get('modal');
  const userId = searchParams.get('id');
  const isEditing = searchParams.get('edit') === 'true';

  const selectedWarga = userId ? pendaftaranData.find(w => w.id === parseInt(userId)) : null;

  const handleCloseModal = () => {
    router.push('/admin/dashboard/manajemen-warga');
  };

  const renderContent = () => {
    switch (activeTab) {
      case "daftar":
        const daftarWarga = pendaftaranData.filter(w => w.status !== "Perlu Persetujuan" && w.status !== "Ditolak");
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold">Daftar Warga Komplek</h2>
              <Badge variant="outline" className="bg-muted px-2 py-1 rounded-full">{daftarWarga.length} Warga Terdaftar</Badge>
            </div>
            <WargaList dataWarga={daftarWarga} />
          </div>
        );
      case "pendaftaran":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold">Pendaftaran Warga</h2>
              <Badge variant="outline" className="bg-muted px-2 py-1 rounded-full">{pendaftaranData.length} Warga Mendaftar</Badge>
            </div>
            <PendaftaranTable pendaftaranData={pendaftaranData}/>
          </div>
        );
      case "status":
        const statusWargaData = pendaftaranData.filter(warga => warga.status === "Pindah" || warga.status === "Aktif");
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold">Status Warga</h2>
              <Badge variant="outline" className="bg-muted px-2 py-1 rounded-full">{statusWargaData.length} Warga</Badge>
            </div>
            <StatusWargaTable statusWargaData={statusWargaData} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Manajemen Warga</h1>
        <p className="text-muted-foreground">
          Kelola data warga secara menyeluruh, mulai dari pendaftaran hingga
          pembaruan informasi.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex space-x-1 p-2 w-fit">
          <Button
            variant="ghost"
            onClick={() => setActiveTab("daftar")}
            className={`px-4 py-2 text-sm font-medium transition-colors rounded-none ${
              activeTab === "daftar" ? "border-b border-foreground text-foreground" : "text-muted-foreground"
            }`}
          >
            <ClipboardList className="size-4" />
            Daftar Warga
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab("pendaftaran")}
            className={`px-4 py-2 text-sm font-medium transition-colors rounded-none ${
              activeTab === "pendaftaran" ? "border-b border-foreground text-foreground" : "text-muted-foreground"
            }`}
          >
            <FileText className="size-4" />
            Pendaftaran
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab("status")}
            className={`px-4 py-2 text-sm font-medium transition-colors rounded-none ${
              activeTab === "status" ? "border-b border-foreground text-foreground" : "text-muted-foreground"
            }`}
          >
            <Users className="size-4" />
            Status Warga
          </Button>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari berdasarkan nama, nomor rumah, dll"
              className="pl-10 w-80"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Filter
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Status Warga</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>Aktif</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Pindah</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Admin</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <AddWargaDrawer />
        </div>
      </div>

      {renderContent()}

      <div className="flex items-center justify-between text-sm text-muted-foreground w-full">
        <span className="text-nowrap">Menampilkan 10 dari 112 List Warga</span>
        <Pagination className="w-full flex justify-end">
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink href="#">1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink href="#">8</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink href="#">9</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink href="#">10</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationNext href="#" />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    </div>

    {selectedWarga && (
      <>
        <WargaDetailModal
          open={modal === 'view'}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              handleCloseModal();
            }
          }}
          warga={selectedWarga}
          initialIsEditing={isEditing}
        />
        <TolakPendaftaranModal
          open={modal === 'reject'}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              handleCloseModal();
            }
          }}
          onConfirm={(alasan) => {
            console.log('Tolak dengan alasan:', alasan);
            handleCloseModal();
          }}
        />
        <HapusWargaModal
          open={modal === 'delete'}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              handleCloseModal();
            }
          }}
          onConfirm={() => {
            console.log('Hapus warga');
            handleCloseModal();
          }}
        />
        <PreviewImage
          open={modal === 'dokumen'}
          onOpenChange={(isOpen: boolean) => {
            if (!isOpen) {
              handleCloseModal();
            }
          }}
          title={`Dokumen ${selectedWarga?.nama || ''}`}
          ktpSrc={selectedWarga?.fotoKTP}
          kkSrc={selectedWarga?.fotoKK}
        />
      </>
    )}
  </div>
  );
}

export default function ManajemenWargaPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ManajemenWarga />
    </Suspense>
  )
}
