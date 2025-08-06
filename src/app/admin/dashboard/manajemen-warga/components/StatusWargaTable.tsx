"use client";

import React from 'react';
import Link from 'next/link';
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

const ActionMenu = ({ originalId, refetch }: { originalId?: string; refetch?: () => void }) => {
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
    if (!originalId) {
      toast.error('ID warga tidak ditemukan');
      return;
    }
    try {
      // Note: updateCitizenStatus needs profileId, not user permission ID
      // This might need to be fixed based on actual implementation
      await updateCitizenStatus(originalId, 'Pindah');
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
      await deleteWarga(originalId, false); // soft delete
      toast.success('Warga berhasil dihapus');
      if (refetch) refetch();
    } catch (error) {
      console.error('Error deleting warga:', error);
      toast.error('Gagal menghapus warga');
    }
  };

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
        <DropdownMenuItem onClick={handleMarkAsPindah}>Warga Pindah</DropdownMenuItem>
        <DropdownMenuItem onClick={handleDeleteWarga} className="text-red-600">Hapus Warga</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface StatusWargaTableProps {
  statusWargaData: (WargaData & { id: number })[];
  refetch?: () => void;
}

export default function StatusWargaTable({ statusWargaData, refetch }: StatusWargaTableProps) {
  // Debug: Log data yang diterima
  console.log('StatusWargaTable received data:', statusWargaData);
  console.log('StatusWargaTable data count:', statusWargaData.length);

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox />
            </TableHead>
            <TableHead>Nama Lengkap</TableHead>
            <TableHead>Alamat Rumah</TableHead>
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
                <Checkbox />
              </TableCell>
              <TableCell className="font-medium">{item.nama}</TableCell>
              <TableCell>{item.alamat}</TableCell>
              <TableCell>{item.kontak}</TableCell>
              <TableCell>{item.statusKepemilikan}</TableCell>
              <TableCell>{item.tanggalTinggal}</TableCell>
              <TableCell>{item.tanggalDaftar}</TableCell>
              <TableCell>
                 <Link href={`/admin/dashboard/manajemen-warga?modal=dokumen&id=${item.id}`}>
                    <Button variant="link" className="p-0">Lihat Dokumen</Button>
                 </Link>
              </TableCell>
              <TableCell>{getStatusBadge(item.status)}</TableCell>
              <TableCell>
                <ActionMenu originalId={item.originalId} refetch={refetch} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 