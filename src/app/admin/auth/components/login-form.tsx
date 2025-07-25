"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Command, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, loading } = useAuth();
  const router = useRouter();

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
      toast.error(result.error || "Login gagal. Periksa email dan password Anda.");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="relative hidden md:block bg-[url('/images/container.png')] bg-cover bg-center">
            {/* GRADIENT OVERLAY */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* KONTEN (Logo, Dashboard, Quote) */}
            <div className="relative z-10 text-white flex flex-col justify-between w-full h-full p-10 gap-10">
              <div className="flex items-center gap-2">
                <Command className="w-6 h-6" />
                <p className="text-xl font-semibold">KomplekIn</p>
              </div>
              <div className="flex justify-center">
                <Image
                  src="/images/dashboard-image.png"
                  alt="KomplekIn"
                  width={400}
                  height={250}
                  className="w-auto h-auto object-contain"
                />
              </div>
              <div>
                <p className="text-sm text-white/90">
                  “KomplekIn adalah aplikasi digital untuk memudahkan warga dalam membayar iuran, mengikuti kegiatan, dan mengakses informasi seputar lingkungan tempat tinggal mereka — semua dalam satu platform.”
                </p>
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col justify-center">
            <div className="flex flex-col gap-6 w-full">
              <div className="flex flex-col items-center text-center gap-2">
                <h1 className="text-2xl font-bold">Selamat Datang</h1>
                <p className="text-muted-foreground text-balance text-sm">
                  Masukkan email dan password Anda di bawah ini untuk masuk akun Anda
                </p>
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Masukan email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Kata Sandi</Label>
                  <Link
                    href="/admin/auth/forgot-password"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Lupa kata sandi?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukan kata sandi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full flex justify-center items-center gap-2" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <p className="text-sm font-semibold">Masuk...</p>
                  </>
                ) : (
                  <>
                <p className="text-sm font-semibold">Masuk</p>
                <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
