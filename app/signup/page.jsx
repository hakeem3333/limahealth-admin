"use client";

import { useState } from "react";
import { api } from "@/lib/axios";
import Link from "next/link";
import {
  Building2, UserCircle, ShieldCheck, ArrowRight, Globe, Mail, Lock,
  AlertCircle, Eye, EyeOff, CheckCircle2, Inbox, Activity,
  GraduationCap, Briefcase, Heart, ArrowLeft,
} from "lucide-react";

// ── Brand palette ──────────────────────────────────────────────────────────────
const P = {
  navy:        "#0D3B7A",
  navyLight:   "#E8EEF8",
  teal:        "#0CAF87",
  tealLight:   "#EBF9F5",
  purple:      "#6C5CE7",
  purpleLight: "#E9E6FE",
  amber:       "#F9A825",
  amberLight:  "#FEF3CD",
  red:         "#E63946",
  textPrimary: "#0D1B2A",
  textSecond:  "#4A5568",
  textMuted:   "#94A3B8",
  border:      "#E2E8F0",
  pageBg:      "#F5F7FA",
};

const ORG_TYPES = [
  {
    value:       "SCHOOL",
    label:       "School",
    Icon:        GraduationCap,
    desc:        "K-12, university or academic institution",
    shortDesc:   "Academic wellbeing",
    color:       P.teal,
    light:       P.tealLight,
    borderColor: "#9FE1CB",
    nameLabel:   "School Legal Name",
    namePH:      "St. Mary's Academy",
    tagline:     "Supporting student wellbeing at scale",
  },
  {
    value:       "COMPANY",
    label:       "Company",
    Icon:        Briefcase,
    desc:        "Corporation or workplace organisation",
    shortDesc:   "Employee wellness",
    color:       P.purple,
    light:       P.purpleLight,
    borderColor: "#C4BAF5",
    nameLabel:   "Company Name",
    namePH:      "Acme Corporation",
    tagline:     "Empowering your workforce's mental health",
  },
  {
    value:       "HOSPITAL",
    label:       "Hospital",
    Icon:        Heart,
    desc:        "Healthcare facility or medical centre",
    shortDesc:   "Staff mental health",
    color:       P.navy,
    light:       P.navyLight,
    borderColor: "#B8CCEB",
    nameLabel:   "Hospital / Clinic Name",
    namePH:      "City General Hospital",
    tagline:     "Care for those who care for others",
  },
  {
    value:       "NGO",
    label:       "NGO",
    Icon:        Globe,
    desc:        "Non-profit or community organisation",
    shortDesc:   "Community wellbeing",
    color:       "#B45309",
    light:       P.amberLight,
    borderColor: "#F9D06E",
    nameLabel:   "Organisation Name",
    namePH:      "Hope Foundation",
    tagline:     "Wellbeing at the heart of every mission",
  },
];

const TRUST_ITEMS = [
  { icon: ShieldCheck, text: "HIPAA & GDPR compliant" },
  { icon: Lock,        text: "AES-256 encrypted data" },
  { icon: CheckCircle2, text: "24-48h activation window" },
];

