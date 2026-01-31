"use client";

import { useState } from "react";
import { api } from "@/lib/axios";
import Link from "next/link";
import { Loader2, Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Forgot Password
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your school admin email and we'll send you a link to reset
            your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          {message && (
            <div className="text-green-700 text-sm bg-green-50 px-4 py-3 rounded-xl border border-green-100">
              {message}
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="admin@school.edu"
            value={email}
            onChange={setEmail}
            required
          />

          <button
            type="submit"
            disabled={loading || !!message}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 disabled:opacity-50 transition-all flex justify-center items-center"
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
            className="text-gray-500 hover:text-blue-600 font-medium flex items-center justify-center group"
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
        className="rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
      />
    </div>
  );
}
