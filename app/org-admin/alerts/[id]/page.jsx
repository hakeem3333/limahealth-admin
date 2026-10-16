"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import {
  ChevronLeft, BellRing, UserCircle, UserCog, Clock, Mail,
  ShieldAlert, StickyNote, CheckCircle2, RotateCcw, AlertTriangle,
} from "lucide-react";

export default function AlertDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { memberLabel, supportLabel } = useAuth();
  const queryClient = useQueryClient();

  const { data: alert, isLoading, error } = useQuery({
    queryKey: ["org-alert", id],
    queryFn: async () => {
      const res = await api.get(`/org/alerts/${id}`);
      return res.data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: (newStatus) => api.patch(`/org/alerts/${id}`, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-alert", id] });
      queryClient.invalidateQueries({ queryKey: ["org-alerts"] });
    },
  });

  if (isLoading) return <DetailSkeleton />;
  if (error || !alert) return <ErrorState />;

  const isOpen = alert.status === "OPEN";

  return (
    <div className="space-y-8 py-4 max-w-3xl">
      <button
        onClick={() => router.push("/org-admin/alerts")}
        className="flex items-center gap-1.5 text-sm font-bold text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Alerts
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-8">
        <div className="flex items-center gap-4">
          <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner ${isOpen ? "bg-red-50 dark:bg-red-500/10 text-red-500" : "bg-green-50 dark:bg-green-500/10 text-green-600"}`}>
            <BellRing className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Risk Alert</h1>
              <SeverityBadge level={alert.severity} />
            </div>
            <p className="text-sm text-gray-400 font-medium mt-1">{alert.alertType}</p>
          </div>
        </div>

        <button
          onClick={() => updateStatus.mutate(isOpen ? "RESOLVED" : "OPEN")}
          disabled={updateStatus.isPending}
          className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-black shadow-lg transition-all disabled:opacity-50 ${
            isOpen
              ? "bg-green-600 text-white hover:bg-green-700 shadow-green-100"
              : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          }`}
        >
          {isOpen ? <CheckCircle2 className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
          {updateStatus.isPending ? "Updating…" : isOpen ? "Mark Resolved" : "Reopen Alert"}
        </button>
      </div>

      {/* Status + timestamp */}
      <div className="flex flex-wrap gap-3">
        <StatusBadge status={alert.status} />
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700">
          <Clock className="h-3.5 w-3.5" />
          {new Date(alert.timestamp || alert.createdAt).toLocaleString()}
        </span>
      </div>

      {/* Risk details */}
      <Section title="Risk Details" icon={<AlertTriangle className="h-5 w-5 text-orange-500" />}>
        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed">{alert.trigger}</p>
      </Section>

      {alert.notes && (
        <Section title={`${supportLabel} Notes`} icon={<StickyNote className="h-5 w-5 text-amber-500" />}>
          <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed whitespace-pre-wrap">{alert.notes}</p>
        </Section>
      )}

      {/* People */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <InfoCard title={memberLabel}>
          <Link href={`/org-admin/members/${alert.memberId}`} className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center font-black">
              <UserCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white group-hover:underline">{alert.studentName}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Mail className="h-3 w-3" /> {alert.studentEmail}
              </p>
            </div>
          </Link>
        </InfoCard>

        <InfoCard title={`Assigned ${supportLabel}`}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-600 flex items-center justify-center font-black">
              <UserCog className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white">{alert.counselorName}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Mail className="h-3 w-3" /> {alert.counselorEmail}
              </p>
            </div>
          </div>
        </InfoCard>
      </div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="rounded-3xl border border-gray-100 dark:border-gray-800 dim:border-slate-300/70 bg-white dark:bg-gray-900 dim:bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gray-50 dark:bg-gray-800 dim:bg-slate-100 rounded-xl">{icon}</div>
        <h2 className="text-sm font-black text-gray-900 dark:text-white tracking-tight uppercase">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function InfoCard({ title, children }) {
  return (
    <div className="rounded-3xl border border-gray-100 dark:border-gray-800 dim:border-slate-300/70 bg-white dark:bg-gray-900 dim:bg-white p-5 shadow-sm">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{title}</p>
      {children}
    </div>
  );
}

function SeverityBadge({ level }) {
  const styles = {
    MODERATE: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-500/20",
    HIGH:     "bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-100 dark:border-orange-500/20",
    CRITICAL: "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-100 dark:border-red-500/20",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase tracking-tight ${styles[level] || "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"}`}>
      {level}
    </span>
  );
}

function StatusBadge({ status }) {
  const isOpen = status === "OPEN";
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wide border ${
      isOpen
        ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20"
        : "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-100 dark:border-green-500/20"
    }`}>
      <ShieldAlert className="h-3.5 w-3.5" />
      {status}
    </span>
  );
}

function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-16 text-center shadow-sm max-w-3xl">
      <div className="h-12 w-12 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <p className="text-gray-500 font-bold">Alert not found.</p>
      <Link href="/org-admin/alerts" className="text-sm font-bold text-blue-600 hover:underline">
        Back to Alerts
      </Link>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-8 py-4 max-w-3xl animate-pulse">
      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
      <div className="h-20 w-full bg-gray-200 dark:bg-gray-800 rounded-2xl" />
      <div className="h-32 w-full bg-gray-200 dark:bg-gray-800 rounded-3xl" />
      <div className="grid grid-cols-2 gap-6">
        <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
        <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
      </div>
    </div>
  );
}
