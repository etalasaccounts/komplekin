"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { PersonalInfoStep } from "@/app/user/auth/components/PersonalInfoStep";
import { DocumentStep } from "@/app/user/auth/components/DocumentStep";
import type { FormData as RegistrationFormData } from "@/app/user/auth/components/PersonalInfoStep";
import { authService } from "@/services/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<RegistrationFormData>({
    email: "",
    fullname: "",
    no_telp: "",
    address: "",
    house_type: "",
    house_number: "",
    ownership_status: "",
    file_ktp: null,
    file_kk: null,
    emergency_telp: "",
    head_of_family: "",
    work: "",
    moving_date: "",
    citizen_status: "Warga baru",
  });

  const steps = [
    { title: "Personal Info", component: PersonalInfoStep },
    { title: "Document", component: DocumentStep },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      // If on first step, go back to welcome page
      router.push("/user");
    }
  };

  const updateFormData = (newData: Partial<RegistrationFormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    // Validate required fields
    if (
      !formData.email ||
      !formData.fullname ||
      !formData.no_telp ||
      !formData.address ||
      !formData.house_type ||
      !formData.house_number ||
      !formData.ownership_status 
    ) {
      alert("Semua field wajib diisi");
      return;
    }

    if (!formData.file_ktp || !formData.file_kk) {
      alert("Foto KTP dan Kartu Keluarga wajib diupload");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await authService.registerUser({
        email: formData.email,
        fullname: formData.fullname,
        no_telp: formData.no_telp,
        address: formData.address,
        house_type: formData.house_type,
        house_number: formData.house_number,
        ownership_status: formData.ownership_status,
        file_ktp: formData.file_ktp,
        file_kk: formData.file_kk,
        emergency_telp: formData.emergency_telp,
        head_of_family: formData.head_of_family,
        work: formData.work,
        moving_date: formData.moving_date,
        citizen_status: formData.citizen_status,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      console.log("Registration successful:", result.data);
      // Navigate to waiting approval page after successful registration
      router.push("/user/auth/waiting-approval");
    } catch (error) {
      console.error("Registration error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mendaftar"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="fixed inset-0 bg-background overflow-y-auto">
      <div className="max-w-md mx-auto py-4 min-h-full pb-22">
        <Card className="border-0 shadow-none">
          <CardContent className="p-4">
            <CurrentStepComponent
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
              onSubmit={handleSubmit}
              isFirst={currentStep === 0}
              isLast={currentStep === steps.length - 1}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
