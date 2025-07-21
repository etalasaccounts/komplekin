"use client";

import { useRouter } from "next/navigation";
import { WelcomeStep } from "@/app/user/auth/components/WelcomeStep";

const Index = () => {
  const router = useRouter();

  const handleRegister = () => {
    router.push("/user/auth/register");
  };

  const handleLogin = () => {
    router.push("/user/auth");
  };

  return (
    <div className="bg-background py-4">
      <div className="max-w-md mx-auto">
        <div className="p-4">
          <WelcomeStep onRegister={handleRegister} onLogin={handleLogin} />
        </div>
      </div>
    </div>
  );
};

export default Index;
