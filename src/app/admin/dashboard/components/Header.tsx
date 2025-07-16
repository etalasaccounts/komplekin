"use client";

import {
  Bell,
  WalletCards,
  Home,
  User,
  DollarSign,
  LogOut,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const Header = () => {
  const pathname = usePathname();

  const navigationItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: "Transaksi Warga",
      path: "/admin/dashboard/transaksi-warga",
      icon: <WalletCards className="h-5 w-5" />,
    },
    {
      name: "Keuangan",
      path: "/admin/dashboard/keuangan",
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      name: "Manajemen Warga",
      path: "/admin/dashboard/manajemen-warga",
      icon: <User className="h-5 w-5" />,
    },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-card">
      <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-2">
            {/* Logo */}
            <div className="flex items-center space-x-2 border-r border-[#E4E4E7] py-2 pr-4">
              <Image src="/images/logo.png" alt="Logo" width={24} height={24} />
              <span className="text-lg font-semibold">KomplekIn</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-7 ml-5">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? "bg-foreground text-white rounded-md px-2 py-3"
                      : "text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div>{item.icon}</div>
                    <span className="text-sm">{item.name}</span>
                  </div>
                </Link>
              ))}
            </nav>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="lg">
              <Bell className="size-6" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-md border py-5">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg" alt="Admin" />
                    <AvatarFallback>MA</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">Mathew Alexander</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
    </header>
  );
};

export default Header;
