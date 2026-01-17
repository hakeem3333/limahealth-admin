"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Ensure temp token exists
  useEffect(() => {
    const tempToken = sessionStorage.getItem("admin_temp_token");
    if (!tempToken) {
      router.replace("/login");
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Enter the 6-digit code sent to your email");
      return;
    }

    try {
      setLoading(true);

      const tempToken = sessionStorage.getItem("admin_temp_token");

      const res = await api.post(
        "/auth/admin/verify-otp",
        { otp },
        {
          headers: {
            Authorization: `Bearer ${tempToken}`,
          },
        }
      );

      // Save final access token
      localStorage.setItem("access_token", res.data.token);

      // Cleanup
      sessionStorage.removeItem("admin_temp_token");

      router.push("/dashboard");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Invalid or expired code. Please try again."
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
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">One-Time Password</span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, ""))
              }
              className="text-center tracking-widest text-lg rounded-md border px-3 py-3 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="••••••"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-black py-3 text-white font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify & Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
