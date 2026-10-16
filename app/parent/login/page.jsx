"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import Link from "next/link";
import {
  Loader2,
  ArrowRight,
  Lock,
  HeartHandshake,
  GraduationCap,
  Briefcase,
  Heart,
  Globe,
} from "lucide-react";
import { ORG_THEMES, DEFAULT_THEME } from "@/lib/orgTheme";
import { markOtpIssued } from "@/lib/otpSession";

// Same org-type theming as the org-admin login page — the lookup endpoint
// already resolves PARENT accounts too, so this page just borrows it for
// a themed experience that matches the parent's own organisation.
const ORG_ICONS = { SCHOOL: GraduationCap, COMPANY: Briefcase, HOSPITAL: Heart, NGO: Globe };

export default function ParentLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const [orgType, setOrgType] = useState(null);
  const theme = orgType ? ORG_THEMES[orgType] : DEFAULT_THEME;
  const OrgIcon = orgType ? ORG_ICONS[orgType] : HeartHandshake;

  // Debounced lookup so the page themes itself to the real account's
  // organisation once the typed email resolves — purely cosmetic.
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
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/parent/login", { email: email.trim() });
      markOtpIssued("parent-login");
      setSent(true);
      setTimeout(() => {
        router.push(`/parent/login/verify?email=${encodeURIComponent(email.trim())}`);
      }, 600);
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden transition-colors duration-700"
      style={{ backgroundColor: "#F5F7FA" }}
    >
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

      <div className="w-full max-w-md relative">
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center transition-colors duration-700"
            style={{ backgroundColor: theme.primary }}
          >
            <HeartHandshake className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-black tracking-tight text-gray-900">
            Lima<span style={{ color: theme.primary }}>Health</span>
          </span>
        </div>

        <div className="rounded-[2.5rem] bg-white p-10 shadow-2xl shadow-blue-900/5 border border-gray-100">
          <div className="text-center mb-8">
            <div
              className="mx-auto h-14 w-14 rounded-2xl flex items-center justify-center mb-4 shadow-sm transition-colors duration-500"
              style={{ backgroundColor: theme.primaryLight }}
            >
              <OrgIcon className="h-7 w-7 transition-colors duration-500" style={{ color: theme.primary }} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter">
              Parent Sign In
            </h1>
            <p className="mt-2 text-sm text-gray-500 font-medium">
              No password needed — we'll email you a one-time code.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-2xl bg-red-50 px-4 py-3 text-xs font-black uppercase tracking-widest text-red-600 border border-red-100 animate-in fade-in slide-in-from-top-1 text-center">
                {error}
              </div>
            )}

            {sent && !error && (
              <div
                className="rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-widest text-center animate-in fade-in slide-in-from-top-1"
                style={{ backgroundColor: theme.primaryLight, color: theme.primaryText }}
              >
                Code sent — check your email
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
                className="w-full rounded-2xl bg-gray-50/50 border-none ring-1 ring-gray-100 px-5 py-4 text-sm font-bold text-gray-900 focus:ring-2 transition-all outline-none"
                style={{ "--tw-ring-color": theme.primary }}
                placeholder="you@example.com"
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl py-5 text-white font-black uppercase tracking-[0.2em] text-xs transition-all flex justify-center items-center group shadow-xl"
              style={{
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryText})`,
                boxShadow: `0 8px 32px ${theme.primary}35`,
              }}
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <>
                  Send Sign-In Code
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-[10px] font-black uppercase tracking-widest text-gray-400 border-t border-gray-50 pt-8">
            Staff or admin?{" "}
            <Link
              href="/login"
              className="ml-1 transition-colors duration-500"
              style={{ color: theme.primary }}
            >
              Sign in here
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6">
          <Lock className="h-3 w-3 text-gray-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            AES-256 Encrypted &middot; HIPAA &amp; GDPR Compliant
          </span>
        </div>
      </div>
    </main>
  );
}
