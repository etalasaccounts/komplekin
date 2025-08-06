"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { KeyRound, Loader2, AlertCircle, Check } from "lucide-react";
import { authService } from "@/services/auth";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  // Magic link detection from URL params
  const isMagicLink = searchParams.get('magic_link') === 'true';
  const isNewUser = searchParams.get('new_user') === 'true';
  const checkHash = searchParams.get('check_hash') === 'true';
  const tempVerified = searchParams.get('temp_verified') === 'true';
  const error = searchParams.get('error');

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 15; // Increase retries for magic link

    console.log('Reset password page params:', { isMagicLink, isNewUser, checkHash, tempVerified, error });

    // Check for hash fragment authentication (from magic link)
    const checkHashAuthentication = async () => {
      if (checkHash) {
        console.log('Checking hash fragment for authentication...');
        
        // Check if there's authentication data in URL hash
        const hash = window.location.hash;
        if (hash && (hash.includes('access_token') || hash.includes('type=signup'))) {
          console.log('Found authentication in hash fragment');
          
                     // Use Supabase to process the hash fragment
           try {
             const { data: { session } } = await authService.getClient().auth.getSession();
             if (session && mounted) {
               console.log('Hash fragment authentication successful:', session.user.email);
               setSession(session);
               setSessionLoading(false);
               
               // Clean URL by removing hash fragment
               window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
               return true;
             }
           } catch (err) {
             console.error('Error processing hash fragment:', err);
           }
        }
      }
      return false;
    };

    // Check if user came from forgot password flow
    const resetEmail = localStorage.getItem("reset_password_email");
    if (resetEmail) {
      toast.info("Email reset password telah dikirim", {
        description: `Silakan periksa email ${resetEmail} dan klik link untuk melanjutkan reset password.`,
      });
      // Clear the stored email after showing the message
      localStorage.removeItem("reset_password_email");
    }

    // Check if there's already an existing session for password recovery
    const checkExistingSession = async () => {
      try {
        const {
          data: { session },
        } = await authService.getClient().auth.getSession();
        if (session && mounted) {
          console.log('Found existing session:', session.user.email);
          setSession(session);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error checking session:", error);
        return false;
      }
    };

    // Retry logic for session detection (more aggressive for magic link)
    const waitForSession = async () => {
      // First check hash fragment if needed
      if (checkHash && retryCount === 0) {
        const hashAuth = await checkHashAuthentication();
        if (hashAuth) {
          return;
        }
      }
      
      const sessionFound = await checkExistingSession();
      
      if (sessionFound) {
        setSessionLoading(false);
        return;
      }

      if (retryCount < maxRetries && mounted) {
        retryCount++;
        console.log(`Waiting for session... Attempt ${retryCount}/${maxRetries}`);
        
        // Longer wait for magic link flow
        const waitTime = isMagicLink ? 1000 : 500;
        setTimeout(waitForSession, waitTime);
      } else {
        console.log('Session not found after max retries');
        setSessionLoading(false);
        
        // For magic link flow, show error if no session after retries
        if (isMagicLink && !error) {
          toast.error('Sesi tidak ditemukan. Silakan klik ulang magic link atau hubungi admin.');
        }
      }
    };

    waitForSession();

    return () => {
      mounted = false;
    };
  }, [isMagicLink, isNewUser, checkHash, tempVerified, error]);

  // Handle password reset submission
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      toast.error("Session tidak valid. Silakan coba lagi.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password minimal 6 karakter.");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await authService.getClient().auth.updateUser({
        password: password
      });

      if (updateError) {
        toast.error("Gagal mengubah password. Silakan coba lagi.");
      } else {
        toast.success("Password berhasil dibuat!");
        setRedirecting(true);

        // Redirect based on user role
        setTimeout(() => {
          if (session.user?.user_metadata?.role === 'admin') {
            router.push('/admin/dashboard');
          } else {
            router.push('/user/dashboard');
          }
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error("Terjadi kesalahan saat mengubah password.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading screen while redirecting
  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Berhasil! Mengalihkan ke dashboard...
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Mohon tunggu sebentar
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render different states
  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">
                  {isMagicLink ? 'Memproses Magic Link...' : 'Memuat...'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {isMagicLink 
                    ? 'Mohon tunggu, sedang memverifikasi magic link Anda'
                    : 'Mohon tunggu sebentar'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Session Tidak Valid
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {isMagicLink 
                    ? 'Magic link tidak valid atau sudah kedaluwarsa. Silakan hubungi admin untuk mendapatkan magic link baru.'
                    : 'Session untuk reset password tidak ditemukan. Silakan coba lagi dari awal.'
                  }
                </p>
              </div>
              <Button
                onClick={() => {
                  if (isMagicLink) {
                    router.push('/user/auth');
                  } else {
                    router.push('/user/auth/forgot-password');
                  }
                }}
                variant="outline"
                className="w-full"
              >
                {isMagicLink ? 'Kembali ke Login' : 'Coba Lagi'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto">
        <Card className="border-0 shadow-none gap-10">
          <CardHeader className="text-center mt-4">
            <div className="flex items-center justify-center space-x-2 mb-8">
              <Image src="/images/logo.png" alt="Logo" width={18} height={18} />
              <h1 className="text-lg font-semibold">KomplekIn</h1>
            </div>
            <div className="flex items-center justify-center">
              <Image
                src="/images/illustration/reset-password.svg"
                alt="Reset Password"
                width={170}
                height={200}
              />
            </div>
            <CardTitle className="text-xl mt-10">
              Buat Kata Sandi Baru
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {tempVerified 
                ? "Password sementara berhasil diverifikasi. Sekarang buat password baru yang aman untuk akun Anda."
                : "Masukkan kata sandi baru Anda"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {/* Temporary Password Verification Success */}
            {tempVerified && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <h3 className="font-medium text-green-800">Verifikasi Berhasil!</h3>
                </div>
                <p className="text-sm text-green-700">
                  Password sementara Anda telah berhasil diverifikasi. Silakan buat password baru yang aman untuk melanjutkan.
                </p>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4 text-sm font-medium">
              <div className="space-y-2">
                <Label htmlFor="password">Kata Sandi Baru</Label>
                <Input
                  className="text-sm font-normal min-h-10"
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
                  className="text-sm font-normal min-h-10"
                  id="confirmPassword"
                  type="password"
                  placeholder="Konfirmasi kata sandi baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="flex flex-col gap-3 pt-4 text-sm font-medium">
                <Button
                  type="submit"
                  className="w-full bg-foreground text-background hover:bg-foreground/90"
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
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
