import React from "react";
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Phone,
  MapPin,
  User,
  Calendar,
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
import { toast } from "sonner";

interface WargaCardProps {
  id: number;
  originalId?: string;
  status: string;
  nama: string;
  role: string;
  kontak: string;
  alamat: string;
  tipeRumah: string;
  tanggalDaftar: string;
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

const ActionMenu = ({ status, originalId, id,  role, refetch }: { status: string; originalId?: string; id?: number; role: string; refetch?: () => void }) => {
  const currentPath = "/admin/dashboard/manajemen-warga";
  const statusLowerCase = status.toLowerCase();
  const roleLowerCase = role.toLowerCase();
  const { updateRole, deleteWarga, updateCitizenStatus } = useWargaActions();

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
      await deleteWarga(originalId);
      toast.success('Warga berhasil dihapus');
      if (refetch) refetch();
    } catch (error) {
      console.error('Error deleting warga:', error);
      toast.error('Gagal menghapus warga');
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
      console.error('Error marking as pindah:', error);
      toast.error('Gagal mengubah status warga');
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
  status,
  nama,
  role,
  kontak,
  alamat,
  tipeRumah,
  tanggalDaftar,
  refetch,
}: WargaCardProps): React.ReactElement {

  return (
    <div className="bg-card rounded-xl border p-4 flex flex-col space-y-4">
      <div className="flex items-start justify-between">
        <Badge className={`${getStatusVariant(status, role)}`}>
          {role.toLowerCase().includes('admin') ? 'Admin' : status}
        </Badge>
        <ActionMenu status={status} originalId={originalId} id={id} role={role} refetch={refetch} />
      </div>

      <div className="flex flex-col items-center text-center space-y-2">
        <Avatar className="h-20 w-20">
          <AvatarImage src={`https://picsum.photos/200/500?random=${id}`} alt={nama} />
          <AvatarFallback>{nama.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-base">{nama}</h3>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-xs font-normal text-[#09090B] border">
        <div className="flex items-center">
          <Phone className="h-4 w-4 mr-2" />
          <span>{kontak}</span>
        </div>
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-2" />
          <span>{alamat}</span>
        </div>
        <div className="flex items-center">
          <User className="h-4 w-4 mr-2" />
          <span>{tipeRumah}</span>
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
  );
} 