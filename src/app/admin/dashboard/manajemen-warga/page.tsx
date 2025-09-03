"use client";

import React, { useState, Suspense, useMemo, useEffect } from "react";
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
    nama: item.profile.fullname || '',
    alamat: item.profile.address || '',
    kontak: item.profile.no_telp || '',
    statusKepemilikan: item.profile.ownership_status || '',
    tanggalTinggal: formatDate(item.profile.moving_date),
    tanggalDaftar: formatDate(item.profile.created_at),
    status: mapStatusToComponent(item.user_status, item.role, item.profile.citizen_status),
    role: mapRoleToComponent(item.role),
    email: item.profile.email || '',
    nomorRumah: item.profile.house_number || '',
    kepalaKeluarga: item.profile.head_of_family || '',
    kontakDarurat: item.profile.emergency_telp || '',
    pekerjaan: item.profile.work || item.profile.emergency_job || '',
    fotoKTP: item.profile.file_ktp || '',
    fotoKK: item.profile.file_kk || '',
  }));
};

// Helper function untuk format tanggal (fixed untuk menghindari hydration mismatch)
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Gunakan format manual untuk menghindari perbedaan locale antara server/client
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

// Helper function untuk mapping status
const mapStatusToComponent = (
  userStatus: string | null, 
  role: string | null, 
  citizenStatus: string | null
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
const mapRoleToComponent = (role: string | null): string => {
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
  
  // Ambil search dan filter dari URL parameters
  const searchQuery = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status') || '';
  
  // Ambil data warga dari database
  const { warga: rawWargaData, loading, error, refetch } = useWarga();

  // Convert data untuk komponen
  const pendaftaranData = useMemo(() => {
    // Sort raw data berdasarkan created_at descending (terbaru di atas)
    const sortedRawData = [...rawWargaData].sort((a, b) => {
      const dateA = new Date(a.profile.created_at || '1970-01-01');
      const dateB = new Date(b.profile.created_at || '1970-01-01');
      return dateB.getTime() - dateA.getTime();
    });
    
    const mappedData = mapWargaDataToComponent(sortedRawData);
    return mappedData;
  }, [rawWargaData]);

  const modal = searchParams.get('modal');
  const userId = searchParams.get('id');
  const isEditing = searchParams.get('edit') === 'true';

  const selectedWarga = userId ? pendaftaranData.find(w => w.id === parseInt(userId)) : null;

  const handleCloseModal = () => {
    // Buat URL baru dengan parameter yang ada, kecuali modal dan id
    const currentParams = new URLSearchParams(searchParams);
    currentParams.delete('modal');
    currentParams.delete('id');
    currentParams.delete('edit');
    
    const newUrl = `/admin/dashboard/manajemen-warga?${currentParams.toString()}`;
    router.push(newUrl);
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

  // Handle search dengan debounce
  const [searchInput, setSearchInput] = useState(searchQuery);

  // Sync searchInput dengan URL parameter
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const currentParams = new URLSearchParams(searchParams);
      if (searchInput.trim()) {
        currentParams.set('search', searchInput.trim());
      } else {
        currentParams.delete('search');
      }
      currentParams.delete('page'); // Reset page when searching
      router.push(`/admin/dashboard/manajemen-warga?${currentParams.toString()}`);
      setCurrentPage(1);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchInput, searchParams, router]);

  const handleSearch = (query: string) => {
    setSearchInput(query);
  };

  // Handle status filter
  const handleStatusFilter = (status: string) => {
    const currentParams = new URLSearchParams(searchParams);
    if (status && status !== 'all') {
      currentParams.set('status', status);
    } else {
      currentParams.delete('status');
    }
    currentParams.delete('page'); // Reset page when filtering
    router.push(`/admin/dashboard/manajemen-warga?${currentParams.toString()}`);
    setCurrentPage(1);
  };

  // Filter data berdasarkan search dan status
  const filteredData = useMemo(() => {
    let filtered = pendaftaranData;

    // Filter berdasarkan search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(warga => 
        (warga.nama?.toLowerCase() || '').includes(query) ||
        (warga.alamat?.toLowerCase() || '').includes(query) ||
        (warga.kontak || '').includes(query) ||
        (warga.nomorRumah?.toLowerCase() || '').includes(query) ||
        (warga.email?.toLowerCase() || '').includes(query)
      );
    }

    // Filter berdasarkan status (hanya jika ada status filter yang spesifik)
    if (statusFilter && statusFilter !== 'all') {
      // Map status filter ke status yang sesuai
      let targetStatuses: string[] = [];
      switch (statusFilter.toLowerCase()) {
        case 'aktif':
          targetStatuses = ['Aktif'];
          break;
        case 'pindah':
          targetStatuses = ['Pindah'];
          break;
        case 'admin':
          targetStatuses = ['Admin'];
          break;
        case 'warga baru':
          targetStatuses = ['Warga Baru'];
          break;
        default:
          targetStatuses = [statusFilter];
      }
      
      filtered = filtered.filter(warga => 
        targetStatuses.includes(warga.status || '')
      );
    }

    return filtered;
  }, [pendaftaranData, searchQuery, statusFilter]);

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
        // Filter untuk daftar warga (hanya yang aktif, warga baru, pindah)
        const daftarWarga = filteredData.filter(w => 
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
        const pendaftaranWarga = filteredData.filter(w => 
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
        const statusWargaData = filteredData;
        const paginatedStatusWarga = getCurrentPageData(statusWargaData);
        return (
          <div className="space-y-4">
            <StatusWargaTable statusWargaData={paginatedStatusWarga} refetch={refetch} totalCount={statusWargaData.length} />
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
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
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
              <DropdownMenuCheckboxItem 
                checked={!statusFilter || statusFilter === 'all'}
                onCheckedChange={() => handleStatusFilter('all')}
              >
                Semua
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem 
                checked={statusFilter === 'aktif'}
                onCheckedChange={() => handleStatusFilter('aktif')}
              >
                Aktif
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem 
                checked={statusFilter === 'pindah'}
                onCheckedChange={() => handleStatusFilter('pindah')}
              >
                Pindah
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem 
                checked={statusFilter === 'admin'}
                onCheckedChange={() => handleStatusFilter('admin')}
              >
                Admin
              </DropdownMenuCheckboxItem>
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
            // Gunakan data yang sudah difilter di renderContent
            currentData = filteredData.filter(w => w.status === "Aktif" || w.status === "Warga Baru" || w.status === "Pindah");
            break;
          // Temporarily hidden - case "pendaftaran"
          case "pendaftaran-warga":
            currentData = filteredData.filter(w => w.status === "Perlu Persetujuan" || w.status === "Ditolak");
            break;
          case "status-warga":
            currentData = filteredData; // Show all warga for status management
            break;
          default:
            currentData = filteredData;
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
          onConfirm={() => {
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
