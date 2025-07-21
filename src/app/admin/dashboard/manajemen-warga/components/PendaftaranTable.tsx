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
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Check, X, RefreshCw, Trash2, Edit, FileText } from 'lucide-react';
import { WargaData } from './WargaDetailModal';


const getStatusBadge = (status: string) => {
  switch (status) {
    case "Perlu Persetujuan":
      return <Badge className="bg-[#2547D0] text-white rounded-full">Perlu Persetujuan</Badge>;
    case "Ditolak":
      return <Badge className="bg-[#D02533] text-white rounded-full">Ditolak</Badge>;
    case "Warga Baru":
      return <Badge className="bg-[#CE5E12] text-white rounded-full">Warga Baru</Badge>;
    case "Pindah":
      return <Badge className="bg-[#717784] text-white rounded-full">Pindah</Badge>;
    case "Aktif":
      return <Badge className="bg-[#2597D0] text-white rounded-full">Aktif</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

const ActionButtons = ({ status, wargaId }: { status: string; wargaId: number }) => {
  const currentPath = "/admin/dashboard/manajemen-warga";

  return (
    <>
      {status === "Perlu Persetujuan" && (
        <div className="flex items-center gap-2">
          <Link href={`${currentPath}?modal=view&id=${wargaId}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
          </Link>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600"><Check className="h-4 w-4" /></Button>
          <Link href={`${currentPath}?modal=reject&id=${wargaId}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600"><X className="h-4 w-4" /></Button>
          </Link>
        </div>
      )}
      {status === "Ditolak" && (
        <div className="flex items-center gap-2">
           <Link href={`${currentPath}?modal=view&id=${wargaId}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
          </Link>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600"><RefreshCw className="h-4 w-4" /></Button>
           <Link href={`${currentPath}?modal=delete&id=${wargaId}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600"><Trash2 className="h-4 w-4" /></Button>
          </Link>
        </div>
      )}
      {status === "Pindah" && (
        <div className="flex items-center gap-2">
           <Link href={`${currentPath}?modal=view&id=${wargaId}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
          </Link>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600"><RefreshCw className="h-4 w-4" /></Button>
           <Link href={`${currentPath}?modal=delete&id=${wargaId}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600"><Trash2 className="h-4 w-4" /></Button>
          </Link>
        </div>
      )}
      {(status === "Warga Baru" || status === "Aktif") && (
        <div className="flex items-center gap-2">
           <Link href={`${currentPath}?modal=view&id=${wargaId}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
          </Link>
          <Link href={`${currentPath}?modal=view&id=${wargaId}&edit=true`}>
            <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
          </Link>
          <Button variant="ghost" size="icon" className="h-8 w-8"><FileText  className="h-4 w-4"/></Button>
        </div>
      )}
    </>
  );
};

export default function PendaftaranTable({ pendaftaranData }: { pendaftaranData: (WargaData & { id: number })[] }) {
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
          {pendaftaranData.map((item) => (
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
                <ActionButtons status={item.status} wargaId={item.id} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 