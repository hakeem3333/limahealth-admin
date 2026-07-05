"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import {
  BarChart3,
  Users,
  AlertTriangle,
  MessageSquare,
  Calendar,
  ShieldCheck,
  TrendingUp,
  Download,
} from "lucide-react";

export default function ReportsPage() {
  const { user } = useAuth();
  const [range, setRange] = useState("7d");

  const { data, isLoading, error } = useQuery({
    queryKey: ["school-reports", range],
    queryFn: async () => {
      const res = await api.get("/org/reports", { params: { range } });
      return res.data;
    },
  });

  if (isLoading) return <ReportsSkeleton />;

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-3xl border border-red-100 text-red-600">
        <AlertTriangle className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p className="font-bold">Failed to generate reports.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-sm underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <BarChart3 className="text-blue-600 h-8 w-8" />
            School Analytics
          </h1>
          <p className="text-gray-500 mt-1 font-medium">
            Aggregated wellbeing trends and staff performance metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
            <Download className="h-4 w-4" />
            Export PDF
          </button>
          <RangeSelector value={range} onChange={setRange} />
        </div>
      </div>

      <SubscriptionGuard status={user?.orgStatus}>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Students"
            icon={<Users className="text-blue-600" />}
          >
            {data.studentsCount}
          </StatCard>
          <StatCard
            title="High-Risk Alerts"
            icon={<AlertTriangle className="text-orange-500" />}
          >
            {data.highRiskCount}
          </StatCard>
          <StatCard
            title="System Alerts"
            icon={<TrendingUp className="text-purple-500" />}
          >
            {data.alertsCount}
          </StatCard>
          <StatCard
            title="Interventions"
            icon={<MessageSquare className="text-green-600" />}
          >
            {data.interventionsCount}
          </StatCard>
        </div>

        {/* Risk Distribution Visualizer */}
        <Section
          title="Institutional Risk Distribution"
          icon={<ShieldCheck className="h-5 w-5 text-blue-600" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
            <RiskMetric
              level="LOW"
              value={data.riskDistribution.LOW}
              total={data.studentsCount}
              color="bg-green-500"
            />
            <RiskMetric
              level="MEDIUM"
              value={data.riskDistribution.MEDIUM}
              total={data.studentsCount}
              color="bg-amber-500"
            />
            <RiskMetric
              level="HIGH"
              value={data.riskDistribution.HIGH}
              total={data.studentsCount}
              color="bg-red-500"
            />
          </div>
        </Section>

        {/* Counselor Activity Performance */}
        <Section title="Counselor Caseload & Activity">
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <TableHead>Counselor</TableHead>
                  <TableHead>Active Students</TableHead>
                  <TableHead>Alerts Resolved</TableHead>
                  <TableHead>Total Interventions</TableHead>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.counselorActivity.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-12 text-center text-gray-400 font-medium"
                    >
                      No counselor data available for this range.
                    </td>
                  </tr>
                ) : (
                  data.counselorActivity.map((c) => (
                    <tr
                      key={c.id}
                      className="group hover:bg-gray-50/50 transition-colors"
                    >
                      <TableCell className="font-bold text-gray-900">
                        {c.name}
                      </TableCell>
                      <TableCell className="text-gray-600 font-medium">
                        {c.students}
                      </TableCell>
                      <TableCell className="text-gray-600 font-medium">
                        {c.alertsHandled}
                      </TableCell>
                      <TableCell>
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-black">
                          {c.interventions} ACTIONS
                        </span>
                      </TableCell>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Section>

        <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
          <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">
            Anonymized Data Compliance: Aggregated to protect individual student
            PHI.
          </p>
        </div>
      </SubscriptionGuard>
    </div>
  );
}

/* -----------------------------
   UI Components
----------------------------- */

function RangeSelector({ value, onChange }) {
  return (
    <div className="relative">
      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer shadow-sm"
      >
        <option value="7d">Last 7 Days</option>
        <option value="30d">Last 30 Days</option>
        <option value="90d">Last quarter</option>
      </select>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function StatCard({ title, children, icon }) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-transform hover:scale-[1.02]">
      <div className="p-3 bg-gray-50 rounded-2xl w-fit mb-4">{icon}</div>
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
        {title}
      </p>
      <p className="text-3xl font-black text-gray-900 mt-1">{children}</p>
    </div>
  );
}

function RiskMetric({ level, value, total, color }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <span className="text-xs font-black text-gray-400 tracking-tighter uppercase">
          {level} Risk
        </span>
        <span className="text-lg font-black text-gray-900">{value}</span>
      </div>
      <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-[10px] text-gray-400 font-bold">
        {percentage.toFixed(1)}% of student body
      </p>
    </div>
  );
}

function TableHead({ children }) {
  return (
    <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
      {children}
    </th>
  );
}

function TableCell({ children, className = "" }) {
  return <td className={`px-4 py-5 text-sm ${className}`}>{children}</td>;
}

function ReportsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-10 w-48 bg-gray-200 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-3xl" />
        ))}
      </div>
      <div className="h-64 bg-gray-200 rounded-3xl" />
      <div className="h-64 bg-gray-200 rounded-3xl" />
    </div>
  );
}
