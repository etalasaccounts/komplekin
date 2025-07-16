"use client";

import { useRouter } from "next/navigation";
import { WelcomeStep } from "@/app/user/auth/components/WelcomeStep";
import { FormData } from "@/app/user/auth/components/MultiStepForm";

const Index = () => {
  const router = useRouter();

  // Empty form data since we're only showing the welcome step
  const formData: FormData = {
    fullName: "",
    phoneNumber: "",
    email: "",
    address: "",
    ownershipStatus: "",
    idCardPhoto: null,
    familyCardPhoto: null,
    emergencyPhone: "",
    headOfFamily: "",
    occupation: "",
    moveInDate: undefined,
  };

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
          <WelcomeStep
            formData={formData}
            updateFormData={() => {}} // Not used in welcome step
            onNext={handleRegister} // "Daftar Jadi Warga" button
            onBack={() => {}} // Not used in welcome step
            onSubmit={() => {}} // Not used in welcome step
            isFirst={true}
            isLast={false}
            onLogin={handleLogin} // Custom prop for login
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
