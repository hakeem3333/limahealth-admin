"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import {
  Watch,
  RefreshCw,
  Link2,
  CheckCircle2,
  AlertTriangle,
  Search,
} from "lucide-react";

export default function WearablesPage() {
  const { memberLabel } = useAuth();
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
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
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
          className="flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-6 py-3 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Linked Devices"
          value={data.filter((d) => d.connected).length}
          icon={<Link2 className="h-5 w-5 text-blue-600" />}
        />
        <StatCard
          label="Synced in last 24h"
          value={data.filter((d) => d.linkStatus === "live").length}
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
        />
        <StatCard
          label="Not Syncing"
          value={data.filter((d) => d.linkStatus === "stale").length}
          icon={<AlertTriangle className="h-5 w-5 text-orange-600" />}
          critical={data.some((d) => d.linkStatus === "stale")}
        />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex bg-white dark:bg-gray-900 dim:bg-white p-1 rounded-2xl border border-gray-100 dark:border-gray-800 dim:border-slate-300/70 shadow-sm">
          <FilterTab active={filter === "all"} onClick={() => setFilter("all")}>
            All Devices
          </FilterTab>
          <FilterTab
            active={filter === "connected"}
            onClick={() => setFilter("connected")}
          >
            Linked
          </FilterTab>
          <FilterTab
            active={filter === "not_connected"}
            onClick={() => setFilter("not_connected")}
          >
            Not Linked
          </FilterTab>
        </div>

        <div className="relative flex-1 max-w-md ml-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Search by ${memberLabel.toLowerCase()} name...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/10 outline-none font-medium text-sm transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 dim:bg-white rounded-3xl border border-gray-100 dark:border-gray-800 dim:border-slate-300/70 shadow-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-50 dark:border-gray-800">
              <TableHead>{memberLabel}</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Data Packet</TableHead>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="p-20 text-center text-gray-400 font-bold"
                >
                  No devices found matching this filter.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={row.studentId}
                  className="group hover:bg-gray-50/30 dark:hover:bg-gray-800/40 transition-colors"
                >
                  <TableCell>
                    <Link
                      href={`/org-admin/members/${row.studentId}`}
                      className="font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {row.studentName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {row.device ? (
                        <>
                          <div className="h-6 w-6 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase">
                            {row.device.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-600 dark:text-gray-300">{row.device}</span>
                        </>
                      ) : (
                        <span className="font-medium text-gray-400">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={row.linkStatus ?? (row.connected ? "live" : "not_linked")} />
                  </TableCell>
                  <TableCell className="text-gray-500 dark:text-gray-400 tabular-nums font-medium">
                    {row.lastSync
                      ? new Date(row.lastSync).toLocaleString()
                      : row.connected
                        ? "No data yet"
                        : "—"}
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
      className={`p-6 rounded-3xl border ${critical ? "border-orange-100 dark:border-orange-500/20 bg-orange-50/30 dark:bg-orange-500/10" : "border-gray-100 dark:border-gray-800 dim:border-slate-300/70 bg-white dark:bg-gray-900 dim:bg-white"} shadow-sm`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-50 dark:border-gray-700">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-black text-gray-900 dark:text-white">{value}</p>
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
          ? "bg-gray-900 dark:bg-gray-700 text-white shadow-md"
          : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
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

const STATUS_STYLES = {
  live: {
    label: "Syncing",
    badge: "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-500/20",
    dot: "bg-green-500 animate-pulse",
  },
  stale: {
    label: "Not Syncing",
    badge: "bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-100 dark:border-orange-500/20",
    dot: "bg-orange-500",
  },
  not_linked: {
    label: "Not Linked",
    badge: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700",
    dot: "bg-gray-400",
  },
};

function StatusBadge({ status }) {
  const st = STATUS_STYLES[status] ?? STATUS_STYLES.not_linked;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${st.badge}`}>
      <div className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
      {st.label}
    </span>
  );
}

function WearablesSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg" />
      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
        ))}
      </div>
      <div className="h-14 w-full bg-gray-200 dark:bg-gray-800 rounded-2xl" />
      <div className="h-96 w-full bg-gray-200 dark:bg-gray-800 rounded-3xl" />
    </div>
  );
}
