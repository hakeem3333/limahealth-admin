"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import Link from "next/link";
import {
  Loader2,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Clock,
  ShieldAlert,
  Inbox,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [schoolName, setSchoolName] = useState(""); // Holds the institution name
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const res = await api.post("/auth/admin/login", form);

      if (res.data?.status === "PENDING_APPROVAL") {
        setSchoolName(res.data?.schoolName || "");
        setIsPending(true);
        return;
      }

      router.replace("/login/verify-otp");
    } catch (err) {
      const errorMessage = err?.response?.data?.message || "";
      const errorStatus = err?.response?.status;
      const returnedSchoolName = err?.response?.data?.schoolName || "";

      if (
        errorStatus === 403 &&
        errorMessage.toUpperCase().includes("PENDING SUPER ADMIN APPROVAL")
      ) {
        setSchoolName(returnedSchoolName);
        setError("");
        setIsPending(true);
        return;
      }

      setError(errorMessage || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  // --- MODAL STATE ---
  if (isPending) {
    return (
      <main className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4 animate-in fade-in duration-500">
        <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl shadow-blue-900/5 border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-500">
          <div className="bg-amber-500 px-8 py-10 text-white relative overflow-hidden">
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight leading-none">
                  Access Pending
                </h2>
                <p className="text-amber-100 mt-2 text-xs font-medium opacity-90">
                  Institutional Review
                </p>
              </div>
            </div>
            <ShieldAlert className="absolute -right-4 -bottom-4 h-32 w-32 text-white/10 rotate-12" />
          </div>

          <div className="p-10 text-center">
            <div className="mx-auto h-20 w-20 bg-amber-50 rounded-3xl flex items-center justify-center mb-6">
              <Inbox className="h-10 w-10 text-amber-600" />
            </div>

            <p className="text-sm text-gray-600 font-medium leading-relaxed mb-8">
              The account for{" "}
              <span className="text-gray-900 font-black">{form.email}</span>
              {schoolName ? (
                <>
                  {" "}
                  for{" "}
                  <span className="text-blue-600 font-black">
                    {schoolName}
                  </span>{" "}
                </>
              ) : (
                " "
              )}
              is currently awaiting Super Admin approval.
              <br />
              <br />
              You will receive an activation email once your biometric oversight
              dashboard is ready.
            </p>

            <div className="space-y-4">
              <button
                onClick={() => setIsPending(false)}
                className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gray-950 py-5 text-white font-black uppercase tracking-[0.2em] text-[10px] hover:bg-blue-600 transition-all active:scale-[0.98]"
              >
                Return to Login
              </button>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                LimaHealth Security Protocol
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // --- LOGIN FORM STATE ---
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-[2.5rem] bg-white p-10 shadow-2xl shadow-blue-900/5 border border-gray-100">
        <div className="text-center mb-8">
          <div className="mx-auto h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
            <Lock className="h-7 w-7 text-blue-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">
            Sign In
          </h1>
          <p className="mt-2 text-sm text-gray-500 font-medium">
            LimaHealth Administration Portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-xs font-black uppercase tracking-widest text-red-600 border border-red-100 animate-in fade-in slide-in-from-top-1 text-center">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
              Email Address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="w-full rounded-2xl bg-gray-50/50 border-none ring-1 ring-gray-100 px-5 py-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-600 transition-all outline-none"
              placeholder="admin@school.edu"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                className="w-full rounded-2xl bg-gray-50/50 border-none ring-1 ring-gray-100 px-5 py-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-600 transition-all outline-none"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gray-950 py-5 text-white font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-600 transition-all flex justify-center items-center group shadow-xl"
          >
            {loading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <>
                Continue to OTP
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-[10px] font-black uppercase tracking-widest text-gray-400 border-t border-gray-50 pt-8">
          New Institution?{" "}
          <Link href="/signup" className="text-blue-600 ml-1">
            Register school
          </Link>
        </div>
      </div>
    </main>
  );
}
