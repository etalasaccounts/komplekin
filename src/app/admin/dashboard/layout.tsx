import Header from "@/app/admin/dashboard/components/Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="p-6">{children}</main>
    </div>
  );
}