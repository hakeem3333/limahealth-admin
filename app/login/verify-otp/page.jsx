"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(600);

  const inputRef = useRef(null);

  // Timer logic
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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
      router.push("/school-admin/dashboard");
    } catch (err) {
      // 🌐 Network / backend unreachable
      if (err?.type === "NETWORK_ERROR") {
        setError("Unable to connect to the server. Please try again later.");
        return;
      }

      // 🔐 OTP validation / expiry
      setError(err?.response?.data?.message || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  const handleBoxClick = () => {
    inputRef.current?.focus();
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-center text-gray-900">
          Verify Login
        </h1>
        <p className="mt-2 text-sm text-center text-gray-600">
          We sent a code to your email. It expires in{" "}
          <span className="font-semibold text-orange-600">
            {formatTime(timeLeft)}
          </span>
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 border border-red-100 text-center">
              {error}
            </div>
          )}

          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="absolute inset-0 opacity-0 cursor-default"
              autoFocus
            />

            <div
              className="flex justify-between gap-2"
              onClick={handleBoxClick}
            >
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`w-12 h-14 border-2 rounded-lg flex items-center justify-center text-xl font-bold transition-all ${
                    otp.length === i
                      ? "border-black ring-2 ring-black/5"
                      : "border-gray-200"
                  } ${otp[i] ? "bg-gray-50" : "bg-white"}`}
                >
                  {otp[i] || ""}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || timeLeft === 0 || otp.length < 6}
            className="w-full rounded-md bg-black py-3 text-white font-medium hover:bg-gray-800 disabled:opacity-50 disabled:bg-gray-400 transition-colors"
          >
            {loading
              ? "Verifying..."
              : timeLeft === 0
                ? "Code Expired"
                : "Verify & Sign In"}
          </button>

          <div className="flex flex-col gap-3 pt-2">
            {timeLeft === 0 && (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Resend Code
              </button>
            )}
            <button
              type="button"
              onClick={() => router.replace("/login")}
              className="text-sm text-gray-500 hover:text-black transition-colors"
            >
              Back to login
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
