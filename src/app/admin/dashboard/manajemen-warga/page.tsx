"use client";

import React, { useState, Suspense, useMemo } from "react";
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
import { useWarga } from "@/hooks/useWarga";
import { WargaWithProfile } from "@/services/wargaService";

// Fungsi untuk mengkonversi data dari database ke format komponen
const mapWargaDataToComponent = (wargaData: WargaWithProfile[]): (WargaData & { id: number })[] => {
  return wargaData.map((item, index) => ({
    id: index + 1, // Use sequential number for display purposes
    originalId: item.id, // Keep original UUID for database operations
    profileId: item.profile_id, // Add profileId for updates
    nama: item.profile.fullname,
    alamat: item.profile.address,
    kontak: item.profile.no_telp,
    statusKepemilikan: item.profile.ownership_status,
    tanggalTinggal: formatDate(item.profile.moving_date),
    tanggalDaftar: formatDate(item.profile.created_at),
    status: mapStatusToComponent(item.user_status, item.role, item.profile.citizen_status),
    role: mapRoleToComponent(item.role),
    email: item.profile.email,
    tipeRumah: item.profile.house_type,
    kepalaKeluarga: item.profile.head_of_family,
    kontakDarurat: item.profile.emergency_telp,
    pekerjaan: item.profile.work || item.profile.emergency_job,
    fotoKTP: item.profile.file_ktp,
    fotoKK: item.profile.file_kk,
  }));
};

// Helper function untuk format tanggal
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Helper function untuk mapping status
const mapStatusToComponent = (
  userStatus: string, 
  role: string, 
  citizenStatus: string
): "Perlu Persetujuan" | "Ditolak" | "Aktif" | "Pindah" | "Warga Baru" => {
  // Prioritas: user_status dari user_permissions table
  if (userStatus === 'Inactive') return "Ditolak";
  if (userStatus === 'Active') {
    // Jika Active, cek citizen_status untuk detail lebih lanjut
    if (citizenStatus === 'Pindah') return "Pindah";
    if (citizenStatus === 'Warga baru') return "Warga Baru";
    return "Aktif";
  }
  
  // Default jika belum ada user_status (null/undefined)
  return "Perlu Persetujuan";
};

// Helper function untuk mapping role
const mapRoleToComponent = (role: string): string => {
  switch (role) {
    case 'admin':
      return 'Admin Komplek';
    case 'super admin':
      return 'Super Admin';
    case 'user':
    default:
      return 'Warga Komplek';
  }
};

