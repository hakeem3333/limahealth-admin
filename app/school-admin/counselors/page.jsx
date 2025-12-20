"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

/**
 * School Admin – Counselors Management
 */
export default function CounselorsPage() {
  const [search, setSearch] = useState("");

  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["counselors", search],
    queryFn: async () => {
      const res = await api.get("/school/counselors", { params: { search } });
      return res.data;
    },
  });

  if (isLoading) return <CounselorsSkeleton />;

  if (error) {
    return <div className="text-red-600">Failed to load counselors.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Counselors</h1>
          <p className="text-muted-foreground">
            Manage counselors and student assignments
          </p>
        </div>

        <Link
          href="/school-admin/counselors/new"
          className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
        >
          + Add Counselor
        </Link>
      </div>

      {/* Search */}
      <div className="max-w-sm">
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      {/* Counselors Table */}
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Assigned Students</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-6 text-center text-muted-foreground"
                >
                  No counselors found.
                </td>
              </tr>
            ) : (
              data.map((counselor) => (
                <tr key={counselor.id} className="border-t">
                  <TableCell>
                    <Link
                      href={`/school-admin/counselors/${counselor.id}`}
                      className="font-medium hover:underline"
                    >
                      {counselor.name}
                    </Link>
                  </TableCell>
                  <TableCell>{counselor.email}</TableCell>
                  <TableCell>{counselor.studentsCount}</TableCell>
                  <TableCell>
                    <StatusBadge active={counselor.isActive} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/school-admin/counselors/${counselor.id}`}
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
----------------------------- */

function TableHead({ children, className = "" }) {
  return (
    <th
      className={`px-4 py-3 text-left font-medium text-muted-foreground ${className}`}
    >
      {children}
    </th>
  );
}

function TableCell({ children, className = "" }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
        active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function CounselorsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-40 bg-gray-200 rounded" />
      <div className="h-10 w-64 bg-gray-200 rounded" />
      <div className="h-64 w-full bg-gray-200 rounded-xl" />
    </div>
  );
}
