"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";

export default function SuperAdminVerifyOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  const inputRef = useRef(null);

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
      // Hits the specific Super Admin verification endpoint
      await api.post("/auth/super/verify-otp", { otp });

      router.push("/super-admin/dashboard");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Invalid or expired security code.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBoxClick = () => {
    inputRef.current?.focus();
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl border border-slate-800">
        <div className="flex flex-col items-center mb-6">
          <div className="h-10 w-10 bg-slate-900 rounded-lg flex items-center justify-center mb-4">
            <span className="text-white font-bold">L</span>
          </div>
          <h1 className="text-2xl font-bold text-center text-slate-900">
            Security Verification
          </h1>
          <p className="mt-2 text-sm text-center text-slate-500">
            Code sent to Super Admin email. Expires in{" "}
            <span className="font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
              {formatTime(timeLeft)}
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 border border-red-100 text-center animate-shake">
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
                      ? "border-slate-900 ring-4 ring-slate-900/10 shadow-sm"
                      : "border-slate-200"
                  } ${otp[i] ? "bg-slate-50 text-slate-900" : "bg-white"}`}
                >
                  {otp[i] || ""}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || timeLeft === 0 || otp.length < 6}
            className="w-full rounded-md bg-slate-900 py-3 text-white font-medium hover:bg-slate-800 disabled:opacity-50 disabled:bg-slate-400 transition-all active:scale-[0.98]"
          >
            {loading ? "Authorizing..." : "Verify & Continue"}
          </button>

          <div className="flex flex-col gap-3 pt-2 text-center">
            {timeLeft === 0 && (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="text-sm font-semibold text-slate-900 hover:underline"
              >
                Request New Code
              </button>
            )}
            <button
              type="button"
              onClick={() => router.replace("/super-login")}
              className="text-sm text-slate-400 hover:text-slate-900 transition-colors"
            >
              Cancel and return
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
