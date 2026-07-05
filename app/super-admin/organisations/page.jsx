"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/axios";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  BuildingOffice2Icon,
  ChevronRightIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

const ORG_ICONS = { SCHOOL: "🏫", COMPANY: "🏢", HOSPITAL: "🏥", NGO: "🤝" };
const ORG_COLORS = {
  SCHOOL:   "bg-blue-50 text-blue-600",
  COMPANY:  "bg-violet-50 text-violet-600",
  HOSPITAL: "bg-teal-50 text-teal-600",
  NGO:      "bg-green-50 text-green-600",
};

export default function SuperAdminOrganisationsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const { data, isLoading, error } = useQuery({
    queryKey: ["super-admin-organisations"],
    queryFn: async () => {
      const res = await api.get("/super-admin/organisations");
      return res.data;
    },
    retry: 1,
  });

  if (isLoading) return <LoadingState />;

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-gray-200 rounded-[2.5rem] bg-white p-12 text-center">
        <div className="h-16 w-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
          <GlobeAltIcon className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-black text-gray-900">Registry Unreachable</h2>
        <p className="text-gray-500 max-w-xs mx-auto mt-2">
          We're having trouble connecting to the organisation registry service.
        </p>
      </div>
    );
  }

  const list = Array.isArray(data)
    ? [...data]
        .filter((o) =>
          o.name?.toLowerCase().includes(search.toLowerCase()) &&
          (typeFilter === "ALL" || o.orgType === typeFilter)
        )
        .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
    : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 mb-2">Platform Inventory</p>
          <h1 className="text-4xl font-black tracking-tighter text-gray-900">Organisation Registry</h1>
        </div>
        <Link
          href="/super-admin/organisations/create"
          className="group flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 text-white font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
          <PlusIcon className="h-4 w-4" />
          Register Organisation
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative group max-w-md w-full">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-none bg-white shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-600 transition-all font-medium text-sm outline-none"
          />
        </div>
        <div className="flex gap-2">
          {["ALL", "SCHOOL", "COMPANY", "HOSPITAL", "NGO"].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                typeFilter === t
                  ? "bg-indigo-600 text-white border-indigo-600 shadow"
                  : "bg-white text-gray-500 border-gray-100 hover:border-indigo-200"
              }`}
            >
              {t === "ALL" ? "All Types" : `${ORG_ICONS[t]} ${t}`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-900/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <Th>Organisation</Th>
                <Th>Type</Th>
                <Th>Population</Th>
                <Th>Status</Th>
                <Th>Registered On</Th>
                <Th className="text-right">Management</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {list.length > 0 ? (
                list.map((org) => (
                  <tr key={org?.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <Td>
                      <div className="flex items-center gap-4">
                        <div className={`h-11 w-11 rounded-xl flex items-center justify-center text-xl transition-colors ${ORG_COLORS[org?.orgType] ?? "bg-gray-100 text-gray-400"}`}>
                          {ORG_ICONS[org?.orgType] ?? "🏛"}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 tracking-tight">{org?.name || "Unnamed"}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{org?.contactEmail || org?.email || "No contact"}</p>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${ORG_COLORS[org?.orgType] ?? "bg-gray-50 text-gray-500"} border-current/10`}>
                        {org?.orgType ?? "UNKNOWN"}
                      </span>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-xs font-black text-gray-900">{org?.membersCount ?? org?.studentsCount ?? 0}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">Members</p>
                        </div>
                        <div>
                          <p className="text-xs font-black text-gray-900">{org?.adminsCount ?? 0}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">Admins</p>
                        </div>
                      </div>
                    </Td>
                    <Td><StatusBadge status={org?.status} /></Td>
                    <Td>
                      <p className="text-xs font-bold text-gray-500">
                        {org?.createdAt ? new Date(org.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                      </p>
                    </Td>
                    <Td className="text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/super-admin/organisations/${org?.id}`}
                          className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:border-indigo-600 hover:text-indigo-600 transition-all"
                        >
                          Configure
                        </Link>
                        <Link
                          href={`/super-admin/organisations/${org?.id}/admins`}
                          className="p-2 rounded-xl bg-gray-900 text-white hover:bg-indigo-600 transition-all"
                        >
                          <ChevronRightIcon className="h-4 w-4" />
                        </Link>
                      </div>
                    </Td>
                  </tr>
                ))
              ) : (
                <tr>
                  <Td colSpan={6} className="text-center py-20">
                    <p className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">No organisations match your search</p>
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Th({ children, className = "" }) {
  return <th className={`px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ${className}`}>{children}</th>;
}
function Td({ children, className = "", colSpan }) {
  return <td colSpan={colSpan} className={`px-8 py-5 ${className}`}>{children}</td>;
}

function StatusBadge({ status }) {
  const styles = {
    ACTIVE:             "bg-emerald-50 text-emerald-600 ring-emerald-600/10",
    PAYMENT_REQUIRED:   "bg-purple-50 text-purple-600 ring-purple-600/10",
    SUSPENDED:          "bg-rose-50 text-rose-600 ring-rose-600/10",
    PENDING:            "bg-amber-50 text-amber-600 ring-amber-600/10",
    PENDING_ACTIVATION: "bg-amber-50 text-amber-600 ring-amber-600/10",
  };
  return (
    <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ring-1 ring-inset ${styles[status] || "bg-gray-50 text-gray-500 ring-gray-500/10"}`}>
      <span className="mr-1.5 h-1 w-1 rounded-full bg-current" />
      {status || "Unknown"}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-12 w-64 bg-gray-200 rounded-2xl" />
      <div className="h-14 w-full bg-gray-100 rounded-[2.5rem]" />
    </div>
  );
}
