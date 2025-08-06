"use client";

import { useState } from "react";
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
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Silakan isi semua field yang diperlukan.");
      return;
    }

    const result = await signIn(email, password);
    
    if (result.success) {
      toast.success("Login berhasil! Mengalihkan ke dashboard...");
      setTimeout(() => {
        router.push(result.redirectPath!);
      }, 1000);
    } else {
      toast.error(result.error || 'Login gagal. Periksa email dan password Anda.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto">
        <Card className="border-0 shadow-none gap-4">
          <CardHeader className="text-center mt-4">
            <div className="flex items-center justify-center space-x-2 mb-8">
              <Image src="/images/logo.png" alt="Logo" width={18} height={18} />
              <h1 className="text-lg font-semibold">KomplekIn</h1>
            </div>
            <div className="flex items-center justify-center">
              <Image
                src="/images/illustration/login.svg"
                alt="Logo"
                width={170}
                height={200}
              />
            </div>
            <CardTitle className="text-xl mt-10">
              Selamat datang kembali!{" "}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Masuk untuk mengakses layanan dan informasi komplek Anda.
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
                  placeholder="Masukkan email Anda"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="pb-1">
                  Password
                </Label>
                <Input
                  className="text-sm font-normal min-h-10"
                  id="password"
                  type="password"
                  placeholder="Masukkan password Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <div className="flex justify-end">
                  <Link href="/user/auth/forgot-password">
                    <p className="text-xs text-black">Lupa password?</p>
                  </Link>
                </div>
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
                      Memproses...
                    </>
                  ) : (
                    "Masuk"
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
