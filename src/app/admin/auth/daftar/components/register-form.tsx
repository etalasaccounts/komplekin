"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Command, Loader2, User, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface PersonalInfo {
  email: string;
  namapengguna: string;
  kataSandi: string;
}

interface ClusterInfo {
  namaCluster: string;
  jumlahRumah: string;
  alamat: string;
}

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    email: "",
    namapengguna: "",
    kataSandi: ""
  });

  const [clusterInfo, setClusterInfo] = useState<ClusterInfo>({
    namaCluster: "",
    jumlahRumah: "",
    alamat: ""
  });

  const handlePersonalInfoChange = (field: keyof PersonalInfo, value: string) => {
    setPersonalInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClusterInfoChange = (field: keyof ClusterInfo, value: string) => {
    setClusterInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep1 = () => {
    const { email, namapengguna, kataSandi } = personalInfo;
    if (!email.trim() || !email.includes("@")) {
      toast.error("Email valid harus diisi");
      return false;
    }
    if (!namapengguna.trim()) {
      toast.error("Nama pengguna harus diisi");
      return false;
    }
    if (!kataSandi.trim() || kataSandi.length < 6) {
      toast.error("Kata sandi minimal 6 karakter");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const { namaCluster, jumlahRumah, alamat } = clusterInfo;
    if (!namaCluster.trim()) {
      toast.error("Nama cluster harus diisi");
      return false;
    }
    if (!jumlahRumah.trim() || isNaN(Number(jumlahRumah))) {
      toast.error("Jumlah rumah harus berupa angka valid");
      return false;
    }
    if (!alamat.trim()) {
      toast.error("Alamat harus diisi");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) {
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      // Step 1: Sign up dengan Supabase Auth
      console.log("Step 1: Creating user account...");
      console.log("Registration data:", {
        email: personalInfo.email,
        fullname: personalInfo.namapengguna,
        clusterName: clusterInfo.namaCluster,
        jumlahRumah: clusterInfo.jumlahRumah,
        alamat: clusterInfo.alamat
      });
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: personalInfo.email,
        password: personalInfo.kataSandi,
        options: {
          data: {
            fullname: personalInfo.namapengguna,
            role: 'admin'
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=admin`
        }
      });

      if (authError) {
        console.error("Auth signup error:", authError);
        toast.error(`Gagal membuat akun: ${authError.message}`);
        return;
      }

      if (!authData.user) {
        toast.error("Gagal membuat akun. Silakan coba lagi.");
        return;
      }

      const userId = authData.user.id;
      console.log("User created with ID:", userId);

      // Step 2: Buat cluster terlebih dahulu
      console.log("Step 2: Creating cluster...");
      const { data: clusterData, error: clusterError } = await supabase
        .from('clusters')
        .insert({
          cluster_name: clusterInfo.namaCluster,
          payment_method: 'manual' // hanya field yang essential
        })
        .select()
        .single();

      if (clusterError) {
        console.error("Cluster creation error:", clusterError);
        toast.error(`Gagal membuat cluster: ${clusterError.message}`);
        return;
      }

      const clusterId = clusterData.id;
      console.log("Cluster created with ID:", clusterId);

      // Step 3: Insert ke tabel profiles
      console.log("Step 3: Creating profile...");
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          email: personalInfo.email,
          fullname: personalInfo.namapengguna,
          address: clusterInfo.alamat,
          house_type: 'cluster', // default untuk admin cluster
          ownership_status: 'Milik Sendiri', // default untuk admin
          citizen_status: 'Warga baru' // nilai enum yang valid
        })
        .select()
        .single();

      if (profileError) {
        console.error("Profile creation error:", profileError);
        
        // Rollback: hapus cluster yang sudah dibuat
        await supabase.from('clusters').delete().eq('id', clusterId);
        
        toast.error(`Gagal membuat profil: ${profileError.message}`);
        return;
      }

      const profileId = profileData.id;
      console.log("Profile created with ID:", profileId);

      // Step 4: Insert ke tabel user_permissions
      console.log("Step 4: Creating user permissions...");
      const { data: permissionData, error: permissionError } = await supabase
        .from('user_permissions')
        .insert({
          user_id: userId,
          profile_id: profileId,
          cluster_id: clusterId,
          role: 'admin',
          user_status: 'Active'
        })
        .select()
        .single();

      if (permissionError) {
        console.error("Permission creation error:", permissionError);
        
        // Rollback: hapus cluster dan profile yang sudah dibuat
        await supabase.from('clusters').delete().eq('id', clusterId);
        await supabase.from('profiles').delete().eq('id', profileId);
        
        toast.error(`Gagal membuat permission: ${permissionError.message}`);
        return;
      }

      console.log("Permission created:", permissionData);


      // Step 5: generate token
      const responseToken = await fetch('/api/admin/generate-email-verification-token', {
        method: 'POST',
        body: JSON.stringify({ userPermissionId: permissionData.id })
      });

      if (!responseToken.ok) {
        const errorData = await responseToken.json();
        console.error("Token generation error:", errorData);
        toast.error(`Gagal membuat token: ${errorData.message}`);

        // Rollback: hapus cluster dan profile yang sudah dibuat
        await supabase.from('clusters').delete().eq('id', clusterId);
        await supabase.from('profiles').delete().eq('id', profileId);
        await supabase.from('user_permissions').delete().eq('id', permissionData.id);
        await supabase.auth.signOut();
        return;
      }

      const { data: tokenData } = await responseToken.json();
      const confirmationUrl = tokenData.confirmationUrl;

      // Step 5: Kirim email konfirmasi
      console.log("Step 5: Sending confirmation email...");
      const response = await fetch('/api/send-email/confirmation', {
        method: 'POST',
        body: JSON.stringify({ userName: personalInfo.namapengguna, email: personalInfo.email, confirmationUrl: confirmationUrl })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Email sending error:", errorData);
        toast.error(`Gagal mengirim email: ${errorData.message}`);

        // Rollback: hapus cluster dan profile yang sudah dibuat
        await supabase.from('clusters').delete().eq('id', clusterId);
        await supabase.from('profiles').delete().eq('id', profileId);
        await supabase.from('user_permissions').delete().eq('id', permissionData.id);
        await supabase.auth.signOut();
        return;
      }

      await supabase.auth.signOut();
      // Success! 
      toast.success("Pendaftaran admin berhasil! Silakan cek email Anda dan klik link konfirmasi untuk langsung ke dashboard admin.", {
        duration: Infinity, // Make toast persistent
        action: {
          label: "Go to Mail",
          onClick: () => {
            window.open("https://mail.google.com", "_blank");
          }
        }
      });
      
      // Redirect ke login page
      setTimeout(() => {
        router.push("/admin/auth?message=registration_success");
      }, 3000);
      
    } catch (error) {
      console.error("Unexpected registration error:", error);
      toast.error("Terjadi kesalahan tidak terduga. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="p-6 md:p-8 flex flex-col justify-center">
      <div className="flex flex-col gap-6 w-full">
        <div className="flex flex-col items-center text-center gap-2">
          <h1 className="text-2xl font-bold">Selamat Datang</h1>
          <p className="text-muted-foreground text-balance text-sm">
            Masukkan nama pengguna Anda di bawah ini untuk membuat akun baru
          </p>
        </div>
        
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Mathew Alexander"
            value={personalInfo.email}
            onChange={(e) => handlePersonalInfoChange("email", e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="namapengguna">Nama Pengguna</Label>
          <Input
            id="namapengguna"
            type="text"
            placeholder="Mathew Alexander"
            value={personalInfo.namapengguna}
            onChange={(e) => handlePersonalInfoChange("namapengguna", e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="kataSandi">Kata Sandi</Label>
          <div className="relative">
            <Input
              id="kataSandi"
              type={showPassword ? "text" : "password"}
              placeholder="Placeholder"
              value={personalInfo.kataSandi}
              onChange={(e) => handlePersonalInfoChange("kataSandi", e.target.value)}
              required
              disabled={loading}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <Button 
          type="button" 
          onClick={handleNext}
          className="w-full flex justify-center items-center gap-2" 
          disabled={loading}
        >
          <User className="w-4 h-4" />
          <p className="text-sm font-semibold">Daftar</p>
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Sudah memiliki akun?{" "}
            <Link
              href="/admin/auth"
              className="text-primary underline-offset-2 hover:underline font-medium"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col justify-center">
      <div className="flex flex-col gap-6 w-full">
        <div className="flex flex-col items-center text-center gap-2">
          <h1 className="text-2xl font-bold">Mari Buat Cluster Pertamamu</h1>
          <p className="text-muted-foreground text-balance text-sm">
            Cluster membantu Anda mengelompokkan rumah warga agar pengelolaan jadi lebih mudah dan rapi.
          </p>
        </div>
        
        <div className="grid gap-3">
          <Label htmlFor="namaCluster">Nama Cluster</Label>
          <Input
            id="namaCluster"
            type="text"
            placeholder="Tanjung Mas"
            value={clusterInfo.namaCluster}
            onChange={(e) => handleClusterInfoChange("namaCluster", e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="jumlahRumah">Jumlah Rumah</Label>
          <Input
            id="jumlahRumah"
            type="number"
            placeholder="42"
            value={clusterInfo.jumlahRumah}
            onChange={(e) => handleClusterInfoChange("jumlahRumah", e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="alamat">Alamat</Label>
          <Textarea
            id="alamat"
            placeholder="Jl. Garuda MAS IV No.2, RT.11/RW.6, Tj. Bar., Kec. Jagakarsa, Selatan, Daerah Khusus Ibukota Jakarta 12530"
            value={clusterInfo.alamat}
            onChange={(e) => handleClusterInfoChange("alamat", e.target.value)}
            required
            disabled={loading}
            className="min-h-20 resize-none"
          />
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            type="submit" 
            className="w-full flex justify-center items-center gap-2" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <p className="text-sm font-semibold">Membuat...</p>
              </>
            ) : (
              <>
                <span className="text-lg font-bold">+</span>
                <p className="text-sm font-semibold">Buat Cluster</p>
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );

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
                  &quot;KomplekIn adalah aplikasi digital untuk memudahkan warga dalam membayar iuran, mengikuti kegiatan, dan mengakses informasi seputar lingkungan tempat tinggal mereka — semua dalam satu platform.&quot;
                </p>
              </div>
            </div>
          </div>

          {currentStep === 1 ? renderStep1() : renderStep2()}
        </CardContent>
      </Card>
    </div>
  );
}