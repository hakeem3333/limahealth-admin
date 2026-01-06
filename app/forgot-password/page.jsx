"use client";

import { useState } from "react";
import { api } from "@/lib/axios";
import Link from "next/link";

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
      await api.post("/auth/forgot-password", { email });
      setMessage(
        "If this email exists in our system, a reset link or code has been sent."
      );
    } catch (err) {
      setError(
        err?.response?.data?.message || "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-center">Forgot Password</h1>
        <p className="mt-2 text-sm text-center text-gray-600">
          Enter your email to reset your password
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-md">
              {error}
            </div>
          )}

          {message && (
            <div className="text-green-600 text-sm bg-green-50 px-3 py-2 rounded-md">
              {message}
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={setEmail}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-4 text-sm text-center text-gray-600">
          Remembered your password?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}

function Input({ label, value, onChange, type = "text", required }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
      />
    </label>
  );
}
