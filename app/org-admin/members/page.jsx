"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import {
  UserPlus, Search, Filter, Watch, AlertCircle, ChevronRight, Mail, UserCircle2,
} from "lucide-react";

const colorMap = {
  SCHOOL:   { btn: "bg-blue-600 hover:bg-blue-700 shadow-blue-100",   ring: "focus:ring-blue-500/20 focus:border-blue-500",   avatar: "bg-blue-50 text-blue-600",   count: "bg-blue-50 text-blue-700 border-blue-100"   },
  COMPANY:  { btn: "bg-violet-600 hover:bg-violet-700 shadow-violet-100", ring: "focus:ring-violet-500/20 focus:border-violet-500", avatar: "bg-violet-50 text-violet-600", count: "bg-violet-50 text-violet-700 border-violet-100" },
  HOSPITAL: { btn: "bg-teal-600 hover:bg-teal-700 shadow-teal-100",   ring: "focus:ring-teal-500/20 focus:border-teal-500",   avatar: "bg-teal-50 text-teal-600",   count: "bg-teal-50 text-teal-700 border-teal-100"   },
  NGO:      { btn: "bg-green-600 hover:bg-green-700 shadow-green-100",  ring: "focus:ring-green-500/20 focus:border-green-500",  avatar: "bg-green-50 text-green-600",  count: "bg-green-50 text-green-700 border-green-100"  },
};

export default function MembersPage() {
  const { orgType, memberLabel, membersLabel } = useAuth();
  const c = colorMap[orgType] ?? colorMap.SCHOOL;

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const { data = [], isLoading, error } = useQuery({
    queryKey: ["members", search, status],
    queryFn: async () => {
      const res = await api.get("/org/members", {
        params: { search, status: status === "all" ? undefined : status },
      });
      return res.data;
    },
  });

  if (isLoading) return <MembersSkeleton />;

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">{membersLabel} Directory</h1>
          <p className="text-gray-500 mt-1 font-medium">
            Monitor {membersLabel.toLowerCase()} wellbeing and wearable connectivity.
          </p>
        </div>
        <Link
          href="/org-admin/members/new"
          className={`flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-white font-black shadow-lg transition-all hover:-translate-y-0.5 ${c.btn}`}
        >
          <UserPlus className="h-5 w-5" />
          Enroll {memberLabel}
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${membersLabel.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-100 bg-white shadow-sm focus:ring-2 outline-none transition-all ${c.ring}`}
          />
        </div>
        <div className="relative w-full md:w-48">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 appearance-none rounded-2xl border border-gray-100 bg-white shadow-sm font-bold text-gray-600 focus:ring-2 outline-none cursor-pointer ${c.ring}`}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className={`ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-black ${c.count}`}>
          {data.length} {membersLabel}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50">
                {[memberLabel, "Contact", "Wearable", "Risk", "Account", ""].map((h, i) => (
                  <th key={i} className={`px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest ${i === 5 ? "text-right" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <UserCircle2 className="h-12 w-12 text-gray-200" />
                      <p className="text-gray-400 font-bold">No {membersLabel.toLowerCase()} found matching those criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((member) => (
                  <tr key={member.id} className="group hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-black text-xs ${c.avatar}`}>
                          {(member.name || "?").split(" ").map((n) => n[0]).join("").toUpperCase()}
                        </div>
                        <Link href={`/org-admin/members/${member.id}`} className="font-bold text-gray-900 hover:underline">
                          {member.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Mail className="h-3.5 w-3.5 opacity-50" />
                        <span className="text-xs font-medium">{member.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4"><WearableBadge connected={member.wearableConnected} /></td>
                    <td className="px-6 py-4"><RiskBadge level={member.riskLevel} /></td>
                    <td className="px-6 py-4"><StatusBadge active={member.isActive} /></td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/org-admin/members/${member.id}`} className="p-2 text-gray-300 hover:text-current transition-all inline-block">
                        <ChevronRight className="h-5 w-5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 font-bold text-sm">
          <AlertCircle className="h-5 w-5" />
          Failed to load {membersLabel.toLowerCase()} directory.
        </div>
      )}
    </div>
  );
}

function StatusBadge({ active }) {
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight border ${
      active ? "bg-green-50 text-green-700 border-green-100" : "bg-gray-100 text-gray-500 border-gray-200"
    }`}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function WearableBadge({ connected }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight border ${
      connected ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-orange-50 text-orange-700 border-orange-100"
    }`}>
      <Watch className="h-3 w-3" />
      {connected ? "Linked" : "Missing"}
    </span>
  );
}

function RiskBadge({ level }) {
  const styles = { LOW: "bg-green-50 text-green-600 border-green-100", MEDIUM: "bg-amber-50 text-amber-600 border-amber-100", HIGH: "bg-red-50 text-red-600 border-red-100" };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight border ${styles[level] || "bg-gray-50 text-gray-500 border-gray-100"}`}>
      {level ?? "N/A"}
    </span>
  );
}

function MembersSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-10 w-48 bg-gray-200 rounded-lg" />
        <div className="h-12 w-40 bg-gray-200 rounded-xl" />
      </div>
      <div className="h-14 w-full bg-gray-200 rounded-2xl" />
      <div className="h-96 w-full bg-gray-200 rounded-3xl" />
    </div>
  );
}
