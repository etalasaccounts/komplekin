"use client";

import { useState, useEffect } from "react";
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
import Image from "next/image";
import { KeyRound, Command } from "lucide-react";
import { authService } from "@/services/auth";
import { toast } from "sonner";

export default function AdminForgotPasswordPage() {
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
      const { error } = await authService.resetPassword(email, true);

      if (error) {
        toast.error('Gagal mengirim email. Pastikan email admin Anda benar.');
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
              <CardTitle className="text-xl">Lupa Kata Sandi Admin?</CardTitle>
              <CardDescription className="text-sm">
                Masukkan email admin yang terdaftar di sistem
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Admin</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@komplekku.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                <KeyRound className="w-4 h-4" />
                {loading ? "Mengirim..." : "Reset Kata Sandi"}
              </Button>
            </form>

            <div className="text-center">
              <Button 
                variant="link" 
                onClick={() => window.history.back()}
                className="text-sm"
              >
                Kembali ke Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 