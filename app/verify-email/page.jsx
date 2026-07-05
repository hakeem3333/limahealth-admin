"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  MailCheck,
} from "lucide-react";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");
  const params = useSearchParams();
  const token = params.get("token");
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage(
        "Security token missing. Please use the original link from your email.",
      );
      return;
    }

    const verify = async () => {
      try {
        const res = await api.get("/auth/admin/verify-email", {
          params: { token },
        });

        if (res.data.verified) {
          setStatus("success");
          setMessage("Your account has been successfully authorized.");
          setTimeout(() => router.push("/login"), 3500);
        } else {
          setStatus("error");
          setMessage(
            "Verification failed. The link may have expired or already been used.",
          );
        }
      } catch (err) {
        setStatus("error");
        setMessage(
          err?.response?.data?.message ||
            "Failed to establish a secure connection.",
        );
      }
    };

    verify();
  }, [token, router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4 selection:bg-blue-100">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-xl shadow-blue-900/5 border border-gray-100 text-center relative overflow-hidden">
        {/* Verification Status States */}
        <div className="space-y-8 py-4">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="h-20 w-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600">
                <Loader2 className="h-10 w-10 animate-spin" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                  Authorizing Identity
                </h1>
                <p className="text-gray-500 mt-2 font-medium italic">
                  Establishing secure institutional handshake...
                </p>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500">
              <div className="h-24 w-24 bg-green-50 rounded-[2.5rem] flex items-center justify-center text-green-600 shadow-inner">
                <MailCheck className="h-12 w-12" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                  Account Verified
                </h1>
                <p className="text-green-700/70 font-bold text-sm uppercase tracking-widest">
                  {message}
                </p>
                <p className="text-gray-400 text-xs font-medium">
                  Redirecting to management portal...
                </p>
              </div>
              <Link
                href="/login"
                className="group flex items-center justify-center gap-2 w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-lg hover:shadow-blue-200"
              >
                Enter Portal
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="h-20 w-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-600">
                <XCircle className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                  Security Error
                </h1>
                <p className="text-red-600 font-bold text-sm px-4">{message}</p>
              </div>
              <div className="flex flex-col w-full gap-3 pt-4">
                <Link
                  href="/signup"
                  className="bg-gray-50 text-gray-700 py-4 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-colors border border-gray-100"
                >
                  Request New Link
                </Link>
                <Link
                  href="/login"
                  className="text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-gray-900 transition-colors"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Branding Footer */}
        <div className="pt-8 flex items-center justify-center gap-2 border-t border-gray-50 mt-4">
          <ShieldCheck className="h-4 w-4 text-blue-600" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            LimaHealth Security Protocol
          </span>
        </div>
      </div>
    </main>
  );
}
