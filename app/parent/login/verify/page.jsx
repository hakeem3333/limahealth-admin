"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, PartyPopper } from "lucide-react";
import { api } from "@/lib/axios";
import { ORG_THEMES } from "@/lib/orgTheme";
import OtpVerifyScreen, { maskEmail } from "@/components/otp/OtpVerifyScreen";

const THEME = ORG_THEMES.SCHOOL;

function VerifyParentOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [signedInAs, setSignedInAs] = useState(null);

  const handleSubmit = async (otp) => {
    const res = await api.post("/auth/parent/login/verify", { otp });
    // Give the success state a beat to show before swapping to the welcome card.
    await new Promise((resolve) => setTimeout(resolve, 700));
    setSignedInAs(res.data?.user || null);
  };

  const handleResend = async () => {
    if (!email) {
      router.replace("/parent/login");
      return;
    }
    await api.post("/auth/parent/login", { email });
  };

  // Parent portal pages don't exist yet — this confirms the sign-in worked
  // rather than redirecting into a dashboard that hasn't been built.
  if (signedInAs) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-[2.5rem] bg-white p-10 shadow-2xl shadow-blue-900/5 border border-gray-100 text-center animate-in zoom-in-95 duration-500">
          <div className="mx-auto h-14 w-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <PartyPopper className="h-7 w-7 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Welcome, {signedInAs.firstName}
          </h1>
          <p className="mt-3 text-sm text-gray-500 font-medium leading-relaxed">
            You're signed in as <span className="font-bold text-gray-700">{signedInAs.email}</span>.
          </p>
        </div>
      </main>
    );
  }

  return (
    <OtpVerifyScreen
      theme={THEME}
      sessionKey="parent-login"
      pageBackground={`radial-gradient(circle at 12% -8%, ${THEME.primary}26, transparent 55%), radial-gradient(circle at 108% 112%, ${THEME.primary}1A, transparent 55%), #F5F7FA`}
      icon={KeyRound}
      title="Enter your code"
      description={
        email
          ? "We emailed a 6-digit sign-in code to the address below."
          : "Enter the 6-digit code we emailed you."
      }
      destination={maskEmail(email)}
      totalSeconds={600}
      submitLabel="Verify & sign in"
      onSubmit={handleSubmit}
      resend={{ cooldown: 30, onResend: handleResend }}
      back={{ label: "Back to sign in", onClick: () => router.replace("/parent/login") }}
    />
  );
}

export default function VerifyParentOtpPage() {
  return (
    <Suspense fallback={null}>
      <VerifyParentOtpForm />
    </Suspense>
  );
}
