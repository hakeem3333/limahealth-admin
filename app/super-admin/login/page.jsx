"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react"; // Imported icons

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State for visibility

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
    <main className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">L</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 text-center">
            Super Admin Portal
          </h1>
          <p className="mt-2 text-sm text-center text-slate-500">
            System-wide management & configuration
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 border border-red-100 text-center">
              {error}
            </div>
          )}

          <Input
            label="Super Admin Email"
            type="email"
            required
            value={form.email}
            onChange={(v) => update("email", v)}
          />

          <Input
            label="Security Password"
            type={showPassword ? "text" : "password"} // Dynamic type
            required
            value={form.password}
            onChange={(v) => update("password", v)}
            isPasswordField={true} // New prop to trigger the eye
            showPassword={showPassword}
            togglePassword={() => setShowPassword(!showPassword)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-slate-900 py-3 text-white font-medium hover:bg-slate-800 disabled:opacity-50 transition-all active:scale-[0.98] mt-2"
          >
            {loading ? "Authenticating..." : "Secure Sign In"}
          </button>

          <div className="text-center">
            <Link
              href="/login"
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Back to School Admin Login
            </Link>
          </div>
        </form>
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
  isPasswordField,
  showPassword,
  togglePassword,
}) {
  return (
    <div className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <div className="relative">
        <input
          type={type}
          value={value}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-slate-50"
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={togglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
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
