"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

/**
 * School Admin – Students Management
 */
export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");

  const { data, isLoading, error } = useQuery({
    queryKey: ["students", search, status],
    queryFn: async () => {
      const res = await api.get("/school/students", {
        params: {
          search,
          status: status === "all" ? undefined : status,
        },
      });
      return res.data;
    },
  });

  if (isLoading) return <StudentsSkeleton />;

  if (error) {
    return (
      <div className="text-red-600">
        Failed to load students.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Students</h1>
          <p className="text-muted-foreground">
            Manage students and wearable connections
          </p>
        </div>

        <Link
          href="/school-admin/students/new"
          className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
        >
          + Add Student
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-64 rounded-md border px-3 py-2"
        />

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as "all" | "active" | "inactive")
          }
          className="w-full md:w-40 rounded-md border px-3 py-2"
        >
          <option value="all">All Students</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Wearable</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                  No students found.
                </td>
              </tr>
            ) : (
              data.map((student: any) => (
                <tr key={student.id} className="border-t">
                  <TableCell>
                    <Link
                      href={`/school-admin/students/${student.id}`}
                      className="font-medium hover:underline"
                    >
                      {student.name}
                    </Link>
                  </TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>
                    <StatusBadge active={student.isActive} />
                  </TableCell>
                  <TableCell>
                    <WearableBadge connected={student.wearableConnected} />
                  </TableCell>
                  <TableCell>
                    <RiskBadge level={student.riskLevel} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/school-admin/students/${student.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </Link>
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
   UI Helpers
------------------------------ */

function TableHead({ children, className = "" }: any) {
  return (
    <th
      className={`px-4 py-3 text-left font-medium text-muted-foreground ${className}`}
    >
      {children}
    </th>
  );
}

function TableCell({ children, className = "" }: any) {
  return (
    <td className={`px-4 py-3 ${className}`}>
      {children}
    </td>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
        active
          ? "bg-green-100 text-green-700"
          : "bg-gray-200 text-gray-700"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function WearableBadge({ connected }: { connected: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
        connected
          ? "bg-blue-100 text-blue-700"
          : "bg-yellow-100 text-yellow-800"
      }`}
    >
      {connected ? "Connected" : "Not linked"}
    </span>
  );
}

function RiskBadge({ level }: { level: "LOW" | "MEDIUM" | "HIGH" }) {
  const styles = {
    LOW: "bg-green-100 text-green-700",
    MEDIUM: "bg-yellow-100 text-yellow-800",
    HIGH: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${styles[level]}`}
    >
      {level}
    </span>
  );
}

function StudentsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-40 bg-gray-200 rounded" />
      <div className="h-10 w-full bg-gray-200 rounded" />
      <div className="h-64 w-full bg-gray-200 rounded-xl" />
    </div>
  );
}
