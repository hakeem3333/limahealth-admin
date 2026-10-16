"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import { BellRing, Filter, CheckCircle2, Clock, UserCircle, ChevronRight } from "lucide-react";

const colorMap = {
  SCHOOL:   { btn: "bg-blue-600 text-white hover:bg-blue-700",   badge: "bg-blue-50 text-blue-700 border-blue-100"   },
  COMPANY:  { btn: "bg-violet-600 text-white hover:bg-violet-700", badge: "bg-violet-50 text-violet-700 border-violet-100" },
  HOSPITAL: { btn: "bg-teal-600 text-white hover:bg-teal-700",   badge: "bg-teal-50 text-teal-700 border-teal-100"   },
  NGO:      { btn: "bg-green-600 text-white hover:bg-green-700",  badge: "bg-green-50 text-green-700 border-green-100"  },
};

export default function AlertsPage() {
  const { user, orgType, memberLabel, supportLabel } = useAuth();
  const c = colorMap[orgType] ?? colorMap.SCHOOL;
  const queryClient = useQueryClient();
  const [severity, setSeverity] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  const { data = [], isLoading } = useQuery({
    queryKey: ["org-alerts", severity, status],
    queryFn: async () => {
      const res = await api.get("/org/alerts", {
        params: {
          severity: severity === "ALL" ? undefined : severity,
          status:   status   === "ALL" ? undefined : status,
        },
      });
      return res.data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, newStatus }) => api.patch(`/org/alerts/${id}`, { status: newStatus }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["org-alerts"] }),
  });

  if (isLoading) return <AlertsSkeleton />;

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <BellRing className="h-8 w-8 text-red-500" />
          Risk Alerts
        </h1>
        <p className="text-gray-500 mt-1 font-medium">
          Real-time biometric and behavioral stress markers across your {memberLabel.toLowerCase()} population.
        </p>
      </div>

      <SubscriptionGuard status={user?.orgStatus}>
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-gray-900 dim:bg-white p-4 rounded-2xl border border-gray-100 dark:border-gray-800 dim:border-slate-300/70 shadow-sm">
          <div className="flex items-center gap-2 text-gray-400 mr-2 border-r pr-4 border-gray-100 dark:border-gray-800">
            <Filter className="h-4 w-4" />
            <span className="text-xs font-black uppercase tracking-wider">Filters</span>
          </div>
          <FilterSelect label="Severity" value={severity} onChange={setSeverity} options={["ALL", "MODERATE", "HIGH", "CRITICAL"]} />
          <FilterSelect label="Status"   value={status}   onChange={setStatus}   options={["ALL", "OPEN", "RESOLVED"]} />
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 dim:bg-white rounded-3xl border border-gray-100 dark:border-gray-800 dim:border-slate-300/70 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-50 dark:border-gray-800">
                  {[memberLabel, "Risk Details", `Assigned ${supportLabel}`, "Status", "Timestamp", "Actions"].map((h, i) => (
                    <th key={i} className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 ${i === 5 ? "text-right" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle2 className="h-10 w-10 text-green-200" />
                        <p className="text-gray-400 font-medium">No alerts matching your filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((alert) => (
                    <tr key={alert.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-5">
                        <Link href={`/org-admin/members/${alert.memberId}`} className="flex items-center gap-3 group/link">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold border ${colorMap[orgType]?.badge ?? "bg-blue-50 text-blue-600 border-blue-100"}`}>
                            {(alert.studentName || alert.memberName || "?").charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white group-hover/link:underline">
                              {alert.studentName || alert.memberName}
                            </p>
                            <p className="text-xs text-gray-400">ID: {(alert.memberId || "").substring(0, 8)}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <SeverityBadge level={alert.severity} />
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{alert.trigger}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <UserCircle className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                          <span className="text-sm">{alert.counselorName || alert.staffName || "Unassigned"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5"><AlertStatusBadge status={alert.status} /></td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium">{new Date(alert.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {alert.status === "OPEN" ? (
                            <button
                              onClick={() => updateStatus.mutate({ id: alert.id, newStatus: "RESOLVED" })}
                              className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-black hover:bg-green-700 transition-colors"
                            >
                              Resolve
                            </button>
                          ) : (
                            <button
                              onClick={() => updateStatus.mutate({ id: alert.id, newStatus: "OPEN" })}
                              className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700 rounded-lg text-xs font-black hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              Reopen
                            </button>
                          )}
                          <Link href={`/org-admin/alerts/${alert.id}`} className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                            <ChevronRight className="h-5 w-5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </SubscriptionGuard>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1.5 min-w-[140px]">
      <span className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
      >
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}

function SeverityBadge({ level }) {
  const styles = {
    MODERATE: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-500/20",
    HIGH:     "bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-100 dark:border-orange-500/20",
    CRITICAL: "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-100 dark:border-red-500/20 animate-pulse",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-tighter ${styles[level] || "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"}`}>
      {level}
    </span>
  );
}

function AlertStatusBadge({ status }) {
  const styles = { OPEN: "text-red-600 dark:text-red-400", RESOLVED: "text-green-600 dark:text-green-400" };
  return (
    <div className="flex items-center gap-1.5">
      <div className={`h-1.5 w-1.5 rounded-full bg-current ${styles[status]}`} />
      <span className={`text-xs font-black uppercase tracking-wide ${styles[status]}`}>{status}</span>
    </div>
  );
}

function AlertsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg" />
      <div className="h-16 w-full bg-gray-200 dark:bg-gray-800 rounded-2xl" />
      <div className="h-[400px] w-full bg-gray-200 dark:bg-gray-800 rounded-3xl" />
    </div>
  );
}
