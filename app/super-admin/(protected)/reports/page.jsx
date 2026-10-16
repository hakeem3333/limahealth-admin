"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/axios";

export default function SuperAdminReportsPage() {
  const [range, setRange] = useState("30d");

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["super-admin-reports", range],
    queryFn: async () => {
      const res = await api.get("/super-admin/reports", {
        params: { range },
      });
      return res.data;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">Loading reports...</p>
      </div>
    );
  }

  if (error) {
    console.error("Failed to load reports:", error);
    return (
      <div className="p-8 text-center text-red-500 dark:text-red-400">
        Failed to load reports.
      </div>
    );
  }

  const stats = [
    { title: "Schools", value: data?.schools ?? 0 },
    { title: "Students", value: data?.students ?? 0 },
    { title: "Admins", value: data?.admins ?? 0 },
    { title: "Alerts Triggered", value: data?.alerts ?? 0 },
    { title: "High Risk Students", value: data?.highRiskStudents ?? 0 },
    { title: "Wearables Linked", value: data?.wearableLinked ?? 0 },
  ];

  const isEmpty = stats.every((stat) => stat.value === 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-lh-navy dark:text-white">Platform Reports</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Aggregated insights across all schools
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Date Range:</span>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 dim:bg-white dark:text-white px-3 py-1 text-sm"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>

        {isFetching && (
          <span className="text-xs text-gray-500 dark:text-gray-400">Updating…</span>
        )}
      </div>

      {/* Empty State */}
      {isEmpty && (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center text-gray-500 dark:text-gray-400">
          No activity recorded for the selected period.
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} title={stat.title} value={stat.value} />
        ))}
      </div>

      {/* Trends Placeholder */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 dim:border-slate-300/70 bg-white dark:bg-gray-900 dim:bg-white p-6">
        <h2 className="font-semibold mb-2">Trends</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Charts (stress trends, alert frequency, wearable adoption) will appear
          here.
        </p>
      </div>
    </div>
  );
}

/* -----------------------------
   UI Components
------------------------------ */

function StatCard({ title, value }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 dim:border-slate-300/70 bg-white dark:bg-gray-900 dim:bg-white p-4">
      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {title}
      </p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
