import React from "react";
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  MapPin,
  Calendar,
  Mail,
  House,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWargaActions } from "@/hooks/useWarga";
import { wargaMagicService } from "@/services/wargaMagic";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface WargaCardProps {
  id: number;
  originalId?: string;
  profileId?: string; // Add profileId for updateCitizenStatus
  status: string;
  nama: string;
  role: string;
  email: string;
  alamat: string;
  nomorRumah: string;
  tanggalDaftar: string;
  photo?: string; // Foto profile dari database
  refetch?: () => void;
}

const getStatusVariant = (status: string, role: string) => {
  // Jika role adalah admin, return pink color
  if (role.toLowerCase().includes('admin')) {
    return "bg-[#D0257A] text-white";
  }
  
  switch (status.toLowerCase()) {
    case "warga baru":
      return "bg-[#CE5E12] text-white";
    case "aktif":
      return "bg-[#2597D0] text-white";
    case "pindah":
      return "bg-[#717784] text-white";
    default:
      return "bg-[#10B981] text-white";
  }
};

const ActionMenu = ({ status, originalId, profileId, id, role, refetch, nama, email }: { status: string; originalId?: string; profileId?: string; id?: number; role: string; refetch?: () => void; nama: string; email: string }) => {
  const currentPath = "/admin/dashboard/manajemen-warga";
  const statusLowerCase = status.toLowerCase();
  const roleLowerCase = role.toLowerCase();
  const { updateRole, deleteWarga, updateCitizenStatus } = useWargaActions();
  const { clusterName } = useAuth();

  const handleMakeAdmin = async () => {
    if (!originalId) {
      toast.error('ID warga tidak ditemukan');
      return;
    }
    try {
      await updateRole(originalId, 'admin');
      toast.success('Warga berhasil dijadikan admin');
      // Refresh data to update table
      if (refetch) refetch();
    } catch (error) {
      console.error('Error making admin:', error);
      toast.error('Gagal mengubah role warga');
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
      console.error('Error marking as pindah:', error);
      toast.error('Gagal mengubah status warga');
    }
  };

  const handleResendInvitation = async () => {
    if (!originalId || !email) {
      toast.error('Data warga tidak lengkap');
      return;
    }

    try {
      // Generate new temporary password and send invitation email
      const emailResponse = await fetch('/api/send-email/resend-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: nama,
          email: email,
          temporaryPassword: Math.random().toString(36).slice(-8), // Generate random temp password
          clusterName: clusterName || 'Komplek Anda',
          role: role || 'Warga'
        }),
      });

      const emailResult = await emailResponse.json();

      if (emailResult.success) {
        toast.success(`Undangan berhasil dikirim ulang ke ${nama}!`, {
          style: {
            background: '#22c55e',
            color: 'white',
            border: 'none'
          },
          duration: 5000,
        });
      } else {
        console.error('Email failed:', emailResult);
        toast.error('Gagal mengirim undangan. Silakan coba lagi.');
      }
    } catch (emailError) {
      console.error('Email service error:', emailError);
      toast.error('Terjadi kesalahan saat mengirim undangan.');
    }
  };

  // Determine if user is already admin
  const isAdmin = roleLowerCase.includes('admin');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Edit Data Warga - Always available */}
        <DropdownMenuItem asChild>
          <Link href={`${currentPath}?modal=view&id=${id}&edit=true`} className="cursor-pointer">
            Edit Data Warga
          </Link>
        </DropdownMenuItem>
        
        {/* Resend Invitation - Always available */}
        <DropdownMenuItem className="cursor-pointer" onClick={handleResendInvitation}>
          Kirim Ulang Undangan
        </DropdownMenuItem>
        
        {/* Jadikan Admin - Only if not already admin */}
        {!isAdmin && (
          <DropdownMenuItem className="cursor-pointer" onClick={handleMakeAdmin}>
            Jadikan Admin
          </DropdownMenuItem>
        )}

        {/* Tandai Pindah - Only if not already 'pindah' status */}
        {statusLowerCase !== 'pindah' && (
          <DropdownMenuItem className="cursor-pointer" onClick={handleMarkAsPindah}>
            Tandai Pindah
          </DropdownMenuItem>
        )}

        {/* Hapus Warga - Available for 'pindah' status or non-admin users */}
        {(statusLowerCase === 'pindah' || !isAdmin) && (
          <DropdownMenuItem className="cursor-pointer text-destructive" onClick={handleDeleteWarga}>
            Hapus Warga
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};


export default function WargaCard({
  id,
  originalId,
  profileId,
  status,
  nama,
  role,
  email,
  alamat,
  nomorRumah,
  tanggalDaftar,
  photo,
  refetch,
}: WargaCardProps): React.ReactElement {

  return (
    <div className="bg-card rounded-xl border p-4 flex flex-col space-y-4">
      <div className="flex items-start justify-between">
        <Badge className={`${getStatusVariant(status, role)}`}>
          {role.toLowerCase().includes('admin') ? 'Admin' : status}
        </Badge>
        <ActionMenu status={status} originalId={originalId} profileId={profileId} id={id} role={role} refetch={refetch} nama={nama} email={email} />
      </div>

      <div className="flex flex-col items-center text-center space-y-2">
        <Avatar className="h-20 w-20">
          {photo ? (
            <AvatarImage src={photo} alt={nama} />
          ) : null}
          <AvatarFallback className="bg-gray-200 text-gray-700 text-2xl font-semibold">
            {nama.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-base">{nama}</h3>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-xs font-normal text-[#09090B] border">
        <div className="flex items-center">
          <Mail className="h-4 w-4 mr-2" />
          <span>{email}</span>
        </div>
        <div className="flex items-center" hidden>
          <MapPin className="h-4 w-4 mr-2" />
          <span>{alamat}</span>
        </div>
        <div className="flex items-center">
          <House className="h-4 w-4 mr-2" />
          <span>{nomorRumah ? nomorRumah : '-'}</span>
        </div>
      </div>

      <div className="pt-3 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center">
          <Calendar className="h-3 w-3 mr-1.5" />
          <span>Terdaftar {tanggalDaftar}</span>
        </div>
        <Link href={`/admin/dashboard/manajemen-warga?modal=view&id=${id}`}>
            <Button
            variant="link"
            className="h-auto p-0 text-xs text-foreground font-semibold"
            >
            Lihat Detail
            </Button>
        </Link>
      </div>
    </div>
  );} 
