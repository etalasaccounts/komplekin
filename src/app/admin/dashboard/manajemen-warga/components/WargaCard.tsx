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

interface WargaCardProps {
  id: number;
  status: string;
  nama: string;
  role: string;
  kontak: string;
  alamat: string;
  tipeRumah: string;
  tanggalDaftar: string;
}

const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "admin":
      return "bg-[#D0257A] text-white";
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

const ActionMenu = ({ status, wargaId }: { status: string; wargaId: number }) => {
  const currentPath = "/admin/dashboard/manajemen-warga";
  const statusLowerCase = status.toLowerCase();

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
        
        {statusLowerCase !== 'admin' ? (
          <>
            <DropdownMenuItem asChild>
              <Link href={`${currentPath}?modal=view&id=${wargaId}&edit=true`} className="cursor-pointer">
                Edit Data Warga
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              Jadikan Admin
            </DropdownMenuItem>

            {statusLowerCase === 'pindah' && (
              <DropdownMenuItem asChild>
                <Link href={`${currentPath}?modal=delete&id=${wargaId}`} className="cursor-pointer text-destructive">
                  Hapus Warga
                </Link>
              </DropdownMenuItem>
            )}
          </>
        ) : (
          <DropdownMenuItem disabled>Tidak ada aksi</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};


export default function WargaCard({
  id,
  status,
  nama,
  role,
  kontak,
  alamat,
  tipeRumah,
  tanggalDaftar,
}: WargaCardProps): React.ReactElement {

  return (
    <div className="bg-card rounded-xl border p-4 flex flex-col space-y-4">
      <div className="flex items-start justify-between">
        <Badge className={`${getStatusVariant(status)}`}>{status}</Badge>
        <ActionMenu status={status} wargaId={id} />
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