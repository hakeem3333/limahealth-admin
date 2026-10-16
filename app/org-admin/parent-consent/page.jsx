"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import {
  Search, Filter, ChevronRight, Mail, AlertCircle, Send, UserPlus,
  ShieldCheck, ShieldAlert, ShieldQuestion, ShieldOff, Users2, Loader2, CheckCircle2, XCircle,
} from "lucide-react";

const REQUESTABLE_STATUSES = new Set(["NOT_REQUESTED", "PENDING", "DECLINED"]);
const canRequestFor = (row) => row.parent && REQUESTABLE_STATUSES.has(row.status);

const colorMap = {
  SCHOOL:   { btn: "bg-[#0CAF87] hover:bg-[#0F6E56] shadow-teal-100",   ring: "focus:ring-[#0CAF87]/20 focus:border-[#0CAF87]",   count: "bg-teal-50 text-teal-700 border-teal-100"   },
  COMPANY:  { btn: "bg-violet-600 hover:bg-violet-700 shadow-violet-100", ring: "focus:ring-violet-500/20 focus:border-violet-500", count: "bg-violet-50 text-violet-700 border-violet-100" },
  HOSPITAL: { btn: "bg-[#0D3B7A] hover:bg-[#0C447C] shadow-blue-100",   ring: "focus:ring-blue-500/20 focus:border-blue-500",   count: "bg-blue-50 text-blue-700 border-blue-100"   },
  NGO:      { btn: "bg-amber-500 hover:bg-amber-600 shadow-amber-100",  ring: "focus:ring-amber-500/20 focus:border-amber-500",  count: "bg-amber-50 text-amber-700 border-amber-100"  },
};

