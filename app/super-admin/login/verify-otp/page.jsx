"use client";

import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { api } from "@/lib/axios";
import OtpVerifyScreen from "@/components/otp/OtpVerifyScreen";

const SUPER_ADMIN_THEME = {
  primary: "#1F6F6B",
  primaryLight: "#E3F0EE",
  primaryRing: "#9CCFC9",
  primaryText: "#123B39",
};

export default function SuperAdminVerifyOtpPage() {
  const router = useRouter();

  const handleSubmit = async (otp) => {
    await api.post("/super-admin/verify-otp", { otp });
    router.push("/super-admin/dashboard");
  };

  return (
    <OtpVerifyScreen
      theme={SUPER_ADMIN_THEME}
      sessionKey="super-admin-login"
      pageBackground="radial-gradient(circle at 15% 12%, rgba(31,111,107,0.55), transparent 42%), radial-gradient(circle at 88% 92%, rgba(217,140,74,0.22), transparent 42%), #123B39"
      icon={ShieldCheck}
      title="Security verification"
      description="Enter the 6-digit access code sent to the Super Admin email."
      totalSeconds={300}
      submitLabel="Verify & continue"
      onSubmit={handleSubmit}
      resend={{ cooldown: 30, onResend: () => api.post("/super-admin/resend-otp") }}
      onExpiredAction={{ label: "Sign in again", onClick: () => router.replace("/super-admin/login") }}
      back={{ label: "Cancel and return", onClick: () => router.replace("/super-admin/login") }}
    />
  );
}
