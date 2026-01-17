"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");
  const params = useSearchParams();
  const token = params.get("token");
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    const verify = async () => {
      try {
        const res = await api.get("/auth/admin/verify-email", {
          params: { token },
        });
        if (res.data.verified) {
          setStatus("success");
          setMessage("Email verified successfully! Redirecting to login...");
          setTimeout(() => router.push("/login"), 3000);
        } else {
          setStatus("error");
          setMessage("Verification failed or token expired.");
        }
      } catch (err) {
        setStatus("error");
        setMessage(err?.response?.data?.message || "Failed to verify email.");
      }
    };

    verify();
  }, [token]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl p-8 shadow text-center space-y-6">
        {status === "loading" && (
          <p className="text-gray-600">Verifying your email...</p>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <p className="text-green-600 font-medium">{message}</p>
            <Link
              href="/login"
              className="inline-block bg-black text-white px-5 py-2 rounded-md hover:bg-gray-800"
            >
              Go to Login
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <p className="text-red-600 font-medium">{message}</p>
            <Link
              href="/login"
              className="inline-block bg-black text-white px-5 py-2 rounded-md hover:bg-gray-800"
            >
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
