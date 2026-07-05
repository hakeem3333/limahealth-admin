"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import { UserPlus, Search, UserSquare2, Mail, Users, ChevronRight, MoreVertical, AlertCircle } from "lucide-react";

const colorMap = {
  SCHOOL:   { btn: "bg-blue-600 hover:bg-blue-700 shadow-blue-100",   ring: "focus:ring-blue-500/20 focus:border-blue-500",   avatar: "bg-blue-50 text-blue-600 border-blue-100",   count: "bg-blue-50 text-blue-700 border-blue-100",   bar: "bg-blue-500"   },
  COMPANY:  { btn: "bg-violet-600 hover:bg-violet-700 shadow-violet-100", ring: "focus:ring-violet-500/20 focus:border-violet-500", avatar: "bg-violet-50 text-violet-600 border-violet-100", count: "bg-violet-50 text-violet-700 border-violet-100", bar: "bg-violet-500" },
  HOSPITAL: { btn: "bg-teal-600 hover:bg-teal-700 shadow-teal-100",   ring: "focus:ring-teal-500/20 focus:border-teal-500",   avatar: "bg-teal-50 text-teal-600 border-teal-100",   count: "bg-teal-50 text-teal-700 border-teal-100",   bar: "bg-teal-500"   },
  NGO:      { btn: "bg-green-600 hover:bg-green-700 shadow-green-100",  ring: "focus:ring-green-500/20 focus:border-green-500",  avatar: "bg-green-50 text-green-600 border-green-100",  count: "bg-green-50 text-green-700 border-green-100",  bar: "bg-green-500"  },
};

export default function SupportStaffPage() {
  const { user, orgType, memberLabel, membersLabel, supportLabel, supportsLabel } = useAuth();
  const c = colorMap[orgType] ?? colorMap.SCHOOL;
  const [search, setSearch] = useState("");

  const { data = [], isLoading, error } = useQuery({
    queryKey: ["support-staff", search],
    queryFn: async () => (await api.get("/org/support-staff", { params: { search } })).data,
  });

  if (isLoading) return <StaffSkeleton />;

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">{supportsLabel}</h1>
          <p className="text-gray-500 mt-1 font-medium">
            Manage your {supportsLabel.toLowerCase()} and monitor {membersLabel.toLowerCase()} caseloads.
          </p>
        </div>
        <Link
          href="/org-admin/support-staff/new"
          className={`flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-white font-black shadow-lg transition-all hover:-translate-y-0.5 ${c.btn}`}
        >
          <UserPlus className="h-5 w-5" />
          Add {supportLabel}
        </Link>
      </div>

      <SubscriptionGuard status={user?.orgStatus}>
        {/* Search + Count */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search by name, email or specialization...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-100 bg-white shadow-sm focus:ring-2 outline-none transition-all ${c.ring}`}
            />
          </div>
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-black ${c.count}`}>
            <Users className="h-4 w-4" />
            {data.length} {supportsLabel}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-50">
                  {[supportLabel, "Contact Info", `${memberLabel} Caseload`, "Account Status", "Actions"].map((h, i) => (
                    <th key={i} className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 ${i === 4 ? "text-right" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <UserSquare2 className="h-12 w-12 text-gray-200" />
                        <p className="text-gray-400 font-medium">No {supportsLabel.toLowerCase()} found matching your criteria.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((staff) => (
                    <tr key={staff.id} className="group hover:bg-gray-50/30 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black border uppercase tracking-tighter text-sm ${c.avatar}`}>
                            {(staff.name || "?").split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div>
                            <Link href={`/org-admin/support-staff/${staff.id}`} className="font-bold text-gray-900 hover:underline block">
                              {staff.name}
                            </Link>
                            <span className="text-xs text-gray-400 font-medium">
                              Joined {new Date(staff.createdAt || Date.now()).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-4 w-4 text-gray-300" />
                          <span className="text-sm font-medium">{staff.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-16 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${Math.min(((staff.studentsCount || staff.membersCount || 0) / 50) * 100, 100)}%` }} />
                          </div>
                          <span className="text-sm font-bold text-gray-700">
                            {staff.studentsCount ?? staff.membersCount ?? 0} {membersLabel}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge active={staff.isActive} />
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Link href={`/org-admin/support-staff/${staff.id}`} className="p-2 text-gray-400 hover:text-current hover:bg-gray-50 rounded-lg transition-all">
                            <ChevronRight className="h-5 w-5" />
                          </Link>
                          <button className="p-2 text-gray-300 hover:text-gray-600 transition-colors">
                            <MoreVertical className="h-5 w-5" />
                          </button>
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

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-bold flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Error loading {supportsLabel.toLowerCase()} data. Please refresh.
        </div>
      )}
    </div>
  );
}

function StatusBadge({ active }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tight ${
      active ? "bg-green-50 text-green-700 border border-green-100" : "bg-gray-100 text-gray-500 border border-gray-200"
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-green-600" : "bg-gray-400"}`} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function StaffSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between">
        <div className="h-10 w-48 bg-gray-200 rounded-lg" />
        <div className="h-12 w-40 bg-gray-200 rounded-xl" />
      </div>
      <div className="h-14 w-full max-w-md bg-gray-200 rounded-2xl" />
      <div className="h-96 w-full bg-gray-200 rounded-3xl" />
    </div>
  );
}
