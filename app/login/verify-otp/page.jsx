"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { api } from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { ORG_THEMES, DEFAULT_THEME } from "@/lib/orgTheme";
import OtpVerifyScreen, { maskEmail } from "@/components/otp/OtpVerifyScreen";

export default function VerifyOtpPage() {
  const router = useRouter();
  const { startSession } = useAuth();
  const [ctx, setCtx] = useState(null);

  // The login page leaves the org type + email here so this screen can match
  // the org's colour and show where the code went. Purely cosmetic.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("lh_otp_ctx");
      if (raw) setCtx(JSON.parse(raw));
    } catch {}
  }, []);

  const theme = ORG_THEMES[ctx?.orgType] ?? DEFAULT_THEME;

  const handleSubmit = async (otp) => {
    await api.post("/auth/admin/verify-otp", { otp });
    await startSession();
    try {
      sessionStorage.removeItem("lh_otp_ctx");
    } catch {}
    router.push("/org-admin/dashboard");
  };

  return (
    <OtpVerifyScreen
      theme={theme}
      sessionKey="admin-login"
      pageBackground={`radial-gradient(circle at 12% -8%, ${theme.primary}26, transparent 55%), radial-gradient(circle at 108% 112%, ${theme.primary}1A, transparent 55%), #F5F7FA`}
      icon={ShieldCheck}
      title="Security verification"
      description="Enter the 6-digit code we emailed you to finish signing in."
      destination={maskEmail(ctx?.email)}
      totalSeconds={600}
      submitLabel="Authorize access"
      onSubmit={handleSubmit}
      resend={{ cooldown: 30, onResend: () => api.post("/auth/admin/resend-otp") }}
      onExpiredAction={{ label: "Sign in again", onClick: () => router.replace("/login") }}
      back={{ label: "Back to sign in", onClick: () => router.replace("/login") }}
    />
  );
}
