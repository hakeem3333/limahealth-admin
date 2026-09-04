"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { api } from "@/lib/axios";
import { playfairDisplay } from "@/lib/fonts";

export default function SuperAdminVerifyOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

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
      await api.post("/super-admin/verify-otp", { otp });
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
    <main className={`${playfairDisplay.variable} min-h-screen flex items-center justify-center bg-lh-navy px-4`}>
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-2xl">
        <div className="flex flex-col items-center mb-6">
          <div className="h-14 w-14 bg-lh-navy rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-lh-navy/30">
            <ShieldCheck className="h-7 w-7 text-lh-accent" />
          </div>
          <h1 className="font-display text-2xl font-bold text-center text-lh-navy">
            Security Verification
          </h1>
          <p className="mt-2 text-sm text-center text-gray-500">
            Code sent to Super Admin email. Expires in{" "}
            <span className="font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
              {formatTime(timeLeft)}
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100 text-center">
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

            <div className="flex justify-between gap-2" onClick={handleBoxClick}>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`w-12 h-14 border-2 rounded-xl flex items-center justify-center text-xl font-bold transition-all ${
                    otp.length === i
                      ? "border-lh-teal ring-4 ring-lh-teal/10 shadow-sm"
                      : "border-gray-200"
                  } ${otp[i] ? "bg-gray-50 text-lh-navy" : "bg-white"}`}
                >
                  {otp[i] || ""}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || timeLeft === 0 || otp.length < 6}
            className="w-full rounded-xl bg-lh-navy py-4 text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-lh-teal disabled:opacity-50 disabled:bg-gray-400 transition-all active:scale-[0.98] shadow-xl shadow-lh-navy/10"
          >
            {loading ? "Authorizing..." : "Verify & Continue"}
          </button>

          <div className="flex flex-col gap-3 pt-2 text-center">
            {timeLeft === 0 && (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="text-sm font-semibold text-lh-teal hover:underline"
              >
                Request New Code
              </button>
            )}
            <button
              type="button"
              onClick={() => router.replace("/super-admin/login")}
              className="text-sm text-gray-400 hover:text-lh-teal transition-colors"
            >
              Cancel and return
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
