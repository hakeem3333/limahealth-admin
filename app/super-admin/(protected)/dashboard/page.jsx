"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/axios";

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

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    console.error("Failed to load super admin dashboard:", error);
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load dashboard.
      </div>
    );
  }

  const stats = [
    { title: "Schools", value: data?.schoolsCount ?? 0 },
    { title: "Students", value: data?.studentsCount ?? 0 },
    { title: "Admins", value: data?.adminsCount ?? 0 },
    { title: "Active Alerts", value: data?.alertsCount ?? 0 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Platform-wide overview of LimaHealth
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} title={stat.title} value={stat.value} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickLink href="/super-admin/schools" label="Manage Schools" />
        <QuickLink href="/super-admin/admins" label="Manage Admins" />
        <QuickLink href="/super-admin/reports" label="View Reports" />
      </div>
    </div>
  );
}

/* -----------------------------
   UI Components
------------------------------ */

function StatCard({ title, value }) {
  return (
    <div className="rounded-xl border bg-white dark:bg-gray-900 p-4">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}

function QuickLink({ href, label }) {
  return (
    <Link
      href={href}
      className="rounded-xl border bg-white dark:bg-gray-900 p-6 text-center font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
    >
      {label}
    </Link>
  );
}
