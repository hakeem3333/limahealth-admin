"use client";

import Link from "next/link";
import { Lock, CreditCard, AlertCircle } from "lucide-react";

/**
 * SubscriptionGuard
 * @param {string} status - The current schoolStatus from the user object
 * @param {React.ReactNode} children - The protected dashboard content
 */
export default function SubscriptionGuard({ status, children }) {
  // Logic: Only "ACTIVE" status bypasses the guard.
  // We allow "PENDING_ACTIVATION" to be handled by the middleware redirect,
  // but we catch PAYMENT_REQUIRED and EXPIRED here for the "blurred" look.
  const isLocked = status === "PAYMENT_REQUIRED" || status === "EXPIRED";

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-[400px]">
      {/* 1. The Blurred Content Layer */}
      <div
        className="select-none blur-[6px] pointer-events-none opacity-40 grayscale transition-all duration-500"
        aria-hidden="true"
      >
        {children}
      </div>

      {/* 2. The Interactive Overlay */}
      <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 text-center animate-in zoom-in-95 duration-300">
          <div className="mx-auto h-16 w-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-6">
            {status === "EXPIRED" ? (
              <AlertCircle className="h-8 w-8 text-amber-600" />
            ) : (
              <Lock className="h-8 w-8 text-amber-600" />
            )}
          </div>

          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            {status === "EXPIRED"
              ? "Subscription Expired"
              : "Activation Required"}
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            Your school's access to student wellness data, wearable analytics,
            and counselor tools is currently locked. Complete your setup to
            continue.
          </p>

          <div className="mt-8 space-y-3">
            <Link
              href="/school-admin/billing"
              className="flex items-center justify-center w-full py-4 px-6 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 group"
            >
              <CreditCard className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Upgrade & Unlock Now
            </Link>

            <p className="text-xs text-gray-400">
              Need help with billing?{" "}
              <Link href="/support" className="text-blue-500 hover:underline">
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
