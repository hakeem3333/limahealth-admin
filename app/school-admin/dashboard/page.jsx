"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import SubscriptionGuard from "@/components/SubscriptionGuard"; // The guard we made
import {
  AlertCircle,
  Users,
  Activity,
  ShieldAlert,
  PlusCircle,
} from "lucide-react";

export default function SchoolAdminDashboard() {
  const { user } = useAuth();

  const {
    data = {},
    isLoading,
    error,
  } = useQuery({
    queryKey: ["school-dashboard"],
    queryFn: async () => {
      const res = await api.get("/school/dashboard");
      return res.data;
    },
    // Don't retry if it's a payment issue
    retry: (failureCount, error) => {
      if (error?.response?.status === 402) return false;
      return failureCount < 3;
    },
  });

  if (isLoading) return <DashboardSkeleton />;

  // Special handling for Payment Required errors
  const isPaymentRequired = error?.response?.status === 402;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {user?.school?.name || "School"} Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Monitoring wellness and safety for your institution.
          </p>
        </div>

        {/* Quick Access Status Badge */}
        <div
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border ${
            user?.schoolStatus === "ACTIVE"
              ? "bg-green-50 text-green-700 border-green-100"
              : "bg-amber-50 text-amber-700 border-amber-100"
          }`}
        >
          Status: {user?.schoolStatus?.replace("_", " ")}
        </div>
      </div>

      <SubscriptionGuard status={user?.schoolStatus}>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Students"
            value={data.studentsCount}
            icon={<Users className="w-5 h-5 text-blue-600" />}
            link="/school-admin/students"
          />
          <StatCard
            title="Active Counselors"
            value={data.counselorsCount}
            icon={<ShieldAlert className="w-5 h-5 text-purple-600" />}
            link="/school-admin/counselors"
          />
          <StatCard
            title="Live Wearables"
            value={data.activeWearables}
            icon={<Activity className="w-5 h-5 text-green-600" />}
            link="/school-admin/wearables"
          />
          <StatCard
            title="Critical Alerts"
            value={data.highRiskAlerts}
            icon={<AlertCircle className="w-5 h-5 text-red-600" />}
            link="/school-admin/alerts"
            danger
          />
        </div>

        {/* Alerts Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              Recent Risk Alerts
            </h2>
            <Link
              href="/school-admin/alerts"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              View All
            </Link>
          </div>

          <div className="p-6">
            {!data.recentAlerts || data.recentAlerts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No recent alerts recorded 🎉</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                      <th className="pb-4">Student</th>
                      <th className="pb-4">Risk Level</th>
                      <th className="pb-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.recentAlerts.map((alert) => (
                      <tr key={alert.id} className="group">
                        <td className="py-4 font-medium text-gray-900">
                          {alert.studentName}
                        </td>
                        <td className="py-4">
                          <span
                            className={`px-2 py-1 rounded-md text-xs font-bold ${
                              alert.riskLevel === "CRITICAL"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {alert.riskLevel}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <Link
                            href={`/school-admin/alerts`}
                            className="text-blue-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Respond
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickAction
            title="Register Student"
            icon={<PlusCircle className="w-4 h-4" />}
            href="/school-admin/students"
          />
          <QuickAction
            title="Onboard Counselor"
            icon={<PlusCircle className="w-4 h-4" />}
            href="/school-admin/counselors"
          />
          <QuickAction
            title="System Reports"
            icon={<Activity className="w-4 h-4" />}
            href="/school-admin/reports"
          />
        </div>
      </SubscriptionGuard>

      {/* Fallback Error (If not payment related) */}
      {error && !isPaymentRequired && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
          Error loading metrics. Please refresh or contact support.
        </div>
      )}
    </div>
  );
}

/* -----------------------------
    Components
----------------------------- */

function StatCard({ title, value, link, icon, danger = false }) {
  return (
    <Link
      href={link}
      className={`group bg-white rounded-2xl border p-6 transition-all hover:shadow-lg hover:-translate-y-1 ${
        danger ? "border-red-100 bg-red-50/10" : "border-gray-100"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`p-2 rounded-lg ${danger ? "bg-red-100" : "bg-blue-50"}`}
        >
          {icon}
        </div>
        <ArrowRightIcon className="w-4 h-4 text-gray-300 group-hover:text-blue-600 transition-colors" />
      </div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p
        className={`text-3xl font-bold mt-1 ${danger ? "text-red-600" : "text-gray-900"}`}
      >
        {value || 0}
      </p>
    </Link>
  );
}

function ArrowRightIcon(props) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
}

function QuickAction({ title, icon, href }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white p-4 font-bold text-gray-700 hover:bg-gray-50 hover:border-blue-200 transition-all"
    >
      {icon}
      {title}
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-12 w-64 bg-gray-200 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
        ))}
      </div>
      <div className="h-64 bg-gray-200 rounded-2xl" />
    </div>
  );
}
