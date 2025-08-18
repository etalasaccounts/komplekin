"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { HeaderUser } from "./components/HeaderUser";

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check if user is in password recovery mode (hanya di client-side)
    if (typeof window !== 'undefined') {
      const isPasswordRecoveryMode = localStorage.getItem('password_recovery_mode');
      const recoveryTimestamp = localStorage.getItem('password_recovery_timestamp');
      
      if (isPasswordRecoveryMode === 'true' && recoveryTimestamp) {
        const timestamp = parseInt(recoveryTimestamp);
        const now = Date.now();
        const hoursDiff = (now - timestamp) / (1000 * 3600);
        
        // If recovery mode was set within last 24 hours, redirect to reset password
        if (hoursDiff < 24) {
          router.push('/user/auth/reset-password');
          return;
        } else {
          // Clear expired recovery mode
          localStorage.removeItem('password_recovery_mode');
          localStorage.removeItem('password_recovery_timestamp');
        }
      }
    }

    if (!loading) {
      if (!user) {
        router.push('/user/auth');
      } else if (userRole === 'admin') {
        router.push('/admin/dashboard');
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

  if (!user || userRole === 'admin') {
    return null;
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background">
      <HeaderUser />
      <div className="max-w-4xl mx-auto p-4">
        <div className="!pb-10">{children}</div>
      </div>
    </div>
  );
}
