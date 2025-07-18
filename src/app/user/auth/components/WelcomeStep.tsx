import { Button } from "@/components/ui/button";
import Image from "next/image";
import { User, LogIn } from "lucide-react";
interface WelcomeStepProps {
  onRegister: () => void;
  onLogin?: () => void; // Optional prop for login action
}

export function WelcomeStep({ onRegister, onLogin }: WelcomeStepProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 gap-y-8 ">
      {/* Company Logo */}
      <div>
        <div className="flex items-center justify-center space-x-2">
          <Image src="/images/logo.png" alt="Logo" width={18} height={18} />
          <h1 className="text-lg font-semibold">KomplekIn</h1>
        </div>
      </div>

      {/* Welcome Illustration */}
      <div className="">
        <Image
          src="/images/illustration/welcome.svg"
          alt="Welcome Illustration"
          width={170}
          height={200}
        />
      </div>

      {/* Welcome Text */}
      <div className="space-y-3 text-center">
        <h2 className="text-2xl font-semibold text-foreground">
          Selamat datang di KomplekIn!
        </h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
          Daftar dan nikmati kemudahan bayar iuran, cek kegiatan, dan terhubung
          dengan warga lainnya— semuanya dalam satu aplikasi.
        </p>
        <div className="w-full pt-25 flex flex-col gap-4">
          <Button
            onClick={onRegister}
            className="w-full bg-foreground text-background hover:bg-foreground/90 text-sm font-medium"
            size="lg"
          >
            <User className="w-4 h-4" />
            Buat Akun
          </Button>
          <Button
            onClick={onLogin}
            className="w-full bg-[#F4F4F5] text-black hover:bg-[#E4E4E7] text-sm font-medium"
            size="lg"
          >
            <LogIn className="w-4 h-4" />
            Masuk Akun
          </Button>
        </div>
      </div>
    </div>
  );
}
