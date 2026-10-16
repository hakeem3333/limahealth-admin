"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ShieldCheck, Activity, Users, ArrowRight, Zap, CheckCircle2,
  Lock, Building2, Heart, Briefcase, GraduationCap, Star,
  ChevronRight, Globe, Award,
} from "lucide-react";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  navy:        "#0D3B7A",
  navyLight:   "#E8EEF8",
  navyMid:     "#1A4F9C",
  teal:        "#0CAF87",
  tealLight:   "#EBF9F5",
  tealMid:     "#9FE1CB",
  purple:      "#6C5CE7",
  purpleLight: "#E9E6FE",
  amber:       "#F9A825",
  amberLight:  "#FEF3CD",
  red:         "#E63946",
  pageBg:      "#F5F7FA",
  textPrimary: "#0D1B2A",
  textSecond:  "#4A5568",
  textMuted:   "#94A3B8",
  border:      "#E2E8F0",
  white:       "#FFFFFF",
};

// ── Org type config ───────────────────────────────────────────────────────────
const ORG_TYPES = [
  {
    key:      "SCHOOL",
    label:    "Schools",
    icon:     GraduationCap,
    color:    C.teal,
    light:    C.tealLight,
    border:   C.tealMid,
    tagline:  "Student Wellbeing at Scale",
    headline: "Every student deserves\na mental health safety net.",
    sub:      "Monitor wellness signals, manage counselor sessions, and identify at-risk students — all from one secure dashboard.",
    member:   "Students",
    support:  "Counselors",
  },
  {
    key:      "COMPANY",
    label:    "Companies",
    icon:     Briefcase,
    color:    C.purple,
    light:    C.purpleLight,
    border:   "#D1C8F8",
    tagline:  "Employee Wellness Programs",
    headline: "Empower your workforce\nwith proactive mental health.",
    sub:      "Reduce burnout, track engagement, and give your wellness coaches the data they need to support your team.",
    member:   "Employees",
    support:  "Wellness Coaches",
  },
  {
    key:      "HOSPITAL",
    label:    "Hospitals",
    icon:     Heart,
    color:    C.navy,
    light:    C.navyLight,
    border:   "#B8CCEB",
    tagline:  "Clinical Care Coordination",
    headline: "Better care, guided\nby real-time data.",
    sub:      "Monitor patient wellness signals, manage doctor caseloads, and flag at-risk patients early — all from one secure dashboard.",
    member:   "Patients",
    support:  "Doctors",
  },
  {
    key:      "NGO",
    label:    "NGOs",
    icon:     Globe,
    color:    "#B45309",
    light:    C.amberLight,
    border:   "#F9D06E",
    tagline:  "Community Wellbeing",
    headline: "Wellbeing at the\nheart of every mission.",
    sub:      "Support workers and community members deserve the same quality mental health tools. Flexible, affordable, and impact-first.",
    member:   "Members",
    support:  "Support Workers",
  },
];

