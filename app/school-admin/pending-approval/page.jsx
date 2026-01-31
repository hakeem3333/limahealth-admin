"use client";

import { useRouter } from "next/navigation";
import { Clock, ShieldCheck, Mail, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth"; // Assuming you have an auth hook
import Link from "next/link";

export default function PendingApprovalPage() {
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          {/* Animated Icon Container */}
          <div className="mx-auto h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <Clock className="h-10 w-10 text-blue-600 animate-pulse" />
          </div>

          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Account Pending Approval
          </h2>
          <p className="mt-4 text-gray-600 text-lg">
            Hi{" "}
            <span className="font-semibold text-gray-800">
              {user?.firstName}
            </span>
            , your registration for{" "}
            <span className="font-semibold text-gray-800">
              {user?.school?.name || "your school"}
            </span>{" "}
            is currently being reviewed.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <div className="flex items-start p-4 bg-gray-50 rounded-lg border border-gray-200">
            <ShieldCheck className="h-6 w-6 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-gray-900">
                Security Verification
              </h4>
              <p className="text-sm text-gray-500">
                Our team manually reviews every school to ensure student data
                privacy and security.
              </p>
            </div>
          </div>

          <div className="flex items-start p-4 bg-gray-50 rounded-lg border border-gray-200">
            <Mail className="h-6 w-6 text-orange-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-gray-900">Next Steps</h4>
              <p className="text-sm text-gray-500">
                You will receive an email notification once your account is
                activated. Usually within 24-48 hours.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex flex-col gap-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
          >
            Check Status Again
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </button>
        </div>

        <p className="text-center text-xs text-gray-400">
          Need help?{" "}
          <Link href="/contact" className="text-blue-500 hover:underline">
            Contact LimaHealth Support
          </Link>
        </p>
      </div>
    </div>
  );
}
