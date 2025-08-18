import { Suspense } from "react";
import { Metadata } from "next";
import { AuthVerify } from "@/app/auth/components/verify";

export const metadata: Metadata = {
  title: "Verify Email - KomplekIn",
  description: "Verify your email to activate your account",
};

export default function VerifyEmail() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthVerify />
    </Suspense>
  );
}