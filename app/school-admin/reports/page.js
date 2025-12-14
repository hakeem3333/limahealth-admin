"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

/**
 * School Admin – Reports & Analytics
 */
export default function ReportsPage() {
  const [range, setRange] = (useState < "7d") | "30d" | ("90d" > "30d");

  const { data, isLoading, error } = useQuery({
    queryKey: ["school-reports", range],
    queryFn: async () => {
      const res = await api.get("/school/reports", {
        params: { range },
      });
      return res.data;
    },
  });

  if (isLoading) return <ReportsSkeleton />;

  if (error) {
    return <div className="text-red-600">Failed to load reports.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground">
            School-level wellbeing analytics
          </p>
        </div>

        {/* Date Range */}
        <RangeSelector value={range} onChange={setRange} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Students Monitored">{data.studentsCount}</StatCard>

        <StatCard title="High-Risk Students">{data.highRiskCount}</StatCard>

        <StatCard title="Alerts Generated">{data.alertsCount}</StatCard>

        <StatCard title="Interventions">{data.interventionsCount}</StatCard>
      </div>

      {/* Risk Distribution */}
      <Section title="Risk Distribution">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <RiskCard level="LOW" value={data.riskDistribution.LOW} />
          <RiskCard level="MEDIUM" value={data.riskDistribution.MEDIUM} />
          <RiskCard level="HIGH" value={data.riskDistribution.HIGH} />
        </div>
      </Section>

      {/* Counselor Activity */}
      <Section title="Counselor Activity">
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <TableHead>Counselor</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Alerts Handled</TableHead>
                <TableHead>Interventions</TableHead>
              </tr>
            </thead>
            <tbody>
              {data.counselorActivity.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-6 text-center text-muted-foreground"
                  >
                    No activity recorded.
                  </td>
                </tr>
              ) : (
                data.counselorActivity.map((c: any) => (
                  <tr key={c.id} className="border-t">
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.students}</TableCell>
                    <TableCell>{c.alertsHandled}</TableCell>
                    <TableCell>{c.interventions}</TableCell>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Notes */}
      <p className="text-xs text-muted-foreground">
        Reports are anonymized and aggregated to protect student privacy.
      </p>
    </div>
  );
}

/* -----------------------------
   UI Components
------------------------------ */

function RangeSelector({
  value,
  onChange,
}: {
  value: "7d" | "30d" | "90d",
  onChange: (v: any) => void,
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border px-3 py-2 text-sm"
    >
      <option value="7d">Last 7 days</option>
      <option value="30d">Last 30 days</option>
      <option value="90d">Last 90 days</option>
    </select>
  );
}

function Section({ title, children }: any) {
  return (
    <div className="rounded-xl border bg-white dark:bg-gray-900 p-4">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function StatCard({ title, children }: any) {
  return (
    <div className="rounded-xl border bg-white dark:bg-gray-900 p-4">
      <p className="text-sm text-muted-foreground mb-2">{title}</p>
      <p className="text-2xl font-bold">{children}</p>
    </div>
  );
}

function RiskCard({
  level,
  value,
}: {
  level: "LOW" | "MEDIUM" | "HIGH",
  value: number,
}) {
  const styles = {
    LOW: "bg-green-100 text-green-700",
    MEDIUM: "bg-yellow-100 text-yellow-800",
    HIGH: "bg-red-100 text-red-700",
  };

  return (
    <div className={`rounded-lg p-4 font-medium ${styles[level]}`}>
      {level}: {value}
    </div>
  );
}

function TableHead({ children }: any) {
  return (
    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
      {children}
    </th>
  );
}

function TableCell({ children }: any) {
  return <td className="px-4 py-3">{children}</td>;
}

function ReportsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-40 bg-gray-200 rounded" />
      <div className="h-12 w-64 bg-gray-200 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl" />
        ))}
      </div>
      <div className="h-48 bg-gray-200 rounded-xl" />
    </div>
  );
}
