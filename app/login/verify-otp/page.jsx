"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/admin/verify-otp", { otp });

      // If successful, the backend has cleared the temp cookie
      // and set the final 'access_token' and 'refresh_token' cookies.
      router.push("/dashboard");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Invalid or expired code. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-center">Verify Login</h1>
        <p className="mt-2 text-sm text-center text-gray-600">
          Enter the 6-digit code sent to your email
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 border border-red-100">
              {error}
            </div>
          )}

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-gray-700">One-Time Password</span>
            <input
              type="text"
              inputMode="numeric"
              autoFocus
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="text-center tracking-[0.5em] text-2xl font-bold rounded-md border border-gray-300 px-3 py-4 focus:outline-none focus:ring-2 focus:ring-black transition-all"
              placeholder="000000"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-black py-3 text-white font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {loading ? "Verifying..." : "Verify & Sign In"}
          </button>

          <button
            type="button"
            onClick={() => router.replace("/login")}
            className="w-full text-sm text-gray-500 hover:text-black transition-colors"
          >
            Back to login
          </button>
        </form>
      </div>
    </main>
  );
}