export default function SignupPage() {
  const [loading, setLoading]               = useState(false);
  const [isSuccess, setIsSuccess]           = useState(false);
  const [errors, setErrors]                 = useState({});
  const [formError, setFormError]           = useState("");
  const [showPassword, setShowPassword]     = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const [form, setForm] = useState({
    orgType:        "SCHOOL",
    orgName:        "",
    orgWebsite:     "",
    adminFirstName: "",
    adminLastName:  "",
    adminEmail:     "",
    password:       "",
    confirmPassword:"",
  });

  const org = ORG_TYPES.find((o) => o.value === form.orgType) ?? ORG_TYPES[0];

  const update = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: null }));
    if (formError) setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setFormError("");

    if (form.password !== form.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/admin/signup", {
        name:          form.orgName,
        website:       form.orgWebsite,
        orgType:       form.orgType,
        firstName:     form.adminFirstName,
        lastName:      form.adminLastName,
        contact_email: form.adminEmail,
        password:      form.password,
      });
      if (res.data.previewLink) console.log("Dev Email:", res.data.previewLink);
      setIsSuccess(true);
    } catch (err) {
      if (err?.type === "NETWORK_ERROR") {
        setFormError("Unable to connect to the server. Please check your internet.");
        return;
      }
      if (err?.response?.data?.errors) {
        setErrors(err.response.data.errors);
        return;
      }
      setFormError(err?.response?.data?.message || "Onboarding failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: P.pageBg }}
    >
      {/* ── Left panel (branding) ─────────────────────────────────────────── */}
      <aside
        className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 relative overflow-hidden px-10 py-12"
        style={{ background: `linear-gradient(160deg, ${P.navy} 0%, #1A4F9C 100%)` }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div style={{
            position: "absolute", width: 340, height: 340, borderRadius: "50%",
            background: `radial-gradient(circle, rgba(12,175,135,0.12) 0%, transparent 70%)`,
            top: -120, right: -80,
          }} />
          <div style={{
            position: "absolute", width: 280, height: 280, borderRadius: "50%",
            background: `radial-gradient(circle, rgba(108,92,231,0.1) 0%, transparent 70%)`,
            bottom: -60, left: -60,
          }} />
          <svg className="absolute bottom-0 left-0 w-full opacity-5" height="200" preserveAspectRatio="none">
            <path d="M0 100 Q210 30 420 100 L420 200 L0 200Z" fill="white" />
          </svg>
          {/* dot grid */}
          <svg className="absolute top-24 right-6 opacity-10" width="120" height="120">
            {Array.from({ length: 6 }).map((_, r) =>
              Array.from({ length: 5 }).map((_, c) => (
                <circle key={`${r}-${c}`} cx={c * 22 + 2} cy={r * 22 + 2} r="2" fill="white" />
              ))
            )}
          </svg>
        </div>

        {/* Logo */}
        <div className="relative">
          <Link href="/" className="flex items-center gap-2.5 group w-fit">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${P.teal}, #0A8F6E)` }}
            >
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black text-white tracking-tight">
              Lima<span style={{ color: P.teal }}>Health</span>
            </span>
          </Link>
        </div>

        {/* Mid section — org preview */}
        <div className="relative space-y-8">
          {/* Active org card */}
          <div
            className="rounded-2xl p-6 transition-all duration-500"
            style={{ backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-500"
              style={{ backgroundColor: org.color + "25", border: `1px solid ${org.color}50` }}
            >
              <org.Icon className="h-6 w-6 transition-all duration-500" style={{ color: org.color }} />
            </div>
            <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: org.color }}>
              {org.label} Plan
            </p>
            <p className="text-white font-bold text-lg leading-snug">{org.tagline}</p>
            <p className="text-white/50 text-sm mt-2">{org.desc}</p>
          </div>

          {/* Trust signals */}
          <div className="space-y-3">
            {TRUST_ITEMS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div
                  className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "rgba(12,175,135,0.15)" }}
                >
                  <Icon className="h-3.5 w-3.5" style={{ color: P.teal }} />
                </div>
                <span className="text-white/70 text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative">
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} LimaHealth Technologies
          </p>
        </div>
      </aside>

      {/* ── Right panel (form) ────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Top bar */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b"
          style={{ backgroundColor: "rgba(245,247,250,0.92)", backdropFilter: "blur(12px)", borderColor: P.border }}
        >
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-bold transition-all group"
            style={{ color: P.textSecond }}
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to home
          </Link>
          <div className="flex items-center gap-2 lg:hidden">
            <div
              className="h-7 w-7 rounded-lg flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${P.teal}, #0A8F6E)` }}
            >
              <Activity className="h-4 w-4 text-white" />
            </div>
            <span className="font-black text-sm" style={{ color: P.textPrimary }}>
              Lima<span style={{ color: P.teal }}>Health</span>
            </span>
          </div>
          <Link
            href="/login"
            className="text-sm font-bold transition-all"
            style={{ color: P.textMuted }}
          >
            Already registered? <span style={{ color: org.color }}>Sign in</span>
          </Link>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-start justify-center px-6 py-10">
          <div className="w-full max-w-xl">
            {!isSuccess ? (
              <>
                {/* Page heading */}
                <div className="mb-10">
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-5"
                    style={{ backgroundColor: org.light, color: org.color, border: `1px solid ${org.borderColor}` }}
                  >
                    <org.Icon className="h-3.5 w-3.5" />
                    {org.shortDesc}
                  </div>
                  <h1 className="text-4xl font-black tracking-tight mb-2" style={{ color: P.textPrimary }}>
                    Register your<br />
                    <span style={{ color: org.color }}>{org.label}.</span>
                  </h1>
                  <p className="text-base" style={{ color: P.textSecond }}>
                    {org.desc}. Takes less than 2 minutes.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {formError && (
                    <div
                      className="flex items-center gap-3 rounded-2xl p-4 text-sm font-bold border"
                      style={{ backgroundColor: "#FEF2F2", color: P.red, borderColor: "#FECACA" }}
                    >
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      {formError}
                    </div>
                  )}

                  {/* ── Section 1: Org Type ── */}
                  <FormSection label="Organisation Type">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {ORG_TYPES.map((o) => {
                        const active = form.orgType === o.value;
                        return (
                          <button
                            key={o.value}
                            type="button"
                            onClick={() => update("orgType", o.value)}
                            className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all text-center"
                            style={{
                              backgroundColor: active ? o.light : P.pageBg,
                              borderColor:     active ? o.color : P.border,
                              boxShadow:       active ? `0 0 0 3px ${o.color}18` : "none",
                            }}
                          >
                            <div
                              className="h-10 w-10 rounded-xl flex items-center justify-center transition-all"
                              style={{ backgroundColor: active ? o.color : P.border + "60" }}
                            >
                              <o.Icon className="h-5 w-5 transition-all" style={{ color: active ? "white" : P.textMuted }} />
                            </div>
                            <span
                              className="text-[10px] font-black uppercase tracking-widest transition-all"
                              style={{ color: active ? o.color : P.textMuted }}
                            >
                              {o.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </FormSection>

                  <Divider />

                  {/* ── Section 2: Org Details ── */}
                  <FormSection label="Organisation Details" icon={<Building2 className="h-3.5 w-3.5" />} accentColor={org.color}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Field
                        label={org.nameLabel}
                        required
                        value={form.orgName}
                        error={errors.name}
                        onChange={(v) => update("orgName", v)}
                        placeholder={org.namePH}
                        accent={org.color}
                        accentLight={org.light}
                      />
                      <Field
                        label="Public Website"
                        placeholder="https://yourorg.com"
                        icon={<Globe className="h-4 w-4" />}
                        value={form.orgWebsite}
                        error={errors.website}
                        onChange={(v) => update("orgWebsite", v)}
                        accent={org.color}
                        accentLight={org.light}
                      />
                    </div>
                    <Field
                      label="Primary Contact Email"
                      type="email"
                      required
                      icon={<Mail className="h-4 w-4" />}
                      value={form.adminEmail}
                      error={errors.contact_email}
                      onChange={(v) => update("adminEmail", v)}
                      placeholder="admin@yourorg.com"
                      accent={org.color}
                      accentLight={org.light}
                    />
                  </FormSection>

                  <Divider />

                  {/* ── Section 3: Admin ── */}
                  <FormSection label="Lead Administrator" icon={<UserCircle className="h-3.5 w-3.5" />} accentColor={org.color}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Field label="First Name" required value={form.adminFirstName} error={errors.firstName} onChange={(v) => update("adminFirstName", v)} accent={org.color} accentLight={org.light} />
                      <Field label="Last Name"  required value={form.adminLastName}  error={errors.lastName}  onChange={(v) => update("adminLastName", v)}  accent={org.color} accentLight={org.light} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Field
                        label="Access Password"
                        type={showPassword ? "text" : "password"}
                        required
                        icon={<Lock className="h-4 w-4" />}
                        value={form.password}
                        error={errors.password}
                        onChange={(v) => update("password", v)}
                        isPasswordField
                        showPassword={showPassword}
                        onToggleVisibility={() => setShowPassword(!showPassword)}
                        accent={org.color}
                        accentLight={org.light}
                      />
                      <Field
                        label="Confirm Password"
                        type={showConfirmPwd ? "text" : "password"}
                        required
                        icon={<ShieldCheck className="h-4 w-4" />}
                        value={form.confirmPassword}
                        error={errors.confirmPassword}
                        onChange={(v) => update("confirmPassword", v)}
                        isPasswordField
                        showPassword={showConfirmPwd}
                        onToggleVisibility={() => setShowConfirmPwd(!showConfirmPwd)}
                        accent={org.color}
                        accentLight={org.light}
                      />
                    </div>
                  </FormSection>

                  {/* ── Submit ── */}
                  <div className="space-y-4 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="group flex items-center justify-center gap-3 w-full rounded-2xl py-5 text-white font-black uppercase tracking-widest text-xs transition-all disabled:opacity-60 active:scale-[0.98]"
                      style={{
                        background: `linear-gradient(135deg, ${org.color}, ${org.color}CC)`,
                        boxShadow:  `0 8px 32px ${org.color}35`,
                      }}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Authorizing…
                        </span>
                      ) : (
                        <>
                          Initialize Account
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>

                    {/* Trust row */}
                    <div className="flex items-center justify-center gap-4 text-xs font-bold" style={{ color: P.textMuted }}>
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5" style={{ color: P.teal }} />
                        HIPAA Compliant
                      </span>
                      <span className="h-3 w-px" style={{ backgroundColor: P.border }} />
                      <span className="flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5" style={{ color: P.teal }} />
                        AES-256 Encrypted
                      </span>
                    </div>
                  </div>
                </form>
              </>
            ) : (
              /* ── Success state ── */
              <div className="flex flex-col items-center text-center py-8 animate-in fade-in zoom-in-95 duration-500">
                <div
                  className="h-24 w-24 rounded-[2rem] flex items-center justify-center mb-8"
                  style={{
                    background: `linear-gradient(135deg, ${P.teal}20, ${P.teal}10)`,
                    border: `2px solid ${P.teal}30`,
                  }}
                >
                  <Inbox className="h-10 w-10" style={{ color: P.teal }} />
                </div>

                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6"
                  style={{ backgroundColor: P.tealLight, color: P.teal, border: `1px solid ${P.teal}30` }}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Registration received
                </div>

                <h2 className="text-4xl font-black tracking-tight mb-3" style={{ color: P.textPrimary }}>
                  Check your inbox.
                </h2>
                <p className="text-base mb-2" style={{ color: P.textSecond }}>
                  We've dispatched a verification link to:
                </p>
                <p className="text-xl font-black mb-8" style={{ color: P.teal }}>
                  {form.adminEmail}
                </p>

                <div
                  className="w-full rounded-2xl p-6 mb-8 text-left space-y-3"
                  style={{ backgroundColor: P.pageBg, border: `1px solid ${P.border}` }}
                >
                  {[
                    "Click the link in the email to verify your address",
                    "Our team reviews your organisation within 24–48 hours",
                    "You'll receive an activation email when approved",
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div
                        className="h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-black"
                        style={{ backgroundColor: P.teal + "20", color: P.teal }}
                      >
                        {i + 1}
                      </div>
                      <p className="text-sm font-medium" style={{ color: P.textSecond }}>{step}</p>
                    </div>
                  ))}
                </div>

                <div className="w-full space-y-3">
                  <Link
                    href="/login"
                    className="group flex items-center justify-center gap-3 w-full rounded-2xl py-5 text-white font-black uppercase tracking-widest text-xs transition-all active:scale-[0.98]"
                    style={{
                      background: `linear-gradient(135deg, ${P.teal}, #0A8F6E)`,
                      boxShadow: `0 8px 32px ${P.teal}35`,
                    }}
                  >
                    Continue to Sign In
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="w-full py-3 text-xs font-black uppercase tracking-widest transition-colors"
                    style={{ color: P.textMuted }}
                  >
                    Wrong email? Go back
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────────────── */

function FormSection({ label, icon, accentColor, children }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        {icon && (
          <div
            className="p-1.5 rounded-lg"
            style={{ backgroundColor: accentColor ? accentColor + "18" : "#F1F5F9" }}
          >
            <span style={{ color: accentColor ?? "#64748B" }}>{icon}</span>
          </div>
        )}
        <h2
          className="text-[10px] font-black uppercase tracking-widest"
          style={{ color: "#94A3B8" }}
        >
          {label}
        </h2>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, backgroundColor: "#F1F5F9" }} />;
}

function Field({
  label, value, onChange, type = "text", required, placeholder, error,
  icon, isPasswordField, showPassword, onToggleVisibility,
  accent = "#0CAF87", accentLight = "#EBF9F5",
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: "#64748B" }}>
        {label} {required && <span style={{ color: "#E63946" }}>*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
            style={{ color: focused ? accent : "#94A3B8" }}
          >
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full rounded-2xl text-sm font-semibold transition-all outline-none"
          style={{
            padding:         `14px ${isPasswordField ? "44px" : "16px"} 14px ${icon ? "42px" : "16px"}`,
            backgroundColor: error ? "#FEF2F2" : focused ? accentLight : "white",
            border:          `1.5px solid ${error ? "#F87171" : focused ? accent : "#E2E8F0"}`,
            boxShadow:       focused ? `0 0 0 3px ${accent}18` : "0 1px 4px rgba(0,0,0,0.04)",
            color:           "#0D1B2A",
          }}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={onToggleVisibility}
            tabIndex="-1"
            className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
            style={{ color: "#94A3B8" }}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-[10px] font-black uppercase tracking-tight" style={{ color: "#E63946" }}>
          {Array.isArray(error) ? error[0] : error}
        </p>
      )}
    </div>
  );
}
