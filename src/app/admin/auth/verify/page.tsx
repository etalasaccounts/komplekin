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
import { Lock, Loader2, AlertCircle, Check, Shield } from "lucide-react";
import { authService } from "@/services/auth";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";

export default function AdminVerifyTempPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tempPassword, setTempPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  // Get params from URL
  const next = searchParams.get('next');
  const isNewUser = searchParams.get('new_user') === 'true';
  const isMagicLink = searchParams.get('magic_link') === 'true';
  const error = searchParams.get('error');

  // User info from session
  const [userInfo, setUserInfo] = useState<{
    email: string;
    fullname: string;
    cluster: string;
    role: string;
    roleTitle: string;
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 10;

    console.log('Admin verify temp password page params:', { next, isNewUser, isMagicLink, error });

    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await authService.getClient().auth.getSession();
        if (session && mounted) {
          console.log('Found admin session for temp password verification:', session.user.email);
          setSession(session);

          // Get user info from session metadata
          const metadata = session.user.user_metadata;
          const role = metadata?.role || 'admin';

          // Fetch additional user info
          try {
            const { data: permissions } = await authService.getClient()
              .from('user_permissions')
              .select('role, cluster:clusters(cluster_name)')
              .eq('user_id', session.user.id)
              .single();

            // Handle cluster data - could be object or array depending on join
            let clusterName = '';
            if (permissions?.cluster) {
              if (Array.isArray(permissions.cluster)) {
                clusterName = permissions.cluster[0]?.cluster_name || '';
              } else {
                clusterName = (permissions.cluster as { cluster_name?: string })?.cluster_name || '';
              }
            }

            setUserInfo({
              email: session.user.email || '',
              fullname: metadata?.fullname || '',
              cluster: clusterName || metadata?.cluster_name || '',
              role: role,
              roleTitle: 'Administrator Cluster'
            });
          } catch (err) {
            console.error('Error fetching admin permissions:', err);
            // Use fallback from metadata
            setUserInfo({
              email: session.user.email || '',
              fullname: metadata?.fullname || '',
              cluster: metadata?.cluster_name || '',
              role: role,
              roleTitle: 'Administrator Cluster'
            });
          }

          setSessionLoading(false);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error checking admin session:', error);
        return false;
      }
    };

    // Retry logic for session detection
    const waitForSession = async () => {
      const sessionFound = await checkSession();
      
      if (sessionFound) {
        return;
      }

      if (retryCount < maxRetries && mounted) {
        retryCount++;
        console.log(`Waiting for admin session... Attempt ${retryCount}/${maxRetries}`);
        setTimeout(waitForSession, 800);
      } else {
        console.log('Admin session not found after max retries');
        setSessionLoading(false);
        
        if (!error) {
          toast.error('Sesi tidak ditemukan. Silakan klik ulang magic link.');
        }
      }
    };

    waitForSession();

    return () => {
      mounted = false;
    };
  }, [next, isNewUser, isMagicLink, error]);

  // Handle temporary password verification
  const handleVerifyTempPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session || !userInfo) {
      toast.error("Session tidak valid. Silakan coba lagi.");
      return;
    }

    if (!tempPassword.trim()) {
      toast.error("Password sementara tidak boleh kosong.");
      return;
    }

    setLoading(true);

    try {
      // Verify temporary password by trying to sign in with it
      const { data: signInData, error: signInError } = await authService.getClient().auth.signInWithPassword({
        email: userInfo.email,
        password: tempPassword
      });

      if (signInError) {
        console.error('Admin temporary password verification failed:', signInError);
        toast.error("Password sementara salah. Silakan coba lagi.");
        return;
      }

      if (signInData.user) {
        console.log('Admin temporary password verified successfully');
        toast.success("Password sementara berhasil diverifikasi!");
        
        setVerifying(true);

        // Redirect to admin reset password page after short delay
        setTimeout(() => {
          router.push('/admin/auth/reset-password?new_user=true&temp_verified=true');
        }, 1500);
      }
    } catch (error) {
      console.error('Error verifying admin temporary password:', error);
      toast.error("Terjadi kesalahan saat memverifikasi password.");
    } finally {
      setLoading(false);
    }
  };

  // Show verifying screen
  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Verifikasi Admin Berhasil!
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Mengalihkan ke halaman buat password admin baru...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading screen while checking session
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
                  Memproses Magic Link Admin...
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Mohon tunggu, sedang memverifikasi akun admin Anda
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error if no session
  if (!session || !userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Session Admin Tidak Valid
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Magic link admin tidak valid atau sudah kedaluwarsa. Silakan hubungi administrator sistem.
                </p>
              </div>
              <Button
                onClick={() => router.push('/admin/auth')}
                variant="outline"
                className="w-full"
              >
                Kembali ke Login Admin
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
              <h1 className="text-lg font-semibold">KomplekIn Admin</h1>
            </div>
            <div className="flex items-center justify-center">
              <Image
                src="/images/illustration/verify-otp.svg"
                alt="Verify Admin Password"
                width={170}
                height={200}
              />
            </div>
            <CardTitle className="text-xl mt-10">Verifikasi Password Admin</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Masukkan password sementara administrator yang diberikan
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {/* Admin Info Card */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-amber-600" />
                <h3 className="font-medium text-amber-900">Akun Administrator:</h3>
              </div>
              <div className="space-y-1 text-sm text-amber-800">
                <p><strong>Nama:</strong> {userInfo.fullname}</p>
                <p><strong>Email:</strong> {userInfo.email}</p>
                <p><strong>Cluster:</strong> {userInfo.cluster}</p>
                <p><strong>Role:</strong> {userInfo.roleTitle}</p>
              </div>
            </div>

            <form onSubmit={handleVerifyTempPassword} className="space-y-4 text-sm font-medium">
              <div className="space-y-2">
                <Label htmlFor="tempPassword">Password Sementara Administrator</Label>
                <Input
                  className="text-sm font-normal min-h-10"
                  id="tempPassword"
                  type="password"
                  placeholder="Masukkan password sementara admin"
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <p className="text-xs text-gray-500">
                  Password ini diberikan oleh administrator sistem melalui email atau pesan aman
                </p>
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
                      Memverifikasi...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Verifikasi Password Admin
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Setelah verifikasi berhasil, Anda akan diminta untuk membuat password admin baru yang aman.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}