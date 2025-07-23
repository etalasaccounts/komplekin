"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { KeyRound, Loader2, Command } from "lucide-react";
import { authService } from "@/services/auth";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";

export default function AdminResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 10;

    // Check if there's already an existing session for password recovery
    const checkExistingSession = async () => {
      try {
        const { data: { session } } = await authService.getClient().auth.getSession();
        if (session && mounted) {
          setSession(session);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error checking session:', error);
        return false;
      }
    };

    // Retry logic for session detection
    const retrySessionCheck = async () => {
      const sessionFound = await checkExistingSession();
      
      if (!sessionFound && retryCount < maxRetries && mounted) {
        retryCount++;
        setTimeout(retrySessionCheck, 500); // Wait 500ms before retry
      } else if (mounted) {
        // Stop loading after max retries or session found
        setSessionLoading(false);
      }
    };

    // Initial check
    retrySessionCheck();

    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
      if (mounted) {
        // This listener is crucial for catching the PASSWORD_RECOVERY event
        if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
          setSession(session);
          setSessionLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Show loading screen while checking for session
  if (sessionLoading) {
    return (
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <Command className="w-12 h-12 mx-auto text-primary" />
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Memuat...</h3>
              <p className="text-sm text-muted-foreground">Memeriksa sesi reset password...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Kata sandi tidak cocok.");
      return;
    }

    if (password.length < 6) {
      toast.error("Kata sandi harus minimal 6 karakter.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await authService.getClient().auth.updateUser({
        password: password
      });

      if (error) {
        toast.error("Gagal mengubah kata sandi. Silakan coba lagi.");
      } else {
        // Clear password recovery mode flags
        localStorage.removeItem('password_recovery_mode');
        localStorage.removeItem('password_recovery_timestamp');
        
        toast.success("Kata sandi admin berhasil diubah! Mengalihkan ke dashboard...");
        
        setRedirecting(true);
        
        // Redirect to admin dashboard
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 1500);
      }
    } catch {
      toast.error("Terjadi kesalahan yang tidak terduga.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading screen while redirecting
  if (redirecting) {
    return (
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <Command className="w-12 h-12 mx-auto text-primary" />
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Berhasil!</h3>
              <p className="text-sm text-muted-foreground">Mengalihkan ke dashboard admin...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show message if no session is available for password recovery
  if (!session) {
    return (
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-background rounded-full flex items-center justify-center">
              <KeyRound className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Sesi Tidak Valid</h3>
              <p className="text-sm text-muted-foreground">
                Silakan klik link reset password dari email admin Anda untuk melanjutkan.
              </p>
            </div>
            <Button 
              onClick={() => router.push('/admin/auth/forgot-password')}
              className="w-full"
            >
              Kembali ke Lupa Password
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-md">
        <Card className="overflow-hidden">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Command className="w-6 h-6" />
              <h1 className="text-xl font-semibold">KomplekIn Admin</h1>
            </div>
            
            <div className="flex items-center justify-center">
              <Image
                src="/images/illustration/reset-password.svg"
                alt="Reset Password"
                width={120}
                height={140}
              />
            </div>
            
            <div className="space-y-2">
              <CardTitle className="text-xl">Buat Kata Sandi Admin Baru</CardTitle>
              <CardDescription className="text-sm">
                Masukkan kata sandi baru untuk akun admin Anda
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Kata Sandi Baru</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan kata sandi baru"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Konfirmasi kata sandi baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Mengubah...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    Ubah Kata Sandi
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 