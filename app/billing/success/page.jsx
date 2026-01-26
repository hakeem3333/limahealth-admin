"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function SuccessPage() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Invalidate the 'me' and 'subscription' queries
    // to ensure the UI updates to "Active" status
    queryClient.invalidateQueries({ queryKey: ["me"] });
  }, [queryClient]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-3 rounded-full">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-8">
          Thank you for subscribing. Your school account is now being activated.
          It may take a minute for the status to update.
        </p>

        <Link
          href="/school-admin/dashboard"
          className="w-full flex items-center justify-center py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors group"
        >
          Go to Dashboard
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>

        <p className="mt-6 text-sm text-gray-400">
          A receipt has been sent to your email.
        </p>
      </div>
    </div>
  );
}
