"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

/* -----------------------------
   Page
------------------------------ */

export default function SchoolAdminDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["school-dashboard"],
    staleTime: 60_000,
    queryFn: async () => {
      const res = await api.get("/school/dashboard");
      return res.data;
    },
  });

  if (isLoading) return <DashboardSkeleton />;

  if (error || !data) {
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

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard
          title="Students"
          value={data.studentsCount}
          href="/school-admin/students"
        />
        <StatCard
          title="Counselors"
          value={data.counselorsCount}
          href="/school-admin/counselors"
        />
        <StatCard
          title="Active Wearables"
          value={data.activeWearables}
          href="/school-admin/wearables"
        />
        <StatCard
          title="High-Risk Alerts"
          value={data.highRiskAlerts}
          href="/school-admin/alerts"
          variant="danger"
        />
      </div>

      {/* Recent Alerts */}
      <section className="rounded-xl border bg-white p-4 dark:bg-gray-900">
        <h2 className="mb-3 text-lg font-semibold">Recent Alerts</h2>

        {data.recentAlerts.length === 0 ? (
          <p className="text-muted-foreground">No recent alerts 🎉</p>
        ) : (
          <ul className="space-y-2">
            {data.recentAlerts.map((alert) => (
              <li
                key={alert.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">{alert.studentName}</p>
                  <div className="mt-1">
                    <RiskBadge level={alert.riskLevel} />
                  </div>
                </div>

                <Link
                  href="/school-admin/alerts"
                  className="text-sm text-blue-600 hover:underline"
                >
                  View
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <QuickAction title="Add Student" href="/school-admin/students/new" />
        <QuickAction
          title="Add Counselor"
          href="/school-admin/counselors/new"
        />
        <QuickAction title="View Reports" href="/school-admin/reports" />
      </div>
    </div>
  );
}

/* -----------------------------
   UI Components
------------------------------ */

function StatCard({ title, value, href, variant = "default" }) {
  return (
    <Link
      href={href}
      className={`rounded-xl border p-4 transition hover:shadow ${
        variant === "danger" ? "border-red-500" : ""
      }`}
    >
      <p className="text-sm text-muted-foreground">{title}</p>
      <p
        className={`text-3xl font-bold ${
          variant === "danger" ? "text-red-600" : ""
        }`}
      >
        {value}
      </p>
    </Link>
  );
}

function QuickAction({ title, href }) {
  return (
    <Link
      href={href}
      className="rounded-xl border p-4 text-center font-medium transition hover:bg-gray-50 dark:hover:bg-gray-800"
    >
      {title}
    </Link>
  );
}

function RiskBadge({ level }) {
  const styles = {
    LOW: "bg-green-100 text-green-700",
    MEDIUM: "bg-yellow-100 text-yellow-800",
    HIGH: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${styles[level]}`}
    >
      {level}
    </span>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded bg-gray-200" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-gray-200" />
        ))}
      </div>

      <div className="h-40 rounded-xl bg-gray-200" />
    </div>
  );
}
