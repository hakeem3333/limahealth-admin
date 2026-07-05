"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import Link from "next/link";
import { Loader2, Lock, CheckCircle2, ArrowLeft } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get("token");

  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState("");

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-red-600 font-medium">Invalid or missing reset link.</p>
        <Link href="/forgot-password" className="text-blue-600 hover:underline text-sm">
          Request a new one
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, newPassword: password });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
        <h2 className="text-xl font-bold text-gray-900">Password reset!</h2>
        <p className="text-gray-500 text-sm">Redirecting you to login…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      <InputField
        label="New Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={setPassword}
        required
      />
      <InputField
        label="Confirm Password"
        type="password"
        placeholder="••••••••"
        value={confirm}
        onChange={setConfirm}
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 disabled:opacity-50 transition-all flex justify-center items-center"
      >
        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Reset Password"}
      </button>
    </form>
  );
}

function InputField({ label, value, onChange, type = "text", required, placeholder }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-gray-700 ml-1">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Set New Password</h1>
          <p className="mt-2 text-sm text-gray-600">Choose a strong password for your account.</p>
        </div>

        <Suspense fallback={<div className="text-center text-gray-400 text-sm">Loading…</div>}>
          <ResetPasswordForm />
        </Suspense>

        <div className="mt-8 text-sm text-center">
          <Link href="/login" className="text-gray-500 hover:text-blue-600 font-medium flex items-center justify-center group">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
