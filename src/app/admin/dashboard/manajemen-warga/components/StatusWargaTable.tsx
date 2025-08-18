"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from 'lucide-react';
import { WargaData } from './WargaDetailModal';
import { useWargaActions } from "@/hooks/useWarga";
import { toast } from "sonner";
import HapusWargaModal from './HapusWargaModal';

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Aktif":
      return <Badge className="bg-[#2597D0] text-white rounded-full">Aktif</Badge>;
    case "Pindah":
      return <Badge className="bg-[#717784] text-white rounded-full">Pindah</Badge>;
    case "Ditolak":
      return <Badge className="bg-[#D02533] text-white rounded-full">Ditolak</Badge>;
    case "Warga Baru":
      return <Badge className="bg-[#CE5E12] text-white rounded-full">Warga Baru</Badge>;
    case "Perlu Persetujuan":
      return <Badge className="bg-[#2547D0] text-white rounded-full">Perlu Persetujuan</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

const ActionMenu = ({ originalId, profileId, status, refetch }: { originalId?: string; profileId?: string; status?: string; refetch?: () => void }) => {
  const { updateRole, updateCitizenStatus, deleteWarga } = useWargaActions();

  const handleMakeAdmin = async () => {
    if (!originalId) {
      toast.error('ID warga tidak ditemukan');
      return;
    }
    try {
      await updateRole(originalId, 'admin');
      toast.success('Warga berhasil dijadikan admin');
      if (refetch) refetch();
    } catch (error) {
      console.error('Error updating warga role:', error);
      toast.error('Gagal mengubah role warga');
    }
  };

  const handleMarkAsPindah = async () => {
    if (!profileId) {
      toast.error('Profile ID tidak ditemukan');
      return;
    }
    try {
      await updateCitizenStatus(profileId, 'Pindah');
      toast.success('Status warga berhasil diubah menjadi Pindah');
      if (refetch) refetch();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Gagal mengubah status warga');
    }
  };

  const handleDeleteWarga = async () => {
    if (!originalId) {
      toast.error('ID warga tidak ditemukan');
      return;
    }
    try {
      // Gunakan hard delete untuk menghapus semua data (user_permissions, profiles, auth.users)
      await deleteWarga(originalId, true);
      toast.success('Warga berhasil dihapus secara permanen');
      if (refetch) refetch();
    } catch (error) {
      console.error('Error deleting warga:', error);
      toast.error('Gagal menghapus warga');
    }
  };

  // Check if status is already "Pindah"
  const isPindah = status?.toLowerCase() === 'pindah';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleMakeAdmin}>Jadikan Admin</DropdownMenuItem>
        {!isPindah && (
          <DropdownMenuItem onClick={handleMarkAsPindah}>Warga Pindah</DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleDeleteWarga} className="text-red-600">Hapus Warga</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface StatusWargaTableProps {
  statusWargaData: (WargaData & { id: number })[];
  refetch?: () => void;
  totalCount?: number; // Tambahkan prop untuk total count
}

export default function StatusWargaTable({ statusWargaData, refetch, totalCount }: StatusWargaTableProps) {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { deleteWarga } = useWargaActions();
  const searchParams = useSearchParams();

  // Fungsi untuk membuat URL dengan parameter yang ada dan menambahkan parameter baru
  const createUrlWithParams = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Tambahkan parameter baru
    Object.entries(newParams).forEach(([key, value]) => {
      params.set(key, value);
    });
    
    return `/admin/dashboard/manajemen-warga?${params.toString()}`;
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(statusWargaData.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  // Handle individual item selection
  const handleItemSelect = (itemId: number, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  // Handle delete all selected
  const handleDeleteAll = () => {
    if (selectedItems.length === 0) {
      toast.error('Pilih warga yang akan dihapus terlebih dahulu');
      return;
    }
    setShowDeleteModal(true);
  };

  const confirmDeleteAll = async () => {
    try {
      // Delete each selected item
      for (const itemId of selectedItems) {
        const item = statusWargaData.find(data => data.id === itemId);
        if (item?.originalId) {
          await deleteWarga(item.originalId, true);
        }
      }
      
      toast.success(`${selectedItems.length} warga berhasil dihapus`);
      setSelectedItems([]);
      setShowDeleteModal(false);
      if (refetch) refetch();
    } catch (error) {
      console.error('Error deleting multiple warga:', error);
      toast.error('Gagal menghapus beberapa warga');
    }
  };

  const isAllSelected = statusWargaData.length > 0 && selectedItems.length === statusWargaData.length;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < statusWargaData.length;

  return (
    <>
      <div className="border rounded-lg">
        {/* Header with title, total count, selected count, and delete all button */}
        <div className="p-4 border-b bg-gray-50">
          {/* Title row */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Status Warga</h2>
              <Badge variant="secondary" className="text-sm">
                {totalCount || statusWargaData.length} Warga
              </Badge>
            </div>
            {selectedItems.length > 0 && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleDeleteAll}
                className=" cursor-pointer"
              >
                Delete All ({selectedItems.length})
              </Button>
            )}
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  ref={(el) => {
                    if (el) {
                      (el as HTMLInputElement).indeterminate = isIndeterminate;
                    }
                  }}
                />
              </TableHead>
              <TableHead>Nama Lengkap</TableHead>
              <TableHead hidden>Alamat Rumah</TableHead>
              <TableHead>Nomor HP</TableHead>
              <TableHead>Status Tinggal</TableHead>
              <TableHead>Tanggal Tinggal</TableHead>
              <TableHead>Tanggal Daftar</TableHead>
              <TableHead>Dokumen</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statusWargaData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Checkbox 
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={(checked) => handleItemSelect(item.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell className="font-medium">{item.nama}</TableCell>
                <TableCell hidden >{item.alamat}</TableCell>
                <TableCell>{item.kontak}</TableCell>
                <TableCell>{item.statusKepemilikan}</TableCell>
                <TableCell>{item.tanggalTinggal}</TableCell>
                <TableCell>{item.tanggalDaftar}</TableCell>
                <TableCell>
                   <Link href={createUrlWithParams({ modal: 'dokumen', id: item.id.toString() })}>
                      <Button variant="link" className="p-0">Lihat Dokumen</Button>
                   </Link>
                </TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell>
                  <ActionMenu originalId={item.originalId} profileId={item.profileId} status={item.status} refetch={refetch} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Modal */}
      <HapusWargaModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={confirmDeleteAll}
        title={`Hapus ${selectedItems.length} Warga yang Dipilih?`}
        description={`Apakah Anda yakin ingin menghapus ${selectedItems.length} warga yang dipilih? Tindakan ini akan menghapus semua data warga dari sistem, termasuk histori pembayaran dan aktivitas lainnya. Jika dihapus progres tidak dapat dikembalikan.`}
      />
    </>
  );
} 