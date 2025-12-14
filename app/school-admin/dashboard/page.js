"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import Link from "next/link";

/**
 * School Admin Dashboard
 * Shows high-level overview of a single school
 */
export default function SchoolAdminDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["school-dashboard"],
    queryFn: async () => {
      const res = await api.get("/school/dashboard");
      return res.data;
    },
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <div className="text-red-600">Failed to load dashboard data.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">School Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of students, counselors, and wellness activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Students"
          value={data.studentsCount}
          link="/school-admin/students"
        />
        <StatCard
          title="Counselors"
          value={data.counselorsCount}
          link="/school-admin/counselors"
        />
        <StatCard
          title="Active Wearables"
          value={data.activeWearables}
          link="/school-admin/wearables"
        />
        <StatCard
          title="High-Risk Alerts"
          value={data.highRiskAlerts}
          link="/school-admin/alerts"
          danger
        />
      </div>

      {/* Alerts */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border p-4">
        <h2 className="text-lg font-semibold mb-3">Recent Alerts</h2>

        {data.recentAlerts.length === 0 ? (
          <p className="text-muted-foreground">No recent alerts 🎉</p>
        ) : (
          <ul className="space-y-2">
            {data.recentAlerts.map((alert: any) => (
              <li
                key={alert.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{alert.studentName}</p>
                  <p className="text-sm text-muted-foreground">
                    Risk Level: {alert.riskLevel}
                  </p>
                </div>

                <Link
                  href={`/school-admin/alerts`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  View
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickAction title="Add Student" href="/school-admin/students" />
        <QuickAction title="Add Counselor" href="/school-admin/counselors" />
        <QuickAction title="View Reports" href="/school-admin/reports" />
      </div>
    </div>
  );
}

/* -----------------------------
   Components
------------------------------ */

function StatCard({
  title,
  value,
  link,
  danger = false,
}: {
  title: string,
  value: number,
  link: string,
  danger?: boolean,
}) {
  return (
    <Link
      href={link}
      className={`rounded-xl border p-4 hover:shadow transition ${
        danger ? "border-red-500" : ""
      }`}
    >
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className={`text-3xl font-bold ${danger ? "text-red-600" : ""}`}>
        {value}
      </p>
    </Link>
  );
}

function QuickAction({ title, href }: { title: string, href: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border p-4 text-center font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
    >
      {title}
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl" />
        ))}
      </div>

      <div className="h-40 bg-gray-200 rounded-xl" />
    </div>
  );
}
