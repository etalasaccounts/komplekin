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

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Aktif":
        return <Badge className="bg-[#2597D0] text-white rounded-full">Aktif</Badge>;
    case "Pindah":
      return <Badge className="bg-[#717784] text-white rounded-full">Pindah</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

const ActionMenu = ({ wargaId }: { wargaId: number }) => {
  const handleAction = (action: string) => {
    console.log(`${action} for warga ID: ${wargaId}`);
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
        <DropdownMenuItem onClick={() => handleAction('Jadikan Admin')}>Jadikan Admin</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction('Warga Pindah')}>Warga Pindah</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction('Hapus Warga')} className="text-red-600">Hapus Warga</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default function StatusWargaTable({ statusWargaData }: { statusWargaData: (WargaData & { id: number, status: string })[] }) {
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
                <ActionMenu wargaId={item.id} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 