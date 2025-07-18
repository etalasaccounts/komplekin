"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { House, DollarSign, CalendarDays } from "lucide-react";

export function UserNavigation() {
  const pathname = usePathname();

  const navItems = [
    {
      title: "Dashboard",
      href: "/user/dashboard",
      value: "dashboard",
      icon: <House className="w-4 h-4 mr-1" />,
    },
    {
      title: "Iuran Bulanan",
      href: "/user/dashboard/iuran-bulanan",
      value: "iuran",
      icon: <DollarSign className="w-4 h-4 mr-1" />,
    },
    {
      title: "Riwayat Bayar",
      href: "/user/dashboard/riwayat-pembayaran",
      value: "riwayat",
      icon: <CalendarDays className="w-4 h-4 mr-1" />,
    },
  ];

  return (
    <div className="flex overflow-x-auto justify-between rounded-none gap-1 scrollbar-hide">
      {navItems.map((item) => (
        <Link
          key={item.value}
          href={item.href}
          className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-none px-1 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-shrink-0 min-w-fit",
            pathname === item.href
              ? "bg-background text-foreground border-b border-foreground rounded-none"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {item.icon}
          {item.title}
        </Link>
      ))}
    </div>
  );
}
