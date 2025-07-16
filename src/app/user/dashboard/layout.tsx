import { HeaderUser } from "./components/HeaderUser";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="max-w-md mx-auto min-h-screen bg-background">
      <HeaderUser />
      <div className="max-w-4xl mx-auto p-4">
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
