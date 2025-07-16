"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { WelcomeStep } from "./WelcomeStep";
import { PersonalInfoStep } from "./PersonalInfoStep";
import { DocumentStep } from "./DocumentStep";

export interface FormData {
  // Step 1 fields
  fullName: string;
  phoneNumber: string;
  email: string;
  address: string;
  ownershipStatus: string;

  // Step 2 fields
  idCardPhoto: File | null;
  familyCardPhoto: File | null;
  emergencyPhone: string;
  headOfFamily: string;
  occupation: string;
  moveInDate: Date | undefined;
}

export function MultiStepForm() {
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
  });

  const steps = [
    { title: "Onboard", component: WelcomeStep },
    { title: "Daftar", component: PersonalInfoStep },
    { title: "Upload Dokumen", component: DocumentStep },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (newData: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
    // Navigate to dashboard after successful registration
    router.push("/user/dashboard");
  };

  const CurrentStepComponent = steps[currentStep].component;
  // const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="bg-background">
      <div className="max-w-md mx-auto">
        {/* Single step layout */}
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
