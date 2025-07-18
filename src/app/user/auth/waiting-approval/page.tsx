"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { User } from "lucide-react";

export default function WaitingApprovalPage() {
  const router = useRouter();

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
                src="/images/illustration/waiting-approval.svg"
                alt="Logo"
                width={170}
                height={200}
              />
            </div>
            <CardTitle className="text-xl mt-10">
              Menunggu Verifikasi Admin
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Permintaan pendaftaran Anda sedang ditinjau. Anda akan diberi
              akses setelah disetujui oleh admin.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-30 p-4">
            <div className="flex flex-col gap-3 pt-4 text-sm font-medium">
              <Button
                type="submit"
                className="w-full bg-foreground text-background hover:bg-foreground/90"
                onClick={() => router.push("/user")}
              >
                <User className="w-4 h-4" />
                Onboarding
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
