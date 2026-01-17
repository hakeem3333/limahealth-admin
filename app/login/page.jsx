"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import Link from "next/link";

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

      // The backend now sets an HTTP-only 'admin_temp_token' cookie.
      // Ensure your axios instance has { withCredentials: true }
      await api.post("/auth/admin/login", form);

      // If the request succeeds, the cookie is already in the browser.
      // We just move to the next screen.
      router.push("/login/verify-otp");
    } catch (err) {
      // Show generic error message from backend for security
      setError(err?.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-center">
          Sign in to LimaHealth
        </h1>
        <p className="mt-2 text-sm text-center text-gray-600">
          Access your school administration dashboard
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 border border-red-100 animate-pulse">
              {error}
            </div>
          )}

          <Input
            label="Email address"
            type="email"
            required
            value={form.email}
            onChange={(v) => update("email", v)}
          />

          <Input
            label="Password"
            type="password"
            required
            value={form.password}
            onChange={(v) => update("password", v)}
          />

          <div className="flex items-center justify-between text-sm">
            <Link
              href="/forgot-password"
              className="text-blue-600 hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-black py-3 text-white font-medium hover:bg-gray-800 disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            {loading ? "Verifying..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 border-t pt-6">
          Don’t have a school account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-blue-600 hover:underline"
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

function Input({ label, value, onChange, type = "text", required }) {
  return (
    <div className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-gray-700">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
      />
    </div>
  );
}
