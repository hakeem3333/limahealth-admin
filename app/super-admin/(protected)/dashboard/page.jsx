"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/axios";
import {
  Building2,
  Users2,
  ShieldAlert,
  UserPlus,
  ArrowUpRight,
  Activity,
  Globe,
  Database,
} from "lucide-react";

export default function SuperAdminDashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["super-admin-dashboard"],
    queryFn: async () => {
      const res = await api.get("/super-admin/dashboard");
      return res.data;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  if (isLoading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="p-4 bg-red-50 rounded-full text-red-600">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-black text-gray-900">
          Platform Sync Failure
        </h2>
        <p className="text-gray-500 max-w-xs text-center">
          Unable to establish a secure handshake with the core database.
        </p>
      </div>
    );
  }

  const metrics = [
    {
      title: "Organisations",
      value: data?.organisationsCount ?? data?.schoolsCount ?? 0,
      icon: <Building2 />,
      color: "text-[#0D3B7A]",
      bg: "bg-[#E8EEF8]",
    },
    {
      title: "Total Members",
      value: data?.membersCount ?? data?.studentsCount ?? 0,
      icon: <Users2 />,
      color: "text-[#0CAF87]",
      bg: "bg-[#EBF9F5]",
    },
    {
      title: "Org Admins",
      value: data?.orgAdminsCount ?? data?.adminsCount ?? 0,
      icon: <Activity />,
      color: "text-[#5F6B7A]",
      bg: "bg-gray-100",
    },
    {
      title: "Critical Alerts",
      value: data?.unresolvedAlertsCount ?? data?.alertsCount ?? 0,
      icon: <ShieldAlert />,
      color: "text-[#E63946]",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0D3B7A] mb-2">
            Global Oversight
          </h2>
          <h1 className="text-4xl font-black tracking-tighter text-gray-900">
            HQ Control Center
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Real-time status of the LimaHealth ecosystem.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-gray-400">
          <span className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            API: Stable
          </span>
          <span className="h-4 w-[1px] bg-gray-200" />
          <span>Region: North America</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m) => (
          <div
            key={m.title}
            className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-indigo-900/5 transition-all group"
          >
            <div
              className={`h-12 w-12 ${m.bg} ${m.color} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}
            >
              {m.icon}
            </div>
            <p className="text-4xl font-black tracking-tighter text-gray-900 mb-1">
              {m.value}
            </p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
              {m.title}
            </p>
          </div>
        ))}
      </div>

      {/* Operational Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ActionTile
          href="/super-admin/organisations"
          label="District Registry"
          desc="Approve, suspend, or audit organisation credentials."
          icon={<Globe className="h-5 w-5" />}
        />
        <ActionTile
          href="/super-admin/admins"
          label="Officer Management"
          desc="Assign global roles and review access logs."
          icon={<UserPlus className="h-5 w-5" />}
        />
        <ActionTile
          href="/super-admin/reports"
          label="Platform Analytics"
          desc="System-wide performance and engagement data."
          icon={<Database className="h-5 w-5" />}
        />
      </div>

      {/* Recent Global Activity (Static Placeholder for now) */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10">
        <h3 className="text-lg font-black tracking-tight mb-6">
          Recent System Events
        </h3>
        <div className="space-y-6">
          <ActivityItem
            text="New Organisation Approved: St. Jude High"
            time="2 mins ago"
            type="success"
          />
          <ActivityItem
            text="High Load Warning: Western District Database"
            time="14 mins ago"
            type="warning"
          />
          <ActivityItem
            text="Auth Protocol Updated: V2.4 Deployment"
            time="1 hour ago"
            type="info"
          />
        </div>
      </div>
    </div>
  );
}

/* -----------------------------
   UI Components
------------------------------ */

function ActionTile({ href, label, desc, icon }) {
  return (
    <Link
      href={href}
      className="group relative bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:bg-[#0D3B7A] transition-all duration-300 overflow-hidden"
    >
      <div className="relative z-10">
        <div className="h-10 w-10 bg-[#E8EEF8] text-[#0D3B7A] rounded-xl flex items-center justify-center mb-6 group-hover:bg-white/20 group-hover:text-white transition-colors">
          {icon}
        </div>
        <h3 className="text-xl font-black tracking-tight mb-2 group-hover:text-white transition-colors">
          {label}
        </h3>
        <p className="text-sm text-gray-500 font-medium group-hover:text-indigo-100 transition-colors leading-relaxed">
          {desc}
        </p>
      </div>
      <ArrowUpRight className="absolute top-8 right-8 h-5 w-5 text-gray-300 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
    </Link>
  );
}

function ActivityItem({ text, time, type }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-4">
        <div
          className={`h-2 w-2 rounded-full ${type === "success" ? "bg-green-500" : type === "warning" ? "bg-orange-500" : "bg-blue-500"}`}
        />
        <span className="text-sm font-bold text-gray-700">{text}</span>
      </div>
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest tabular-nums">
        {time}
      </span>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-10 animate-pulse">
      <div className="h-12 w-64 bg-gray-200 rounded-2xl" />
      <div className="grid grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 bg-gray-200 rounded-[2rem]" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-56 bg-gray-200 rounded-[2rem]" />
        ))}
      </div>
    </div>
  );
}
