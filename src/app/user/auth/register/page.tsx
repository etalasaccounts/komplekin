"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { PersonalInfoStep } from "@/app/user/auth/components/PersonalInfoStep";
import { DocumentStep } from "@/app/user/auth/components/DocumentStep";
import { FormData } from "@/app/user/auth/components/PersonalInfoStep";

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
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
    typeOfHouse: "",
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

  const updateFormData = (newData: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
    // Navigate to dashboard after successful registration
    router.push("/user/auth/waiting-approval");
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
