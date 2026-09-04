"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import {
  Watch,
  RefreshCw,
  Link2Off,
  CheckCircle2,
  AlertTriangle,
  Search,
  Cpu,
} from "lucide-react";

export default function WearablesPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const {
    data = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["school-wearables", filter],
    queryFn: async () => {
      const res = await api.get("/org/wearables", {
        params: {
          status: filter === "all" ? undefined : filter,
        },
      });
      return res.data;
    },
  });

  if (isLoading) return <WearablesSkeleton />;

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Watch className="text-blue-600 h-8 w-8" />
            Device Fleet
          </h1>
          <p className="text-gray-500 mt-1 font-medium">
            Monitor real-time biometric data streams and integration health.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 px-6 py-3 text-gray-700 font-bold hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
          />
          Force Sync All
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Total Managed Devices"
          value={data.length}
          icon={<Cpu className="h-5 w-5 text-blue-600" />}
        />
        <StatCard
          label="Active Streams"
          value={data.filter((d) => d.connected).length}
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
        />
        <StatCard
          label="Sync Failures"
          value={data.filter((d) => !d.connected).length}
          icon={<AlertTriangle className="h-5 w-5 text-orange-600" />}
          critical={data.filter((d) => !d.connected).length > 0}
        />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
          <FilterTab active={filter === "all"} onClick={() => setFilter("all")}>
            All Devices
          </FilterTab>
          <FilterTab
            active={filter === "connected"}
            onClick={() => setFilter("connected")}
          >
            Connected
          </FilterTab>
          <FilterTab
            active={filter === "not_connected"}
            onClick={() => setFilter("not_connected")}
          >
            Disconnected
          </FilterTab>
        </div>

        <div className="relative flex-1 max-w-md ml-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-100 bg-white focus:ring-2 focus:ring-blue-500/10 outline-none font-medium text-sm transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-50">
              <TableHead>Student</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Data Packet</TableHead>
              <TableHead className="text-right">Manage</TableHead>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-20 text-center text-gray-400 font-bold"
                >
                  No devices found matching this filter.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={row.studentId}
                  className="group hover:bg-gray-50/30 transition-colors"
                >
                  <TableCell>
                    <Link
                      href={`/org-admin/members/${row.studentId}`}
                      className="font-bold text-gray-900 hover:text-blue-600"
                    >
                      {row.studentName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-500 uppercase">
                        {row.device?.charAt(0) ?? "?"}
                      </div>
                      <span className="font-medium text-gray-600">
                        {row.device ?? "Generic Wearable"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge connected={row.connected} />
                  </TableCell>
                  <TableCell className="text-gray-500 tabular-nums font-medium">
                    {row.lastSync
                      ? new Date(row.lastSync).toLocaleString()
                      : "Never Synced"}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.connected ? (
                      <button className="inline-flex items-center gap-2 text-xs font-black text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all uppercase tracking-widest">
                        <Link2Off className="h-3 w-3" />
                        Revoke
                      </button>
                    ) : (
                      <button className="inline-flex items-center gap-2 text-xs font-black text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all uppercase tracking-widest">
                        <RefreshCw className="h-3 w-3" />
                        Re-link
                      </button>
                    )}
                  </TableCell>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* -----------------------------
   UI Components
------------------------------ */

function StatCard({ label, value, icon, critical }) {
  return (
    <div
      className={`p-6 rounded-3xl border ${critical ? "border-orange-100 bg-orange-50/30" : "border-gray-100 bg-white"} shadow-sm`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-50">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-black text-gray-900">{value}</p>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
        {label}
      </p>
    </div>
  );
}

function FilterTab({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
        active
          ? "bg-gray-900 text-white shadow-md"
          : "text-gray-400 hover:text-gray-900"
      }`}
    >
      {children}
    </button>
  );
}

function TableHead({ children, className = "" }) {
  return (
    <th
      className={`px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest ${className}`}
    >
      {children}
    </th>
  );
}

function TableCell({ children, className = "" }) {
  return <td className={`px-6 py-4 text-sm ${className}`}>{children}</td>;
}

function StatusBadge({ connected }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
        connected
          ? "bg-green-50 text-green-700 border border-green-100"
          : "bg-orange-50 text-orange-700 border border-orange-100"
      }`}
    >
      <div
        className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-orange-500"}`}
      />
      {connected ? "Live Stream" : "Auth Expired"}
    </span>
  );
}

function WearablesSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-10 w-48 bg-gray-200 rounded-lg" />
      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-3xl" />
        ))}
      </div>
      <div className="h-14 w-full bg-gray-200 rounded-2xl" />
      <div className="h-96 w-full bg-gray-200 rounded-3xl" />
    </div>
  );
}
