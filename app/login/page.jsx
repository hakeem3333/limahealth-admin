"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import Link from "next/link";
import {
  Loader2,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Clock,
  ShieldAlert,
  Inbox,
  Activity,
  GraduationCap,
  Briefcase,
  Heart,
  Globe,
} from "lucide-react";
import { ORG_THEMES } from "@/lib/orgTheme";
import { markOtpIssued } from "@/lib/otpSession";

// ── Org type config for this page (icons + email hints; colors/labels come from lib/orgTheme) ──
const ORG_KEYS = ["SCHOOL", "COMPANY", "HOSPITAL", "NGO"];
const ORG_ICONS = { SCHOOL: GraduationCap, COMPANY: Briefcase, HOSPITAL: Heart, NGO: Globe };
const ORG_EMAIL_HINT = {
  SCHOOL:   "admin@yourschool.edu",
  COMPANY:  "admin@yourcompany.com",
  HOSPITAL: "admin@yourhospital.org",
  NGO:      "admin@yourngo.org",
};

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [pendingOrgName, setPendingOrgName] = useState(""); // Holds the institution name
  const [pendingOrgType, setPendingOrgType] = useState(null); // SCHOOL | COMPANY | HOSPITAL | NGO
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // ── Org type theming — driven by the real account behind the typed email, not decoration ──
  const [orgIndex, setOrgIndex] = useState(0);
  const [orgResolved, setOrgResolved] = useState(false); // true once the theme reflects a real account
  const [orgLookupLoading, setOrgLookupLoading] = useState(false);
  const orgKey = ORG_KEYS[orgIndex];
  const theme = ORG_THEMES[orgKey];
  const OrgIcon = ORG_ICONS[orgKey];

  // Debounced lookup: as soon as the typed email matches a real ORG_ADMIN account,
  // snap the theme to that organisation's actual type and lock the picker.
  useEffect(() => {
    const email = form.email.trim();
    if (!email || !email.includes("@")) {
      setOrgResolved(false);
      setOrgLookupLoading(false);
      return;
    }

    setOrgLookupLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await api.get("/auth/admin/org-type", { params: { email } });
        const foundType = res.data?.orgType;
        if (foundType && ORG_KEYS.includes(foundType)) {
          setOrgIndex(ORG_KEYS.indexOf(foundType));
          setOrgResolved(true);
        } else {
          setOrgResolved(false);
        }
      } catch {
        setOrgResolved(false);
      } finally {
        setOrgLookupLoading(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [form.email]);

  function selectOrg(i) {
    if (orgResolved) return; // locked to the real account's org type
    setOrgIndex(i);
  }

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const res = await api.post("/auth/admin/login", form);

      if (res.data?.status === "PENDING_APPROVAL") {
        setPendingOrgName(res.data?.orgName || "");
        setPendingOrgType(res.data?.orgType || null);
        setIsPending(true);
        return;
      }

      try {
        sessionStorage.setItem("lh_otp_ctx", JSON.stringify({ orgType: orgKey, email: form.email }));
      } catch {}
      markOtpIssued("admin-login");
      router.replace("/login/verify-otp");
    } catch (err) {
      const errorMessage = err?.response?.data?.message || "";
      const errorStatus = err?.response?.status;
      const errorData = err?.response?.data || {};

      if (
        errorStatus === 403 &&
        (errorData.status === "PENDING_APPROVAL" ||
          errorMessage.toUpperCase().includes("PENDING SUPER ADMIN APPROVAL"))
      ) {
        setPendingOrgName(errorData.orgName || "");
        setPendingOrgType(errorData.orgType || null);
        setError("");
        setIsPending(true);
        return;
      }

      setError(errorMessage || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  // --- MODAL STATE ---
  if (isPending) {
    const pendingTheme = ORG_THEMES[pendingOrgType] || theme;
    const PendingOrgIcon = ORG_ICONS[pendingOrgType] || OrgIcon;

    return (
      <main className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4 animate-in fade-in duration-500">
        <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl shadow-blue-900/5 border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-500">
          <div
            className="px-8 py-10 text-white relative overflow-hidden transition-colors duration-500"
            style={{ backgroundColor: pendingTheme.primary }}
          >
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight leading-none">
                  Access Pending
                </h2>
                <p className="mt-2 text-xs font-medium opacity-90 flex items-center gap-1.5">
                  <PendingOrgIcon className="h-3.5 w-3.5" />
                  {pendingTheme.orgLabel} Review
                </p>
              </div>
            </div>
            <ShieldAlert className="absolute -right-4 -bottom-4 h-32 w-32 text-white/10 rotate-12" />
          </div>

          <div className="p-10 text-center">
            <div
              className="mx-auto h-20 w-20 rounded-3xl flex items-center justify-center mb-6 transition-colors duration-500"
              style={{ backgroundColor: pendingTheme.primaryLight }}
            >
              <Inbox className="h-10 w-10 transition-colors duration-500" style={{ color: pendingTheme.primary }} />
            </div>

            <p className="text-sm text-gray-600 font-medium leading-relaxed mb-8">
              The account for{" "}
              <span className="text-gray-900 font-black">{form.email}</span>
              {pendingOrgName ? (
                <>
                  {" "}
                  for{" "}
                  <span className="font-black" style={{ color: pendingTheme.primary }}>
                    {pendingOrgName}
                  </span>{" "}
                </>
              ) : (
                " "
              )}
              is currently awaiting Super Admin approval.
              <br />
              <br />
              You will receive an activation email once your biometric oversight
              dashboard is ready.
            </p>

            <div className="space-y-4">
              <button
                onClick={() => setIsPending(false)}
                className="w-full flex items-center justify-center gap-3 rounded-2xl py-5 text-white font-black uppercase tracking-[0.2em] text-[10px] transition-all active:scale-[0.98]"
                style={{ background: `linear-gradient(135deg, ${pendingTheme.primary}, ${pendingTheme.primaryText})` }}
              >
                Return to Login
              </button>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                LimaHealth Security Protocol
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // --- LOGIN FORM STATE ---
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

      <div className="w-full max-w-md relative">
        {/* Brand mark */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center transition-colors duration-700"
            style={{ backgroundColor: theme.primary }}
          >
            <Activity className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-black tracking-tight text-gray-900">
            Lima<span style={{ color: theme.primary }}>Health</span>
          </span>
        </div>

        <div className="rounded-[2.5rem] bg-white p-10 shadow-2xl shadow-blue-900/5 border border-gray-100">
          {/* Org type switcher — locks once the typed email resolves to a real account */}
          <div className="flex flex-col items-center gap-2 mb-8">
            <div
              className="inline-flex items-center gap-1 p-1 rounded-2xl bg-gray-50 border border-gray-100 transition-opacity"
              style={{ opacity: orgResolved ? 0.6 : 1 }}
            >
              {ORG_KEYS.map((key, i) => {
                const t = ORG_THEMES[key];
                const Icon = ORG_ICONS[key];
                const active = i === orgIndex;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => selectOrg(i)}
                    disabled={orgResolved}
                    className="flex items-center justify-center h-9 w-9 rounded-xl transition-all"
                    style={{
                      backgroundColor: active ? t.primary : "transparent",
                      boxShadow: active ? `0 4px 12px ${t.primary}40` : "none",
                      cursor: orgResolved ? "not-allowed" : "pointer",
                    }}
                    title={t.orgLabel}
                  >
                    <Icon
                      className="h-4 w-4 transition-colors"
                      style={{ color: active ? "#FFFFFF" : "#94A3B8" }}
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest transition-colors" style={{ color: orgResolved ? theme.primary : "#64748B" }}>
              {orgLookupLoading
                ? "Checking account…"
                : orgResolved
                ? `✓ Detected — ${theme.orgLabel}`
                : theme.orgLabel}
            </p>
          </div>

          <div className="text-center mb-8">
            <div
              className="mx-auto h-14 w-14 rounded-2xl flex items-center justify-center mb-4 shadow-sm transition-colors duration-500"
              style={{ backgroundColor: theme.primaryLight }}
            >
              <OrgIcon className="h-7 w-7 transition-colors duration-500" style={{ color: theme.primary }} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter">
              Sign In
            </h1>
            <p className="mt-2 text-sm text-gray-500 font-medium">
              LimaHealth Administration Portal
            </p>
            <p
              className="mt-1 text-xs font-bold uppercase tracking-widest transition-colors duration-500"
              style={{ color: theme.primary }}
            >
              {theme.tagline}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-2xl bg-red-50 px-4 py-3 text-xs font-black uppercase tracking-widest text-red-600 border border-red-100 animate-in fade-in slide-in-from-top-1 text-center">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="w-full rounded-2xl bg-gray-50/50 border-none ring-1 ring-gray-100 px-5 py-4 text-sm font-bold text-gray-900 focus:ring-2 transition-all outline-none"
                style={{ "--tw-ring-color": theme.primary }}
                placeholder={ORG_EMAIL_HINT[orgKey]}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between ml-1 mr-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[10px] font-black uppercase tracking-widest transition-colors"
                  style={{ color: theme.primary }}
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  className="w-full rounded-2xl bg-gray-50/50 border-none ring-1 ring-gray-100 px-5 py-4 text-sm font-bold text-gray-900 focus:ring-2 transition-all outline-none"
                  style={{ "--tw-ring-color": theme.primary }}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors"
                  style={{ color: showPassword ? theme.primary : undefined }}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
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
                  Send Verification Code
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-[10px] font-black uppercase tracking-widest text-gray-400 border-t border-gray-50 pt-8">
            New Institution?{" "}
            <Link
              href="/signup"
              className="ml-1 transition-colors duration-500"
              style={{ color: theme.primary }}
            >
              Register {theme.orgLabel}
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
