"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import { AlertCircle, Users, Activity, ShieldAlert, PlusCircle, TrendingUp } from "lucide-react";

const colorMap = {
  SCHOOL:   { iconColor: "text-blue-600",   iconBg: "bg-blue-50",   btn: "bg-blue-600 hover:bg-blue-700 shadow-blue-100",   badge: "bg-blue-50 text-blue-700 border-blue-100"   },
  COMPANY:  { iconColor: "text-violet-600", iconBg: "bg-violet-50", btn: "bg-violet-600 hover:bg-violet-700 shadow-violet-100", badge: "bg-violet-50 text-violet-700 border-violet-100" },
  HOSPITAL: { iconColor: "text-teal-600",   iconBg: "bg-teal-50",   btn: "bg-teal-600 hover:bg-teal-700 shadow-teal-100",   badge: "bg-teal-50 text-teal-700 border-teal-100"   },
  NGO:      { iconColor: "text-green-600",  iconBg: "bg-green-50",  btn: "bg-green-600 hover:bg-green-700 shadow-green-100",  badge: "bg-green-50 text-green-700 border-green-100"  },
};

export default function OrgAdminDashboard() {
  const { user, theme, orgType, orgName, memberLabel, membersLabel, supportLabel, supportsLabel } = useAuth();
  const c = colorMap[orgType] ?? colorMap.SCHOOL;

  const { data = {}, isLoading, error } = useQuery({
    queryKey: ["org-dashboard"],
    queryFn: async () => (await api.get("/org/dashboard")).data,
    retry: (count, err) => err?.response?.status === 402 ? false : count < 3,
  });

  if (isLoading) return <DashboardSkeleton />;
  const isPaymentRequired = error?.response?.status === 402;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="text-3xl">{theme?.icon}</span>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              {orgName || theme?.orgLabel} Dashboard
            </h1>
          </div>
          <p className="text-gray-500 font-medium">{theme?.tagline}</p>
        </div>
        <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest border ${
          user?.org?.status === "ACTIVE"
            ? "bg-green-50 text-green-700 border-green-100"
            : "bg-amber-50 text-amber-700 border-amber-100"
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full ${user?.org?.status === "ACTIVE" ? "bg-green-600 animate-pulse" : "bg-amber-500"}`} />
          {user?.org?.status?.replace("_", " ") ?? "Unknown"}
        </div>
      </div>

      <SubscriptionGuard status={user?.org?.status}>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard title={`Total ${membersLabel}`}  value={data.studentsCount ?? data.membersCount}      icon={<Users className={`w-5 h-5 ${c.iconColor}`} />}         iconBg={c.iconBg} link="/org-admin/members"       danger={false} />
          <StatCard title={`Active ${supportsLabel}`} value={data.counselorsCount ?? data.supportCount}    icon={<ShieldAlert className={`w-5 h-5 ${c.iconColor}`} />}   iconBg={c.iconBg} link="/org-admin/support-staff"  danger={false} />
          <StatCard title="Live Wearables"            value={data.activeWearables}                          icon={<Activity className="w-5 h-5 text-emerald-600" />}      iconBg="bg-emerald-50" link="/org-admin/wearables" danger={false} />
          <StatCard title="Critical Alerts"           value={data.highRiskAlerts}                           icon={<AlertCircle className="w-5 h-5 text-red-600" />}       iconBg="bg-red-50"     link="/org-admin/alerts"    danger />
        </div>

        {/* Recent Alerts */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="px-7 py-5 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-gray-900">Recent Risk Alerts</h2>
              <p className="text-[11px] text-gray-400 mt-0.5 font-medium uppercase tracking-widest">Latest flagged wellbeing incidents</p>
            </div>
            <Link href="/org-admin/alerts" className={`text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl border ${c.badge} transition-all hover:shadow-sm`}>
              View All
            </Link>
          </div>
          <div className="p-6">
            {!data.recentAlerts || data.recentAlerts.length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center gap-3">
                <span className="text-4xl">🎉</span>
                <p className="text-gray-400 font-bold">No recent alerts — all clear!</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-gray-400 font-black">
                    <th className="pb-4">{memberLabel}</th>
                    <th className="pb-4">Risk Level</th>
                    <th className="pb-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.recentAlerts.map((alert) => (
                    <tr key={alert.id} className="group">
                      <td className="py-4 font-bold text-gray-900">{alert.studentName || alert.memberName}</td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border ${
                          alert.riskLevel === "CRITICAL" ? "bg-red-50 text-red-700 border-red-100" : "bg-amber-50 text-amber-700 border-amber-100"
                        }`}>{alert.riskLevel}</span>
                      </td>
                      <td className="py-4 text-right">
                        <Link href="/org-admin/alerts" className={`text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity ${c.iconColor}`}>
                          Respond →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <QuickAction title={`Register ${memberLabel}`}  icon={<PlusCircle className="w-4 h-4" />} href="/org-admin/members"      colorClass={c.btn} />
          <QuickAction title={`Onboard ${supportLabel}`}  icon={<PlusCircle className="w-4 h-4" />} href="/org-admin/support-staff" colorClass={c.btn} />
          <QuickAction title="System Reports"             icon={<TrendingUp className="w-4 h-4" />}  href="/org-admin/reports"       colorClass={c.btn} />
        </div>
      </SubscriptionGuard>

      {error && !isPaymentRequired && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-bold flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Error loading metrics. Please refresh or contact support.
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, link, icon, iconBg, danger }) {
  return (
    <Link href={link} className={`group bg-white rounded-2xl border p-6 transition-all hover:shadow-xl hover:-translate-y-1 ${danger ? "border-red-100" : "border-gray-100"}`}>
      <div className="flex items-center justify-between mb-5">
        <div className={`p-2.5 rounded-xl ${iconBg}`}>{icon}</div>
        <svg className="w-4 h-4 text-gray-200 group-hover:text-current transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</p>
      <p className={`text-4xl font-black mt-1 tracking-tight ${danger ? "text-red-600" : "text-gray-900"}`}>{value ?? 0}</p>
    </Link>
  );
}

function QuickAction({ title, icon, href, colorClass }) {
  return (
    <Link href={href} className={`flex items-center justify-center gap-2.5 rounded-2xl px-6 py-4 text-white text-sm font-black shadow-lg transition-all hover:-translate-y-0.5 ${colorClass}`}>
      {icon}{title}
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-12 w-64 bg-gray-200 rounded-lg" />
      <div className="grid grid-cols-4 gap-5">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-36 bg-gray-200 rounded-2xl" />)}</div>
      <div className="h-72 bg-gray-200 rounded-3xl" />
      <div className="grid grid-cols-3 gap-5">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 bg-gray-200 rounded-2xl" />)}</div>
    </div>
  );
}
