"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { KeyRound } from "lucide-react";
import { authService } from "@/services/auth";
import { toast } from "sonner";

function UserForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for error from callback
    const errorParam = searchParams.get('error');
    if (errorParam) {
      switch (errorParam) {
        case 'exchange_failed':
          toast.error('Gagal memproses link reset password. Silakan coba lagi.');
          break;
        case 'exchange_error':
          toast.error('Terjadi kesalahan saat memproses reset password.');
          break;
        case 'no_code':
          toast.error('Link reset password tidak valid.');
          break;
        default:
          toast.error('Terjadi kesalahan yang tidak diketahui.');
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await authService.resetPassword(email, false);

      if (error) {
        toast.error('Gagal mengirim email. Pastikan email Anda benar.');
      } else {
        toast.success('Email untuk reset kata sandi telah dikirim. Silakan periksa kotak masuk Anda.');
        setEmail(""); // Clear form on success
      }
    } catch {
      toast.error('Terjadi kesalahan yang tidak terduga.');
    } finally {
      setLoading(false);
    }
  };

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
                alt="Logo"
                width={170}
                height={200}
              />
            </div>
            <CardTitle className="text-xl mt-10">Lupa Kata Sandi? </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Masukkan Email yang terdaftar di KomplekIn
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <form
              onSubmit={handleSubmit}
              className="space-y-4 text-sm font-medium"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  className="text-sm font-normal min-h-10"
                  id="email"
                  type="email"
                  placeholder="mathew@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  <KeyRound className="w-4 h-4" />
                  {loading ? "Mengirim..." : "Reset Kata Sandi"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Memuat...</h3>
              <p className="text-sm text-muted-foreground">Menyiapkan halaman...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <UserForgotPasswordForm />
    </Suspense>
  );
}
