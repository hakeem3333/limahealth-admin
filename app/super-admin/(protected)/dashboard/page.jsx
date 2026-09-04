"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Globe, UserPlus, Database, ArrowUpRight } from "lucide-react";
import { api } from "@/lib/axios";
import { StatCard } from "@/components/super-admin/ui/Card";

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
    console.error("Failed to load super admin dashboard:", error);
    return (
      <div className="rounded-2xl bg-white shadow-card p-12 text-center">
        <p className="text-red-500 font-semibold">Failed to load dashboard.</p>
      </div>
    );
  }

  const stats = [
    { title: "Organisations", value: data?.organisationsCount ?? 0 },
    { title: "Members", value: data?.membersCount ?? 0 },
    { title: "Org Admins", value: data?.orgAdminsCount ?? 0 },
    { title: "Active Alerts", value: data?.unresolvedAlertsCount ?? 0 },
  ];

  return (
    <div className="space-y-10">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-lh-teal mb-2">
          Global Oversight
        </p>
        <h1 className="font-display text-3xl font-bold text-lh-navy">
          Super Admin Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Platform-wide overview of LimaHealth
        </p>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <StatCard key={stat.title} title={stat.title} value={stat.value} />
        ))}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <QuickLink
          href="/super-admin/organisations"
          label="Organisations"
          desc="Verify, suspend, or audit organisation credentials."
          icon={<Globe className="h-5 w-5" />}
        />
        <QuickLink
          href="/super-admin/admins"
          label="Global Admins"
          desc="Manage org-admin accounts across the platform."
          icon={<UserPlus className="h-5 w-5" />}
        />
        <QuickLink
          href="/super-admin/reports"
          label="Platform Analytics"
          desc="System-wide performance and engagement data."
          icon={<Database className="h-5 w-5" />}
        />
      </section>
    </div>
  );
}

function QuickLink({ href, label, desc, icon }) {
  return (
    <Link
      href={href}
      className="group rounded-2xl bg-white p-7 shadow-card hover:shadow-lg transition-shadow relative overflow-hidden"
    >
      <div className="h-10 w-10 bg-lh-teal-light text-lh-teal rounded-xl flex items-center justify-center mb-5">
        {icon}
      </div>
      <h3 className="font-display text-lg font-bold text-lh-navy mb-1.5">{label}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
      <ArrowUpRight className="absolute top-7 right-7 h-5 w-5 text-gray-300 group-hover:text-lh-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-10 animate-pulse">
      <div className="h-10 w-72 bg-gray-200 rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-36 bg-gray-200 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
