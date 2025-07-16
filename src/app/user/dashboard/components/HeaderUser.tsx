"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserNavigation } from "./UserNavigation";

export function HeaderUser() {
  const pathname = usePathname();

  const getPageTitle = () => {
    switch (pathname) {
      case "/user/dashboard":
        return "Dashboard";
      case "/user/dashboard/iuran-bulanan":
        return "Iuran Bulanan";
      case "/user/dashboard/pembayaran":
        return "Pembayaran";
      default:
        return "Dashboard";
    }
  };

  return (
    <>
      <header className="bg-card p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-2">
            <Image src="/images/logo.png" alt="Logo" width={18} height={18} />
            <h1 className="text-lg font-semibold">KomplekIn</h1>
          </div>
        </div>
      </header>
      <div className="max-w-4xl mx-auto p-4">
        <h2 className="text-xl font-semibold mb-6">{getPageTitle()}</h2>
        <UserNavigation />
      </div>
    </>
  );
}