const STATUS_META = {
  GRANTED:       { label: "Granted",       cls: "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-100 dark:border-green-500/20", Icon: ShieldCheck },
  DECLINED:      { label: "Declined",      cls: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20",       Icon: ShieldAlert },
  PENDING:       { label: "Pending",       cls: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20", Icon: ShieldQuestion },
  NOT_REQUESTED: { label: "Not requested", cls: "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700",     Icon: ShieldQuestion },
  UNLINKED:      { label: "Unlinked",      cls: "bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700",     Icon: ShieldOff },
};

const STATUS_FILTERS = [
  { value: "all",           label: "All Statuses" },
  { value: "GRANTED",       label: "Granted" },
  { value: "DECLINED",      label: "Declined" },
  { value: "PENDING",       label: "Pending" },
  { value: "NOT_REQUESTED", label: "Not requested" },
  { value: "UNLINKED",      label: "Unlinked" },
];

export default function ParentConsentPage() {
  const { orgType } = useAuth();
  const c = colorMap[orgType] ?? colorMap.SCHOOL;
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState(() => new Set());
  const [bulkResult, setBulkResult] = useState(null); // { sent, failed } | null
  const debouncedSearch = useDebouncedValue(search);

  const { data = [], isLoading, isPlaceholderData, error } = useQuery({
    queryKey: ["parent-consent-overview"],
    queryFn: async () => {
      const res = await api.get("/parent-relationships/org-overview");
      return res.data;
    },
    placeholderData: keepPreviousData,
    enabled: orgType === "SCHOOL",
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["parent-consent-overview"] });

  const counts = useMemo(() => {
    const base = { GRANTED: 0, DECLINED: 0, PENDING: 0, NOT_REQUESTED: 0, UNLINKED: 0 };
    for (const row of data) base[row.status] = (base[row.status] ?? 0) + 1;
    return base;
  }, [data]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return data.filter((row) => {
      if (status !== "all" && row.status !== status) return false;
      if (!q) return true;
      return (
        row.studentName.toLowerCase().includes(q) ||
        row.studentEmail.toLowerCase().includes(q) ||
        row.parent?.firstName?.toLowerCase().includes(q) ||
        row.parent?.lastName?.toLowerCase().includes(q) ||
        row.parent?.email?.toLowerCase().includes(q)
      );
    });
  }, [data, debouncedSearch, status]);

  const selectableRows = useMemo(() => filtered.filter(canRequestFor), [filtered]);
  const allSelectableSelected = selectableRows.length > 0 && selectableRows.every((r) => selected.has(r.studentId));

  const toggleRow = (studentId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(studentId) ? next.delete(studentId) : next.add(studentId);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) => {
      if (allSelectableSelected) return new Set();
      const next = new Set(prev);
      selectableRows.forEach((r) => next.add(r.studentId));
      return next;
    });
  };

  const bulkSend = useMutation({
    mutationFn: async () => {
      const ids = Array.from(selected);
      const results = await Promise.allSettled(
        ids.map((studentId) => api.post("/parent-consent/request", { studentId })),
      );
      const sent = results.filter((r) => r.status === "fulfilled").length;
      return { sent, failed: results.length - sent };
    },
    onSuccess: (result) => {
      setBulkResult(result);
      setSelected(new Set());
      invalidate();
    },
  });

  if (orgType && orgType !== "SCHOOL") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <ShieldOff className="h-12 w-12 text-gray-200" />
        <p className="text-gray-400 font-bold max-w-sm">
          Parental consent tracking is only available for school organisations.
        </p>
      </div>
    );
  }

  if (isLoading) return <ParentConsentSkeleton />;

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Parental Consent</h1>
        <p className="text-gray-500 mt-1 font-medium">
          Track and manage parent/guardian consent for student wellness data access.
        </p>
      </div>

      {/* Stat chips */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatChip label="Granted" value={counts.GRANTED} cls="bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-100 dark:border-green-500/20" />
        <StatChip label="Pending" value={counts.PENDING} cls="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20" />
        <StatChip label="Declined" value={counts.DECLINED} cls="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20" />
        <StatChip label="Not requested" value={counts.NOT_REQUESTED} cls="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700" />
        <StatChip label="Unlinked" value={counts.UNLINKED} cls="bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700" />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search students or parents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-100 dark:border-gray-800 dim:border-slate-300/70 bg-white dark:bg-gray-900 dim:bg-white dark:text-white shadow-sm focus:ring-2 outline-none transition-all ${c.ring}`}
          />
        </div>
        <div className="relative w-full md:w-56">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 appearance-none rounded-2xl border border-gray-100 dark:border-gray-800 dim:border-slate-300/70 bg-white dark:bg-gray-900 dim:bg-white shadow-sm font-bold text-gray-600 dark:text-gray-300 focus:ring-2 outline-none cursor-pointer ${c.ring}`}
          >
            {STATUS_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>
        {selected.size > 0 && (
          <button
            onClick={() => { setBulkResult(null); bulkSend.mutate(); }}
            disabled={bulkSend.isPending}
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all disabled:opacity-50 ${c.btn}`}
          >
            {bulkSend.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {bulkSend.isPending ? "Sending…" : `Send to ${selected.size} selected`}
          </button>
        )}
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-black ${selected.size > 0 ? "" : "ml-auto"} ${c.count}`}>
          {filtered.length} of {data.length}
        </div>
      </div>

      {bulkResult && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border font-bold text-sm ${bulkResult.failed > 0 ? "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-500/20" : "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-100 dark:border-green-500/20"}`}>
          {bulkResult.failed > 0 ? <XCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
          Sent {bulkResult.sent} request{bulkResult.sent === 1 ? "" : "s"}
          {bulkResult.failed > 0 && `, ${bulkResult.failed} failed`}.
          <button onClick={() => setBulkResult(null)} className="ml-auto text-xs underline opacity-70 hover:opacity-100">Dismiss</button>
        </div>
      )}

      {/* Table */}
      <div className={`bg-white dark:bg-gray-900 dim:bg-white rounded-3xl border border-gray-100 dark:border-gray-800 dim:border-slate-300/70 shadow-xl overflow-hidden transition-opacity ${isPlaceholderData ? "opacity-60" : ""}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-50 dark:border-gray-800">
                <th className="w-12 px-6 py-4">
                  <input
                    type="checkbox"
                    checked={allSelectableSelected}
                    onChange={toggleAll}
                    disabled={selectableRows.length === 0}
                    className="h-4 w-4 rounded border-gray-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
                  />
                </th>
                {["Student", "Parent / Guardian", "Status", ""].map((h, i) => (
                  <th key={i} className={`px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest ${i === 3 ? "text-right" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Users2 className="h-12 w-12 text-gray-200 dark:text-gray-700" />
                      <p className="text-gray-400 font-bold">No students found matching those criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <ConsentRow
                    key={row.studentId}
                    row={row}
                    c={c}
                    onChanged={invalidate}
                    checked={selected.has(row.studentId)}
                    onToggle={() => toggleRow(row.studentId)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 font-bold text-sm">
          <AlertCircle className="h-5 w-5" />
          Failed to load parent consent data.
        </div>
      )}
    </div>
  );
}

function ConsentRow({ row, c, onChanged, checked, onToggle }) {
  const [feedback, setFeedback] = useState("");

  const sendRequest = useMutation({
    mutationFn: () => api.post("/parent-consent/request", { studentId: row.studentId }),
    onSuccess: () => {
      setFeedback(`Sent to ${row.parent.email}`);
      onChanged();
    },
    onError: (err) => setFeedback(err?.response?.data?.message || "Failed to send"),
  });

  const meta = STATUS_META[row.status];
  const canRequest = canRequestFor(row);

  return (
    <tr className={`group hover:bg-gray-50/30 dark:hover:bg-gray-800/40 transition-colors ${checked ? "bg-teal-50/30 dark:bg-teal-500/10" : ""}`}>
      <td className="px-6 py-4">
        {canRequest && (
          <input
            type="checkbox"
            checked={checked}
            onChange={onToggle}
            className="h-4 w-4 rounded border-gray-300 cursor-pointer"
          />
        )}
      </td>
      <td className="px-6 py-4">
        <Link href={`/org-admin/members/${row.studentId}`} className="font-bold text-gray-900 dark:text-white hover:underline">
          {row.studentName}
        </Link>
        <div className="flex items-center gap-1.5 text-gray-400 mt-0.5">
          <Mail className="h-3 w-3 opacity-60" />
          <span className="text-[11px] font-medium">{row.studentEmail}</span>
        </div>
        <p className="text-[11px] font-bold mt-1 text-amber-600">Age {row.age}</p>
      </td>
      <td className="px-6 py-4">
        {row.parent ? (
          <>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{row.parent.firstName} {row.parent.lastName}</p>
            <p className="text-[11px] text-gray-400">{row.parent.email}</p>
          </>
        ) : (
          <span className="text-xs text-gray-400 italic">No parent linked</span>
        )}
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1.5 whitespace-nowrap px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight border ${meta.cls}`}>
          <meta.Icon className="h-3 w-3 flex-shrink-0" />
          {meta.label}
        </span>
        {row.status === "PENDING" && row.pendingRequest && (
          <p className="text-[10px] text-gray-400 mt-1 whitespace-nowrap">
            Expires {new Date(row.pendingRequest.expiresAt).toLocaleDateString()}
          </p>
        )}
      </td>
      <td className="px-6 py-4 text-right w-56">
        <div className="flex flex-col items-end gap-1.5">
          {row.parent ? (
            canRequest && (
              <button
                onClick={() => { setFeedback(""); sendRequest.mutate(); }}
                disabled={sendRequest.isPending}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold text-white shadow-md transition-all disabled:opacity-50 ${c.btn}`}
              >
                <Send className="h-3.5 w-3.5" />
                {sendRequest.isPending ? "Sending…" : row.status === "PENDING" ? "Resend" : "Send request"}
              </button>
            )
          ) : (
            <Link
              href={`/org-admin/members/${row.studentId}`}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Link parent
            </Link>
          )}
          {feedback && <p className="text-[11px] font-medium text-gray-400 max-w-[13rem] text-right">{feedback}</p>}
        </div>
      </td>
    </tr>
  );
}

function StatChip({ label, value, cls }) {
  return (
    <div className={`rounded-2xl border px-4 py-3 ${cls}`}>
      <p className="text-2xl font-black leading-none">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-widest mt-1.5 opacity-80">{label}</p>
    </div>
  );
}

function ParentConsentSkeleton() {
  return (
    <div className="space-y-8 animate-pulse py-4">
      <div className="h-10 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg" />
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 bg-gray-200 dark:bg-gray-800 rounded-2xl" />)}
      </div>
      <div className="h-14 w-full bg-gray-200 dark:bg-gray-800 rounded-2xl" />
      <div className="h-96 w-full bg-gray-200 dark:bg-gray-800 rounded-3xl" />
    </div>
  );
}
