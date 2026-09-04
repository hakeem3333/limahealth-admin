"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { playfairDisplay } from "@/lib/fonts";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      await api.post("/super-admin/login", form);
      router.push("/super-admin/login/verify-otp");
    } catch (err) {
      if (err?.type === "NETWORK_ERROR") {
        setError("Unable to connect to the server. Please try again later.");
        return;
      }
      setError(
        err?.response?.data?.message || "Invalid Super Admin credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className={`${playfairDisplay.variable} lh-page-wash min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden`}
    >
      {/* Decorative ambient glow, echoing the teal/terracotta brand gradient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-32 h-96 w-96 rounded-full bg-lh-teal/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-lh-accent/15 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="rounded-[2rem] bg-white p-10 shadow-2xl shadow-lh-navy/10 border border-lh-navy/5">
          <div className="flex flex-col items-center mb-8">
            <div className="relative h-16 w-16 mb-5 drop-shadow-sm">
              <Image
                src="/lima-logo.png"
                alt="LimaHealth"
                fill
                sizes="64px"
                className="object-contain"
                priority
              />
            </div>
            <h1 className="font-display text-3xl font-bold text-lh-navy text-center">
              Welcome Back
            </h1>
            <p className="mt-2 text-sm text-lh-gray-mid text-center">
              Access your Super Admin control center
            </p>
            <div className="mt-4 inline-block rounded-full bg-lh-teal-light px-4 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-lh-teal border border-lh-teal/20">
              System-Wide Access Only
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100 text-center">
                {error}
              </div>
            )}

            <Input
              label="Super Admin Email"
              type="email"
              icon={Mail}
              required
              value={form.email}
              onChange={(v) => update("email", v)}
            />

            <Input
              label="Security Password"
              type={showPassword ? "text" : "password"}
              icon={Lock}
              required
              value={form.password}
              onChange={(v) => update("password", v)}
              isPasswordField={true}
              showPassword={showPassword}
              togglePassword={() => setShowPassword(!showPassword)}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-4 text-white text-xs font-bold uppercase tracking-[0.2em] transition-all active:scale-[0.98] mt-2 shadow-xl shadow-lh-navy/20 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, var(--lh-navy), var(--lh-teal))" }}
            >
              {loading ? "Authenticating..." : "Secure Sign In"}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-gray-100 text-center">
            <Link
              href="/login"
              className="text-xs font-semibold text-lh-teal hover:text-lh-navy transition-colors"
            >
              Back to School Admin Login
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] uppercase tracking-widest text-lh-gray-mid/60 font-bold">
          &copy; {new Date().getFullYear()} LimaHealth
        </p>
      </div>
    </main>
  );
}

/* -----------------------------
    UI Components
------------------------------ */

function Input({
  label,
  value,
  onChange,
  type = "text",
  icon: Icon,
  required,
  isPasswordField,
  showPassword,
  togglePassword,
}) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 ml-1">
        {label}
      </span>
      <div className="relative flex items-center rounded-xl border border-lh-accent/25 bg-lh-accent-light/25 focus-within:ring-2 focus-within:ring-lh-teal focus-within:border-transparent transition-all">
        {Icon && <Icon className="ml-4 h-4 w-4 shrink-0 text-lh-accent" />}
        <input
          type={type}
          value={value}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent px-3 py-3.5 outline-none"
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={togglePassword}
            className="mr-4 shrink-0 text-gray-400 hover:text-lh-teal transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
