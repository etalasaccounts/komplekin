"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { House, FileText } from "lucide-react";

export default function VerificationPage() {
  const router = useRouter();
  const params = useParams();
  const type = params.type as string;

  const success = {
    title: "Pendaftaran Disetujui",
    description:
      "Akun Anda telah diverifikasi oleh admin. Selamat datang dan silakan lanjut ke dashboard.",
    image: "/images/illustration/verification-success.svg",
  };

  const failed = {
    title: "Pendaftaran Anda Belum Disetujui",
    description:
      "Dokumen identitas tidak valid atau sulit dibaca. Silakan unggah ulang dokumen yang sesuai untuk melanjutkan proses verifikasi",
    image: "/images/illustration/verification-failed.svg",
  };

  // Handle case where type is not success or failed
  if (type !== "success" && type !== "failed") {
    router.push("/user/auth");
    return null;
  }

  const content = type === "success" ? success : failed;

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
                src={content.image}
                alt="Verification illustration"
                width={170}
                height={200}
              />
            </div>
            <CardTitle className="text-xl mt-10">{content.title}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {content.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-30 p-4">
            {type === "success" && (
              <Button
                type="submit"
                className="w-full bg-foreground text-background hover:bg-foreground/90"
                onClick={() => router.push("/user/dashboard")}
              >
                <House className="w-4 h-4" />
                Dashboard
              </Button>
            )}
            {type === "failed" && (
              <Button
                type="submit"
                className="w-full bg-foreground text-background hover:bg-foreground/90"
                onClick={() => router.push("/user/auth/register")}
              >
                <FileText className="w-4 h-4" />
                Input Data Ulang
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
