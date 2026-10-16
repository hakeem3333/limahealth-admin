"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import Link from "next/link";
import {
  Loader2,
  Mail,
  ArrowLeft,
  GraduationCap,
  Briefcase,
  Heart,
  Globe,
} from "lucide-react";
import { ORG_THEMES, DEFAULT_THEME } from "@/lib/orgTheme";

// Same org-type theming as the login pages — the lookup endpoint resolves
// the real account behind the typed email, so this page themes itself to
// match that organisation once it's found. Purely cosmetic.
const ORG_ICONS = { SCHOOL: GraduationCap, COMPANY: Briefcase, HOSPITAL: Heart, NGO: Globe };

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [orgType, setOrgType] = useState(null);
  const theme = orgType ? ORG_THEMES[orgType] : DEFAULT_THEME;
  const OrgIcon = orgType ? ORG_ICONS[orgType] : Mail;

  // Debounced lookup so the page themes itself to the real account's
  // organisation once the typed email resolves.
  useEffect(() => {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setOrgType(null);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await api.get("/auth/admin/org-type", { params: { email: trimmed } });
        setOrgType(res.data?.orgType || null);
      } catch {
        setOrgType(null);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      // Note: Backend should return 200 even if email isn't found
      // for security (prevents user enumeration)
      await api.post("/auth/forgot-password", { email });
      setMessage(
        "If this email exists in our system, a reset link has been sent.",
      );
    } catch (err) {
      setError(
        err?.response?.data?.message || "Something went wrong. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden transition-colors duration-700"
      style={{ backgroundColor: "#F5F7FA" }}
    >
      {/* Background decoration — org-tinted blurred blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute rounded-full transition-all duration-700"
          style={{
            width: 520, height: 520,
            background: `radial-gradient(circle, ${theme.primary}22 0%, transparent 70%)`,
            top: -180, right: -140,
          }}
        />
        <div
          className="absolute rounded-full transition-all duration-700"
          style={{
            width: 380, height: 380,
            background: `radial-gradient(circle, ${theme.primary}14 0%, transparent 70%)`,
            bottom: -120, left: -100,
          }}
        />
      </div>

      <div className="w-full max-w-md relative bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-blue-900/5 border border-gray-100">
        <div className="text-center mb-8">
          <div
            className="mx-auto h-14 w-14 rounded-2xl flex items-center justify-center mb-4 shadow-sm transition-colors duration-500"
            style={{ backgroundColor: theme.primaryLight }}
          >
            <OrgIcon className="h-7 w-7 transition-colors duration-500" style={{ color: theme.primary }} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Forgot Password
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your {orgType ? theme.orgLabel.toLowerCase() : "organisation"} admin
            email and we'll send you a link to reset your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          {message && (
            <div
              className="text-sm px-4 py-3 rounded-xl border"
              style={{ color: theme.primaryText, backgroundColor: theme.primaryLight, borderColor: theme.primaryRing }}
            >
              {message}
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="admin@yourorganisation.com"
            value={email}
            onChange={setEmail}
            theme={theme}
            required
          />

          <button
            type="submit"
            disabled={loading || !!message}
            className="w-full text-white py-4 rounded-xl font-bold shadow-lg disabled:opacity-50 transition-all flex justify-center items-center"
            style={{
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryText})`,
              boxShadow: `0 8px 32px ${theme.primary}35`,
            }}
          >
            {loading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        <div className="mt-8 text-sm text-center">
          <Link
            href="/login"
            className="text-gray-500 font-medium flex items-center justify-center group transition-colors"
            style={{ "--hover-color": theme.primary }}
            onMouseEnter={(e) => (e.currentTarget.style.color = theme.primary)}
            onMouseLeave={(e) => (e.currentTarget.style.color = "")}
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  theme,
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-gray-700 ml-1">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 transition-all outline-none"
        style={{ "--tw-ring-color": theme?.primary }}
      />
    </div>
  );
}
