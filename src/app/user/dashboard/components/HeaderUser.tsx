"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserNavigation } from "./UserNavigation";
import { Button } from "@/components/ui/button";
import { Bell, LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function HeaderUser() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut, loading } = useAuth();

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/user/auth';
  };

  const formatDisplayName = (name: string | null | undefined): string => {
    if (!name) return 'User';
    const words = name.split(' ');
    if (words.length > 2) {
      return words.slice(0, 2).join(' ');
    }
    return name;
  };

  const userName = formatDisplayName(profile?.fullname);
  const userInitial = (profile?.fullname || 'U').charAt(0).toUpperCase();

  const getPageTitle = () => {
    switch (pathname) {
      case "/user/dashboard":
        return {
          title: "Dashboard",
          description:
            "Lihat ringkasan aktivitas dan kelola data Anda di satu tempat.",
        };
      case "/user/dashboard/iuran-bulanan":
        return {
          title: "Iuran Bulanan",
          description: "Lihat rincian iuran dan status pembayaran.",
        };
      case "/user/dashboard/riwayat-pembayaran":
        return {
          title: "Riwayat Pembayaran",
          description: "Lihat riwayat pembayaran Anda.",
        };
      default:
        return {
          title: "Dashboard",
          description:
            "Lihat ringkasan aktivitas dan kelola data Anda di satu tempat.",
        };
    }
  };

  return (
    <>
      <header className="bg-card p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Image 
                src="/images/logo.png" 
                alt="Logo" 
                width={18} 
                height={18}
                onError={(e) => {
                  console.error('Logo failed to load:', e);
                  e.currentTarget.style.display = 'none';
                }}
                priority
                unoptimized
              />
              <h1 className="text-lg font-semibold">KomplekIn</h1>
            </div>
            {/* User Actions */}
            <div className="flex items-center space-x-1">
              <Button variant="outline" size="icon" style={{ visibility: "hidden"}}>
                <Bell className="size-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-2 rounded-md">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg" alt="User" />
                      <AvatarFallback>{userInitial}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => router.push("/user/dashboard/profile")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>{userName}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer text-black"
                    onClick={handleLogout}
                    disabled={loading}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{loading ? 'Logging out...' : 'Logout'}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
      {pathname !== "/user/dashboard/profile" && (
        <div className="max-w-4xl mx-auto p-4">
          <h2 className="text-base font-semibold mb-2">
            {getPageTitle().title}
          </h2>
          <p className="text-xs text-muted-foreground mb-8">
            {getPageTitle().description}
          </p>

          <UserNavigation />
        </div>
      )}
    </>
  );
}
