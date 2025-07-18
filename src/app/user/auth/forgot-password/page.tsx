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
import Image from "next/image";
import { KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Implement actual login logic
    console.log("Login attempt:", { email });

    // Simulate login process
    setTimeout(() => {
      setLoading(false);
      // Navigate to dashboard after successful login
      router.push("/user/dashboard");
    }, 1000);
  };

  // const handleBack = () => {
  //   router.push("/user");
  // };

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
                  {loading ? "Memproses..." : "Reset Kata Sandi"}
                </Button>

                {/* <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleBack}
                >
                  Kembali
                </Button> */}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
