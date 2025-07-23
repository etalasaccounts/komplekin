"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Header from "./components/Header";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check if user is in password recovery mode
    const isPasswordRecoveryMode = localStorage.getItem('password_recovery_mode');
    const recoveryTimestamp = localStorage.getItem('password_recovery_timestamp');
    
    if (isPasswordRecoveryMode === 'true' && recoveryTimestamp) {
      const timestamp = parseInt(recoveryTimestamp);
      const now = Date.now();
      const hoursDiff = (now - timestamp) / (1000 * 3600);
      
      // If recovery mode was set within last 24 hours, redirect to reset password
      if (hoursDiff < 24) {
        router.push('/admin/auth/reset-password');
        return;
      } else {
        // Clear expired recovery mode
        localStorage.removeItem('password_recovery_mode');
        localStorage.removeItem('password_recovery_timestamp');
      }
    }

    if (!loading) {
      if (!user) {
        router.push('/admin/auth');
      } else if (userRole !== 'admin') {
        router.push('/user/dashboard');
      }
    }
  }, [user, userRole, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || userRole !== 'admin') {
    return null;
  }

  return (
    <div className="flex h-screen w-full flex-col">
      <Header />
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  );
}
