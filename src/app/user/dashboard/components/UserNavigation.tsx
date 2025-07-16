"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function UserNavigation() {
  const pathname = usePathname();

  const navItems = [
    {
      title: "Dashboard Pribadi",
      href: "/user/dashboard",
      value: "dashboard",
    },
    {
      title: "Iuran Bulanan",
      href: "/user/dashboard/iuran-bulanan",
      value: "iuran",
    },
    {
      title: "Pembayaran",
      href: "/user/dashboard/pembayaran",
      value: "pembayaran",
    },
  ];

  return (
    <div className="flex overflow-x-auto bg-muted p-1 rounded-lg gap-1 scrollbar-hide">
      {navItems.map((item) => (
        <Link
          key={item.value}
          href={item.href}
          className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-shrink-0 min-w-fit",
            pathname === item.href
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {item.title}
        </Link>
      ))}
    </div>
  );
}