function ManajemenWarga() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Ambil tab aktif dari URL parameter, default ke "daftar-warga"
  const activeTab = searchParams.get('tab') || 'daftar-warga';
  
  // Ambil data warga dari database
  const { warga: rawWargaData, loading, error, refetch } = useWarga();

  // Convert data untuk komponen
  const pendaftaranData = useMemo(() => {
    const mappedData = mapWargaDataToComponent(rawWargaData);
    
    // Sort descending berdasarkan tanggal daftar (terbaru di atas)
    const sortedData = mappedData.sort((a, b) => {
      const dateA = new Date(a.tanggalDaftar?.split('/').reverse().join('-') || '1970-01-01');
      const dateB = new Date(b.tanggalDaftar?.split('/').reverse().join('-') || '1970-01-01');
      return dateB.getTime() - dateA.getTime();
    });
    
    // Debug: Log untuk troubleshooting
    console.log('Raw warga data from database:', rawWargaData);
    console.log('Mapped data for components:', mappedData);
    console.log('Sorted data (descending):', sortedData);
    console.log('Total data count:', sortedData.length);
    
    return sortedData;
  }, [rawWargaData]);

  const modal = searchParams.get('modal');
  const userId = searchParams.get('id');
  const isEditing = searchParams.get('edit') === 'true';

  const selectedWarga = userId ? pendaftaranData.find(w => w.id === parseInt(userId)) : null;

  const handleCloseModal = () => {
    router.push('/admin/dashboard/manajemen-warga');
  };

  // Pagination logic
  const getCurrentPageData = <T,>(data: T[]): T[] => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (totalItems: number) => {
    return Math.ceil(totalItems / itemsPerPage);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleTabChange = (tab: string) => {
    // Prevent access to hidden pendaftaran tab
    if (tab === "pendaftaran") {
      const currentParams = new URLSearchParams(searchParams);
      currentParams.set('tab', 'daftar-warga');
      router.push(`/admin/dashboard/manajemen-warga?${currentParams.toString()}`);
      setCurrentPage(1);
      return;
    }
    
    // Update URL parameter
    const currentParams = new URLSearchParams(searchParams);
    currentParams.set('tab', tab);
    router.push(`/admin/dashboard/manajemen-warga?${currentParams.toString()}`);
    setCurrentPage(1); // Reset to first page when changing tabs
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading data warga...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-destructive">Error: {error}</div>
        </div>
      );
    }

    switch (activeTab) {
      case "daftar-warga":
        const daftarWarga = pendaftaranData.filter(w => 
          w.status === "Aktif" || w.status === "Warga Baru" || w.status === "Pindah"
        );
        const paginatedDaftarWarga = getCurrentPageData(daftarWarga);
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold">Daftar Warga Komplek</h2>
              <Badge variant="outline" className="bg-muted px-2 py-1 rounded-full">{daftarWarga.length} Warga Terdaftar</Badge>
            </div>
            <WargaList dataWarga={paginatedDaftarWarga} refetch={refetch} />
          </div>
        );
      // Temporarily hidden - case "pendaftaran"
      case "pendaftaran-warga":
        const pendaftaranWarga = pendaftaranData.filter(w => 
          w.status === "Perlu Persetujuan" || w.status === "Ditolak"
        );
        const paginatedPendaftaranWarga = getCurrentPageData(pendaftaranWarga);
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold">Pendaftaran Warga</h2>
              <Badge variant="outline" className="bg-muted px-2 py-1 rounded-full">{pendaftaranWarga.length} Warga Mendaftar</Badge>
            </div>
            <PendaftaranTable pendaftaranData={paginatedPendaftaranWarga}/>
          </div>
        );
      case "status-warga":
        // Show all warga for status management (no filtering)
        const statusWargaData = pendaftaranData;
        const paginatedStatusWarga = getCurrentPageData(statusWargaData);
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold">Status Warga</h2>
              <Badge variant="outline" className="bg-muted px-2 py-1 rounded-full">{statusWargaData.length} Warga</Badge>
            </div>
            <StatusWargaTable statusWargaData={paginatedStatusWarga} refetch={refetch} />
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
            onClick={() => handleTabChange("daftar-warga")}
            className={`px-4 py-2 text-sm font-medium transition-colors rounded-none ${
              activeTab === "daftar-warga" ? "border-b border-foreground text-foreground" : "text-muted-foreground"
            }`}
          >
            <ClipboardList className="size-4" />
            Daftar Warga
          </Button>
          {/* Temporarily hidden - Tab Pendaftaran */}
          {false && (
            <Button
              variant="ghost"
              onClick={() => handleTabChange("pendaftaran-warga")}
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-none ${
                activeTab === "pendaftaran-warga" ? "border-b border-foreground text-foreground" : "text-muted-foreground"
              }`}
            >
              <FileText className="size-4" />
              Pendaftaran
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={() => handleTabChange("status-warga")}
            className={`px-4 py-2 text-sm font-medium transition-colors rounded-none ${
              activeTab === "status-warga" ? "border-b border-foreground text-foreground" : "text-muted-foreground"
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
          <AddWargaDrawer refetch={refetch} />
        </div>
      </div>

      {renderContent()}

      {/* Dynamic Pagination */}
      {(() => {
        let currentData = [];
        let totalItems = 0;
        
        switch (activeTab) {
          case "daftar-warga":
            currentData = pendaftaranData.filter(w => w.status === "Aktif" || w.status === "Warga Baru" || w.status === "Pindah");
            break;
          // Temporarily hidden - case "pendaftaran"
          case "pendaftaran-warga":
            currentData = pendaftaranData.filter(w => w.status === "Perlu Persetujuan" || w.status === "Ditolak");
            break;
          case "status-warga":
            currentData = pendaftaranData; // Show all warga for status management
            break;
          default:
            currentData = pendaftaranData;
        }
        
        totalItems = currentData.length;
        const totalPages = getTotalPages(totalItems);
        const startIndex = (currentPage - 1) * itemsPerPage + 1;
        const endIndex = Math.min(currentPage * itemsPerPage, totalItems);
        
        if (totalItems === 0) return null;
        
        return (
      <div className="flex items-center justify-between text-sm text-muted-foreground w-full">
            <span className="text-nowrap">
              Menampilkan {startIndex} - {endIndex} dari {totalItems} List Warga
            </span>
            {totalPages > 1 && (
        <Pagination className="w-full flex justify-end">
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) handlePageChange(currentPage - 1);
                      }}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                </PaginationItem>
                  
                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(pageNumber);
                          }}
                          isActive={currentPage === pageNumber}
                          className="cursor-pointer"
                        >
                          {pageNumber}
                        </PaginationLink>
                </PaginationItem>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                <PaginationItem>
                    <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                        <PaginationLink 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(totalPages);
                          }}
                          className="cursor-pointer"
                        >
                          {totalPages}
                        </PaginationLink>
                </PaginationItem>
                    </>
                  )}
                  
                <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) handlePageChange(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
            )}
    </div>
        );
      })()}

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
          refetch={refetch}
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
