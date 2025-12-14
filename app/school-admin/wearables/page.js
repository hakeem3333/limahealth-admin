"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

/**
 * School Admin – Wearables Management
 */
export default function WearablesPage() {
  const [filter, setFilter] =
    (useState < "all") | "connected" | ("not_connected" > "all");

  const { data, isLoading, error } = useQuery({
    queryKey: ["school-wearables", filter],
    queryFn: async () => {
      const res = await api.get("/school/wearables", {
        params: {
          status:
            filter === "all"
              ? undefined
              : filter === "connected"
              ? "connected"
              : "not_connected",
        },
      });
      return res.data;
    },
  });

  if (isLoading) return <WearablesSkeleton />;

  if (error) {
    return <div className="text-red-600">Failed to load wearable data.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Wearables</h1>
        <p className="text-muted-foreground">
          Monitor Fitbit and Garmin connections
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <FilterButton
          active={filter === "all"}
          onClick={() => setFilter("all")}
        >
          All
        </FilterButton>
        <FilterButton
          active={filter === "connected"}
          onClick={() => setFilter("connected")}
        >
          Connected
        </FilterButton>
        <FilterButton
          active={filter === "not_connected"}
          onClick={() => setFilter("not_connected")}
        >
          Not Linked
        </FilterButton>
      </div>

      {/* Wearables Table */}
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <TableHead>Student</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Sync</TableHead>
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
                  No wearable records found.
                </td>
              </tr>
            ) : (
              data.map((row: any) => (
                <tr key={row.studentId} className="border-t">
                  <TableCell>
                    <Link
                      href={`/school-admin/students/${row.studentId}`}
                      className="font-medium hover:underline"
                    >
                      {row.studentName}
                    </Link>
                  </TableCell>
                  <TableCell>{row.device ?? "—"}</TableCell>
                  <TableCell>
                    <WearableBadge connected={row.connected} />
                  </TableCell>
                  <TableCell>
                    {row.lastSync
                      ? new Date(row.lastSync).toLocaleString()
                      : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.connected ? (
                      <button className="text-sm text-red-600 hover:underline">
                        Revoke
                      </button>
                    ) : (
                      <button className="text-sm text-blue-600 hover:underline">
                        Re-link
                      </button>
                    )}
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

function FilterButton({
  children,
  active,
  onClick,
}: {
  children: any,
  active: boolean,
  onClick: () => void,
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium border transition ${
        active ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

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
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
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

function WearablesSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-40 bg-gray-200 rounded" />
      <div className="h-10 w-64 bg-gray-200 rounded" />
      <div className="h-64 w-full bg-gray-200 rounded-xl" />
    </div>
  );
}
