"use client";

import { useState, useEffect, Suspense } from "react";
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
import { Lock, Loader2, AlertCircle, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";

 function AuthVerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tempPassword, setTempPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Get params from URL
  const next = searchParams.get('next');
  const isNewUser = searchParams.get('new_user') === 'true';
  const isMagicLink = searchParams.get('magic_link') === 'true';
  const checkHash = searchParams.get('check_hash') === 'true';
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
    const maxRetries = 15;

    console.log('Auth verify page params:', { next, isNewUser, isMagicLink, checkHash, error });

    // Handle hash fragment authentication if needed
    const handleHashAuth = async () => {
      if (checkHash && window.location.hash) {
        console.log('Processing hash fragment authentication...');
        try {
          const supabase = createClient();
          const { error } = await supabase.auth.getSession();
          if (error) {
            console.error('Hash auth error:', error);
            // Try to parse hash manually
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');
            
            if (accessToken) {
              console.log('Setting session from hash tokens...');
              const { error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || ''
              });
              
              if (sessionError) {
                console.error('Session setup error:', sessionError);
              } else {
                console.log('Session set from hash fragment');
                // Clear hash from URL
                window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
              }
            }
          }
        } catch (err) {
          console.error('Hash processing error:', err);
        }
      }
    };

    // Check for existing session
    const checkSession = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session && mounted) {
          console.log('Found session for verification:', session.user.email);
          setSession(session);

          // Get user info from session metadata
          const metadata = session.user.user_metadata;
          const role = metadata?.role || 'user';
          setUserRole(role);

          // Fetch additional user info
          try {
            const { data: permissions } = await supabase
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

            const roleTitle = role === 'admin' ? 'Administrator Cluster' : 'Warga Cluster';

            setUserInfo({
              email: session.user.email || '',
              fullname: metadata?.fullname || '',
              cluster: clusterName || metadata?.cluster_name || '',
              role: role,
              roleTitle: roleTitle
            });
          } catch (err) {
            console.error('Error fetching user permissions:', err);
            // Use fallback from metadata
            setUserInfo({
              email: session.user.email || '',
              fullname: metadata?.fullname || '',
              cluster: metadata?.cluster_name || '',
              role: role,
              roleTitle: role === 'admin' ? 'Administrator Cluster' : 'Warga Cluster'
            });
          }

          setSessionLoading(false);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error checking session:', error);
        return false;
      }
    };

    // Retry logic for session detection
    const waitForSession = async () => {
      // First try to handle hash auth if needed
      if (checkHash) {
        await handleHashAuth();
        // Small delay for session to be set
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const sessionFound = await checkSession();
      
      if (sessionFound) {
        return;
      }

      if (retryCount < maxRetries && mounted) {
        retryCount++;
        console.log(`Waiting for session... Attempt ${retryCount}/${maxRetries}`);
        setTimeout(waitForSession, 1000);
      } else {
        console.log('Session not found after max retries');
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
  }, [next, isNewUser, isMagicLink, checkHash, error]);

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
      const supabase = createClient();
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: userInfo.email,
        password: tempPassword
      });

      if (signInError) {
        console.error('Temporary password verification failed:', signInError);
        toast.error("Password sementara salah. Silakan coba lagi.");
        return;
      }

      if (signInData.user) {
        console.log('Temporary password verified successfully');
        toast.success("Password sementara berhasil diverifikasi!");
        
        setVerifying(true);

        // Redirect based on user role
        setTimeout(() => {
          const redirectUrl = userRole === 'admin' 
            ? '/admin/auth/reset-password?new_user=true&temp_verified=true'
            : '/user/auth/reset-password?new_user=true&temp_verified=true';
          
          router.push(redirectUrl);
        }, 1500);
      }
    } catch (error) {
      console.error('Error verifying temporary password:', error);
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
                  Verifikasi Berhasil!
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Mengalihkan ke halaman buat password baru...
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
                  Memproses Magic Link...
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Mohon tunggu, sedang memverifikasi akun Anda
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
                  Session Tidak Valid
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Magic link tidak valid atau sudah kedaluwarsa. Silakan hubungi admin untuk mendapatkan magic link baru.
                </p>
              </div>
              <Button
                onClick={() => router.push('/user/auth')}
                variant="outline"
                className="w-full"
              >
                Kembali ke Login
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
                src="/images/illustration/verify-otp.svg"
                alt="Verify Password"
                width={170}
                height={200}
              />
            </div>
            <CardTitle className="text-xl mt-10">Verifikasi Password Sementara</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Masukkan password sementara yang diberikan admin
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {/* User Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-2">Informasi Akun Anda:</h3>
              <div className="space-y-1 text-sm text-blue-800">
                <p><strong>Nama:</strong> {userInfo.fullname}</p>
                <p><strong>Email:</strong> {userInfo.email}</p>
                <p><strong>Cluster:</strong> {userInfo.cluster}</p>
                <p><strong>Role:</strong> {userInfo.roleTitle}</p>
              </div>
            </div>

            <form onSubmit={handleVerifyTempPassword} className="space-y-4 text-sm font-medium">
              <div className="space-y-2">
                <Label htmlFor="tempPassword">Password Sementara</Label>
                <Input
                  className="text-sm font-normal min-h-10"
                  id="tempPassword"
                  type="password"
                  placeholder="Masukkan password sementara"
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <p className="text-xs text-gray-500">
                  Password ini diberikan oleh administrator cluster melalui email atau pesan
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
                      Verifikasi Password
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Setelah verifikasi berhasil, Anda akan diminta untuk membuat password baru yang aman.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AuthVerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthVerifyContent />
    </Suspense>
  );
}