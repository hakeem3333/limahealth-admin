"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import Link from "next/link";
import { Loader2, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      // Step 1: Password Verification.
      // This sets the 'admin_temp_token' cookie and triggers the OTP email.
      await api.post("/auth/admin/login", form);

      router.push("/login/verify-otp");
    } catch (err) {
      if (err?.type === "NETWORK_ERROR") {
        setError(
          "Unable to connect to the server. Please check your internet.",
        );
        return;
      }
      setError(err?.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Sign in to LimaHealth
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            School Administration Portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100 animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          <Input
            label="Email address"
            type="email"
            placeholder="admin@school.edu"
            required
            value={form.email}
            onChange={(v) => update("email", v)}
          />

          <div className="space-y-1">
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              required
              value={form.password}
              onChange={(v) => update("password", v)}
            />
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-4 text-white font-bold hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-[0.98] shadow-lg shadow-blue-100 flex justify-center items-center group"
          >
            {loading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <>
                Continue to OTP
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500 border-t border-gray-100 pt-6">
          Don’t have a school account?{" "}
          <Link
            href="/signup"
            className="font-bold text-blue-600 hover:text-blue-700"
          >
            Register your school
          </Link>
        </div>
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
  required,
  placeholder,
}) {
  return (
    <div className="flex flex-col gap-1.5 text-sm">
      <span className="font-semibold text-gray-700 ml-1">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
      />
    </div>
  );
}