export default function LandingPage() {
  const [activeOrg, setActiveOrg] = useState(0);
  const autoPlayRef = useRef(true);
  const org = ORG_TYPES[activeOrg];

  // Auto-rotate every 3 seconds unless user manually picked one
  useEffect(() => {
    const interval = setInterval(() => {
      if (autoPlayRef.current) {
        setActiveOrg((prev) => (prev + 1) % ORG_TYPES.length);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  function handleManualSelect(i) {
    autoPlayRef.current = false; // stop auto-rotate on manual click
    setActiveOrg(i);
  }

  return (
    <main
      className="min-h-screen font-sans"
      style={{ backgroundColor: C.white, color: C.textPrimary }}
    >
      {/* ── Nav ──────────────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 border-b"
        style={{ backgroundColor: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)", borderColor: C.border }}
      >
        <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${C.teal}, #0F6E56)` }}
            >
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight" style={{ color: C.textPrimary }}>
              Lima<span style={{ color: C.teal }}>Health</span>
            </span>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold" style={{ color: C.textSecond }}>
            <a href="#features" className="hover:opacity-70 transition-opacity">Features</a>
            <a href="#organisations" className="hover:opacity-70 transition-opacity">For Orgs</a>
            <a href="#process" className="hover:opacity-70 transition-opacity">How it works</a>
            <Link
              href="/login"
              className="transition-all"
              style={{
                backgroundColor: C.navyLight,
                color: C.navy,
                padding: "10px 22px",
                borderRadius: "12px",
                fontWeight: 700,
              }}
            >
              Admin Login
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-1.5 transition-all"
              style={{
                background: `linear-gradient(135deg, ${C.teal}, #0A8F6E)`,
                color: C.white,
                padding: "10px 22px",
                borderRadius: "12px",
                fontWeight: 700,
              }}
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${C.white} 0%, #F0F9FF 50%, ${C.tealLight} 100%)`,
          paddingTop: "80px",
          paddingBottom: "100px",
        }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute rounded-full"
            style={{
              width: 600, height: 600,
              background: `radial-gradient(circle, rgba(12,175,135,0.08) 0%, transparent 70%)`,
              top: -200, right: -150,
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: 400, height: 400,
              background: `radial-gradient(circle, rgba(13,59,122,0.06) 0%, transparent 70%)`,
              bottom: -100, left: -80,
            }}
          />
          {/* Dot grid */}
          <svg className="absolute top-12 right-12 opacity-20" width="180" height="180">
            {Array.from({ length: 8 }).map((_, r) =>
              Array.from({ length: 8 }).map((_, c) => (
                <circle key={`${r}-${c}`} cx={c * 22 + 2} cy={r * 22 + 2} r="2" fill={C.teal} />
              ))
            )}
          </svg>
          <svg className="absolute bottom-16 left-12 opacity-15" width="140" height="140">
            {Array.from({ length: 6 }).map((_, r) =>
              Array.from({ length: 6 }).map((_, c) => (
                <circle key={`${r}-${c}`} cx={c * 22 + 2} cy={r * 22 + 2} r="2" fill={C.navy} />
              ))
            )}
          </svg>
          {/* ECG line */}
          <svg className="absolute bottom-0 left-0 w-full opacity-5" height="120" preserveAspectRatio="none">
            <path
              d="M0 60 L200 60 L240 20 L260 100 L280 10 L310 80 L340 60 L1400 60"
              fill="none" stroke={C.teal} strokeWidth="2"
            />
          </svg>
        </div>

        <div className="relative mx-auto max-w-7xl px-6">
          {/* Org type switcher pills */}
          <div className="flex justify-center mb-10">
            <div
              className="inline-flex items-center gap-2 p-1.5 rounded-2xl"
              style={{ backgroundColor: C.white, border: `1px solid ${C.border}`, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
            >
              {ORG_TYPES.map((o, i) => {
                const Icon = o.icon;
                const active = i === activeOrg;
                return (
                  <button
                    key={o.key}
                    onClick={() => handleManualSelect(i)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                    style={{
                      backgroundColor: active ? o.color : "transparent",
                      color: active ? C.white : C.textSecond,
                      boxShadow: active ? `0 4px 12px ${o.color}40` : "none",
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{o.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Org tagline badge */}
          <div className="flex justify-center mb-6">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all"
              style={{ backgroundColor: org.light, color: org.color, border: `1px solid ${org.border}` }}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              {org.tagline} · HIPAA Compliant
            </div>
          </div>

          {/* Headline */}
          <h1
            className="text-center text-5xl md:text-7xl font-black tracking-tighter leading-[0.95] max-w-4xl mx-auto mb-6 transition-all"
            style={{ color: C.textPrimary }}
          >
            {org.headline.split("\n").map((line, i) => (
              <span key={i} className={i === 0 ? "block" : "block"} style={i === 1 ? { color: org.color } : {}}>
                {line}
              </span>
            ))}
          </h1>

          {/* Subtext */}
          <p
            className="text-center text-xl max-w-2xl mx-auto mb-12 leading-relaxed transition-all"
            style={{ color: C.textSecond }}
          >
            {org.sub}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/signup"
              className="group flex items-center gap-3 px-10 py-5 rounded-2xl text-white font-black text-sm uppercase tracking-widest transition-all"
              style={{
                background: `linear-gradient(135deg, ${C.navy}, ${C.navyMid})`,
                boxShadow: `0 8px 32px ${C.navy}30`,
              }}
            >
              Register your {org.label === "NGOs" ? "NGO" : org.label.slice(0, -1)}
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#process"
              className="flex items-center gap-2 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all"
              style={{
                border: `2px solid ${C.border}`,
                color: C.textSecond,
                backgroundColor: C.white,
              }}
            >
              How it works
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>

          {/* Social proof */}
          <div className="flex flex-wrap justify-center items-center gap-8 mt-16">
            {[
              { label: "Organisations", value: "500+" },
              { label: "Members supported", value: "50,000+" },
              { label: "Satisfaction rate", value: "98%" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-black" style={{ color: org.color }}>{stat.value}</div>
                <div className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: C.textMuted }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section
        id="features"
        className="py-28 border-y"
        style={{ backgroundColor: C.pageBg, borderColor: C.border }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: C.teal }}>
              The Platform
            </p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: C.textPrimary }}>
              Proactive wellbeing.<br />
              <span style={{ color: C.navy }}>Not reactive care.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Feature
              icon={<Activity className="h-6 w-6" />}
              iconBg={C.tealLight}
              iconColor={C.teal}
              title="Biometric Monitoring"
              description="Securely track stress indicators through wearable data streams with real-time alerts and end-to-end encryption."
              accentColor={C.teal}
            />
            <Feature
              icon={<Zap className="h-6 w-6" />}
              iconBg={C.navyLight}
              iconColor={C.navy}
              title="AI-Powered Alerts"
              description="Our model identifies high-risk deviations before they escalate — notifying the right support staff instantly."
              accentColor={C.navy}
            />
            <Feature
              icon={<Lock className="h-6 w-6" />}
              iconBg={C.purpleLight}
              iconColor={C.purple}
              title="Data Sovereignty"
              description="Your organisation owns its data. No third-party sharing, no exceptions. HIPAA and GDPR compliant by default."
              accentColor={C.purple}
            />
          </div>
        </div>
      </section>

      {/* ── Org type showcase ─────────────────────────────────────────────────── */}
      <section id="organisations" className="py-28" style={{ backgroundColor: C.white }}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: C.teal }}>
              Built for every sector
            </p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: C.textPrimary }}>
              One platform.<br />
              <span style={{ color: C.teal }}>Every organisation type.</span>
            </h2>
            <p className="mt-5 text-lg max-w-xl mx-auto" style={{ color: C.textSecond }}>
              LimaHealth adapts its terminology, tools, and dashboards to match how your organisation actually works.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {ORG_TYPES.map((o, i) => {
              const Icon = o.icon;
              return (
                <div
                  key={o.key}
                  onClick={() => {
                    handleManualSelect(i);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="cursor-pointer group rounded-3xl p-8 border transition-all duration-300 hover:-translate-y-1"
                  style={{
                    backgroundColor: C.white,
                    border: `1.5px solid ${C.border}`,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = o.color;
                    e.currentTarget.style.boxShadow = `0 12px 40px ${o.color}20`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)";
                  }}
                >
                  <div
                    className="h-14 w-14 rounded-2xl flex items-center justify-center mb-6"
                    style={{ backgroundColor: o.light }}
                  >
                    <Icon className="h-7 w-7" style={{ color: o.color }} />
                  </div>
                  <h3 className="text-xl font-black mb-2" style={{ color: C.textPrimary }}>{o.label}</h3>
                  <p className="text-sm font-bold mb-5" style={{ color: o.color }}>{o.tagline}</p>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-sm" style={{ color: C.textSecond }}>
                      <div className="h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: o.light }}>
                        <Users className="h-2.5 w-2.5" style={{ color: o.color }} />
                      </div>
                      <span><strong className="font-bold" style={{ color: C.textPrimary }}>{o.member}</strong> get wellbeing tools</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm" style={{ color: C.textSecond }}>
                      <div className="h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: o.light }}>
                        <Heart className="h-2.5 w-2.5" style={{ color: o.color }} />
                      </div>
                      <span><strong className="font-bold" style={{ color: C.textPrimary }}>{o.support}</strong> manage sessions</span>
                    </div>
                  </div>
                  <div
                    className="mt-6 flex items-center gap-1.5 text-xs font-black uppercase tracking-widest"
                    style={{ color: o.color }}
                  >
                    Learn more <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────────── */}
      <section
        id="process"
        className="py-28"
        style={{
          background: `linear-gradient(160deg, ${C.navyLight} 0%, ${C.white} 60%)`,
        }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left copy */}
            <div>
              <p className="text-xs font-black uppercase tracking-widest mb-5" style={{ color: C.teal }}>
                Onboarding
              </p>
              <h2 className="text-5xl font-black tracking-tight mb-6 leading-tight" style={{ color: C.textPrimary }}>
                Getting your<br />
                <span
                  className="italic underline underline-offset-8"
                  style={{ color: C.navy, textDecorationColor: C.tealMid }}
                >
                  organisation onboarded.
                </span>
              </h2>
              <p className="text-lg mb-10" style={{ color: C.textSecond }}>
                We follow a strict verification process to ensure the integrity and security of your health data network.
              </p>
              <div className="space-y-4">
                <CheckPoint text="Verified institutional credentials required" color={C.teal} />
                <CheckPoint text="HIPAA & GDPR compliant data handling" color={C.teal} />
                <CheckPoint text="Dedicated support staff training modules" color={C.teal} />
                <CheckPoint text="Works for schools, companies, hospitals & NGOs" color={C.teal} />
              </div>
            </div>

            {/* Right steps */}
            <div className="grid gap-5">
              <Step number="01" title="Organisation Registration" desc="Register your organisation and provide admin contact details. Supports all org types." color={C.teal} />
              <Step number="02" title="Email Verification" desc="Securely verify the admin email domain to protect your account from day one." color={C.navy} />
              <Step number="03" title="Compliance Review" desc="Our team verifies your organisation status — typically within 24-48 hours." color={C.purple} />
              <Step number="04" title="Deploy & Onboard" desc="Invite your support staff and start enrolling members. Everything adapts to your org type." color="#B45309" />
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA banner ───────────────────────────────────────────────────────── */}
      <section className="py-24" style={{ backgroundColor: C.white }}>
        <div className="mx-auto max-w-7xl px-6">
          <div
            className="rounded-[2.5rem] p-16 text-center relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${C.navy} 0%, #1A4F9C 50%, ${C.navyMid} 100%)`,
            }}
          >
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div
                className="absolute rounded-full"
                style={{
                  width: 400, height: 400,
                  background: `radial-gradient(circle, rgba(12,175,135,0.15) 0%, transparent 70%)`,
                  top: -150, right: -100,
                }}
              />
              <div
                className="absolute rounded-full"
                style={{
                  width: 300, height: 300,
                  background: `radial-gradient(circle, rgba(108,92,231,0.12) 0%, transparent 70%)`,
                  bottom: -100, left: -50,
                }}
              />
              <svg className="absolute top-8 left-8 opacity-10" width="120" height="120">
                {Array.from({ length: 5 }).map((_, r) =>
                  Array.from({ length: 5 }).map((_, c) => (
                    <circle key={`${r}-${c}`} cx={c * 22 + 2} cy={r * 22 + 2} r="2" fill="white" />
                  ))
                )}
              </svg>
            </div>

            <div className="relative">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8"
                style={{ backgroundColor: "rgba(12,175,135,0.2)", color: C.teal }}
              >
                <Award className="h-3.5 w-3.5" />
                Trusted across Africa &amp; beyond
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6 leading-tight">
                Ready to prioritise<br />
                <span style={{ color: C.teal }}>your people&apos;s wellbeing?</span>
              </h2>
              <p className="text-xl mb-12 max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.7)" }}>
                Join 500+ organisations already using LimaHealth to create a culture of care.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/signup"
                  className="group flex items-center justify-center gap-3 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${C.teal}, #0A8F6E)`,
                    color: C.white,
                    boxShadow: `0 8px 32px rgba(12,175,135,0.35)`,
                  }}
                >
                  Register your organisation
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all"
                  style={{
                    border: "2px solid rgba(255,255,255,0.2)",
                    color: C.white,
                    backgroundColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  Admin Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer
        className="py-16 px-6"
        style={{ backgroundColor: C.navy }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10 pb-10 border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${C.teal}, #0A8F6E)` }}
              >
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-black text-white tracking-tight">
                  Lima<span style={{ color: C.teal }}>Health</span>
                </div>
                <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Wellbeing for every organisation
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-wrap justify-center gap-8 text-xs font-black uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
              <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-white transition-colors">HIPAA Compliance</Link>
              <Link href="#" className="hover:text-white transition-colors">Support</Link>
            </div>

            {/* Security badge */}
            <div
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
              style={{ backgroundColor: "rgba(12,175,135,0.12)", border: "1px solid rgba(12,175,135,0.25)" }}
            >
              <ShieldCheck className="h-4 w-4" style={{ color: C.teal }} />
              <span className="text-xs font-bold" style={{ color: C.teal }}>AES-256 Encrypted</span>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
              © {new Date().getFullYear()} LimaHealth Technologies Ltd. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
              <span className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                All systems operational
              </span>
              <span>HIPAA · GDPR</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────────────── */

function Feature({ icon, iconBg, iconColor, title, description, accentColor }) {
  return (
    <div
      className="group rounded-[2rem] p-10 border transition-all duration-500 hover:-translate-y-1"
      style={{
        backgroundColor: C.white,
        border: `1.5px solid ${C.border}`,
        boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 20px 60px ${accentColor}15`;
        e.currentTarget.style.borderColor = accentColor + "50";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.04)";
        e.currentTarget.style.borderColor = C.border;
      }}
    >
      <div
        className="h-14 w-14 rounded-2xl flex items-center justify-center mb-8 transition-all"
        style={{ backgroundColor: iconBg }}
      >
        <span style={{ color: iconColor }}>{icon}</span>
      </div>
      <h3 className="font-black text-xl mb-4 tracking-tight" style={{ color: C.textPrimary }}>{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: C.textSecond }}>{description}</p>
    </div>
  );
}

function Step({ number, title, desc, color }) {
  return (
    <div
      className="flex gap-6 p-7 rounded-2xl border transition-all"
      style={{
        backgroundColor: C.white,
        border: `1.5px solid ${C.border}`,
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = color + "60";
        e.currentTarget.style.boxShadow = `0 8px 32px ${color}12`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = C.border;
        e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)";
      }}
    >
      <span className="text-4xl font-black tracking-tighter flex-shrink-0" style={{ color: color + "25" }}>
        {number}
      </span>
      <div>
        <h4 className="font-black mb-1.5" style={{ color: C.textPrimary }}>{title}</h4>
        <p className="text-sm" style={{ color: C.textSecond }}>{desc}</p>
      </div>
    </div>
  );
}

function CheckPoint({ text, color }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: color + "18" }}
      >
        <CheckCircle2 className="h-3.5 w-3.5" style={{ color }} />
      </div>
      <span className="text-sm font-semibold" style={{ color: C.textSecond }}>{text}</span>
    </div>
  );
}
