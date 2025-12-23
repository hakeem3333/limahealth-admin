"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/axios";

export default function SuperAdminReportsPage() {
  const [range, setRange] = useState("30d");

  const { data, isLoading, error } = useQuery({
    queryKey: ["super-admin-reports", range],
    queryFn: async () => {
      const res = await api.get("/super-admin/reports", {
        params: { range },
      });
      return res.data;
    },
  });

  if (isLoading) return <p>Loading reports...</p>;
  if (error) return <p>Failed to load reports.</p>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Platform Reports</h1>
        <p className="text-sm text-muted-foreground">
          Aggregated insights across all schools
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Date Range:</span>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="rounded-md border px-3 py-1 text-sm"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Schools" value={data.schools} />
        <StatCard title="Students" value={data.students} />
        <StatCard title="Admins" value={data.admins} />
        <StatCard title="Alerts Triggered" value={data.alerts} />
        <StatCard title="High Risk Students" value={data.highRiskStudents} />
        <StatCard title="Wearables Linked" value={data.wearableLinked} />
      </div>

      {/* Placeholder for Charts */}
      <div className="rounded-xl border bg-white dark:bg-gray-900 p-6">
        <h2 className="font-semibold mb-2">Trends</h2>
        <p className="text-sm text-muted-foreground">
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
    <div className="rounded-xl border bg-white dark:bg-gray-900 p-4">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">
        {title}
      </p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
