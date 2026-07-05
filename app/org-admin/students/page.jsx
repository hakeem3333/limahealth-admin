"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import {
  UserPlus,
  Search,
  Filter,
  Watch,
  AlertCircle,
  ChevronRight,
  MoreHorizontal,
  Mail,
  UserCircle2,
} from "lucide-react";

export default function StudentsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["students", search, status],
    queryFn: async () => {
      const res = await api.get("/org/students", {
        params: {
          search,
          status: status === "all" ? undefined : status,
        },
      });
      return res.data;
    },
  });

  if (isLoading) return <StudentsSkeleton />;

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Student Directory
          </h1>
          <p className="text-gray-500 mt-1 font-medium">
            Monitor student wellbeing and wearable device connectivity across
            the campus.
          </p>
        </div>

        <Link
          href="/org-admin/students/new"
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          <UserPlus className="h-5 w-5" />
          Enroll Student
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-100 bg-white shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div className="relative w-full md:w-48">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full pl-10 pr-4 py-3 appearance-none rounded-2xl border border-gray-100 bg-white shadow-sm font-bold text-gray-600 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="ml-auto text-sm font-black text-gray-400 uppercase tracking-widest">
          {data.length} Students Listed
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50">
                <TableHead>Student</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Wearable</TableHead>
                <TableHead>Current Risk</TableHead>
                <TableHead>Account</TableHead>
                <TableHead className="text-right">Profile</TableHead>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <UserCircle2 className="h-12 w-12 text-gray-200" />
                      <p className="text-gray-400 font-bold">
                        No students found matching those criteria.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((student) => (
                  <tr
                    key={student.id}
                    className="group hover:bg-gray-50/30 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs">
                          {student.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <Link
                          href={`/org-admin/students/${student.id}`}
                          className="font-bold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {student.name}
                        </Link>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Mail className="h-3.5 w-3.5 opacity-50" />
                        <span className="text-xs font-medium">
                          {student.email}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <WearableBadge connected={student.wearableConnected} />
                    </TableCell>

                    <TableCell>
                      <RiskBadge level={student.riskLevel} />
                    </TableCell>

                    <TableCell>
                      <StatusBadge active={student.isActive} />
                    </TableCell>

                    <TableCell className="text-right">
                      <Link
                        href={`/org-admin/students/${student.id}`}
                        className="p-2 text-gray-300 hover:text-blue-600 transition-all inline-block"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Link>
                    </TableCell>
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
          Failed to synchronize student directory.
        </div>
      )}
    </div>
  );
}

/* -----------------------------
    UI Helpers
------------------------------ */

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

function StatusBadge({ active }) {
  return (
    <span
      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight border ${
        active
          ? "bg-green-50 text-green-700 border-green-100"
          : "bg-gray-100 text-gray-500 border-gray-200"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function WearableBadge({ connected }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight border ${
        connected
          ? "bg-blue-50 text-blue-700 border-blue-100"
          : "bg-orange-50 text-orange-700 border-orange-100"
      }`}
    >
      <Watch className="h-3 w-3" />
      {connected ? "Linked" : "Missing"}
    </span>
  );
}

function RiskBadge({ level }) {
  const styles = {
    LOW: "bg-green-50 text-green-600 border-green-100",
    MEDIUM: "bg-amber-50 text-amber-600 border-amber-100",
    HIGH: "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight border ${styles[level] || "bg-gray-50"}`}
    >
      {level}
    </span>
  );
}

function StudentsSkeleton() {
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
