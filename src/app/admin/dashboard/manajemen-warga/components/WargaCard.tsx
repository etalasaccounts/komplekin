import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Phone,
  Home,
  User,
  Calendar,
  Edit,
  Trash,
  UserCog,
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
  status: string;
  nama: string;
  role: string;
  kontak: string;
  alamat: string;
  tipeRumah: string;
  terdaftar: string;
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

export default function WargaCard({
  status,
  nama,
  role,
  kontak,
  alamat,
  tipeRumah,
  terdaftar,
}: WargaCardProps) {
  const isAdmin = status.toLowerCase() === "admin";

  return (
    <div className="bg-card rounded-xl border p-4 flex flex-col space-y-4">
      <div className="flex items-start justify-between">
        <Badge className={`${getStatusVariant(status)}`}>{status}</Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              <span>Edit Data Warga</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <UserCog className="mr-2 h-4 w-4" />
              <span>Jadikan Admin</span>
            </DropdownMenuItem>
            {!isAdmin && (
              <DropdownMenuItem className="text-destructive">
                <Trash className="mr-2 h-4 w-4" />
                <span>Hapus Warga</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col items-center text-center space-y-2">
        <Avatar className="h-20 w-20">
          <AvatarImage src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${nama}`} alt={nama} />
          <AvatarFallback>{nama.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-base">{nama}</h3>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm text-muted-foreground border">
        <div className="flex items-center">
          <Phone className="h-4 w-4 mr-2" />
          <span>{kontak}</span>
        </div>
        <div className="flex items-center">
          <Home className="h-4 w-4 mr-2" />
          <span>{alamat}</span>
        </div>
        <div className="flex items-center">
          <User className="h-4 w-4 mr-2" />
          <span>{tipeRumah}</span>
        </div>
      </div>

      <div className="border-t pt-3 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center">
          <Calendar className="h-3 w-3 mr-1.5" />
          <span>Terdaftar {terdaftar}</span>
        </div>
        <Button variant="link" className="h-auto p-0 text-xs">
          Lihat Detail
        </Button>
      </div>
    </div>
  );
} 