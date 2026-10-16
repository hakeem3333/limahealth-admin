"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { api } from "@/lib/axios";

/* -----------------------------
   Helpers
------------------------------ */

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

/* -----------------------------
   Page
------------------------------ */

export default function AuditLogsPage() {
  const [action, setAction] = useState("");
  const [actorRole, setActorRole] = useState("");
  const [page, setPage] = useState(1);

  const debouncedAction = useDebounce(action);

  const { data, isLoading, error } = useQuery({
    queryKey: ["audit-logs", debouncedAction, actorRole, page],
    queryFn: async () => {
      const res = await api.get("/super-admin/audit-logs", {
        params: {
          action: debouncedAction,
          actorRole,
          page,
          limit: 20,
        },
      });
      return res.data;
    },
    keepPreviousData: true,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const logs = Array.isArray(data?.logs) ? data.logs : [];
  const hasNextPage = Boolean(data?.hasNextPage);

  /* -----------------------------
     States
  ------------------------------ */

  if (isLoading) {
    return <p className="p-8 text-center text-gray-500 dark:text-gray-400">Loading audit logs...</p>;
  }

  if (error) {
    console.error("Audit logs fetch failed:", error);
    return (
      <p className="p-8 text-center text-red-500 dark:text-red-400">Failed to load audit logs.</p>
    );
  }

  /* -----------------------------
     UI
  ------------------------------ */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-lh-navy dark:text-white">Audit Logs</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Security & compliance activity across the platform
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          placeholder="Action (e.g. UPDATE_SCHOOL)"
          value={action}
          onChange={(e) => {
            setPage(1);
            setAction(e.target.value);
          }}
          className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 dim:bg-white dark:text-white dark:placeholder:text-gray-500 rounded-md px-3 py-2 text-sm"
        />

        <select
          value={actorRole}
          onChange={(e) => {
            setPage(1);
            setActorRole(e.target.value);
          }}
          className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 dim:bg-white dark:text-white dark:placeholder:text-gray-500 rounded-md px-3 py-2 text-sm"
        >
          <option value="">All Roles</option>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="SCHOOL_ADMIN">School Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 dim:border-slate-300/70 bg-white dark:bg-gray-900 dim:bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/60">
            <tr>
              <Th>Actor</Th>
              <Th>Role</Th>
              <Th>Action</Th>
              <Th>Target</Th>
              <Th>IP Address</Th>
              <Th>Date</Th>
            </tr>
          </thead>

          <tbody>
            {logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log.id} className="border-t border-gray-100 dark:border-gray-800">
                  <Td>{log.actorName || "N/A"}</Td>
                  <Td>{log.actorRole || "N/A"}</Td>
                  <Td className="font-mono text-xs">{log.action || "N/A"}</Td>
                  <Td>
                    {log.targetType || "N/A"}
                    {log.targetId && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {" "}
                        ({log.targetId})
                      </span>
                    )}
                  </Td>
                  <Td>{log.ipAddress || "N/A"}</Td>
                  <Td>
                    {log.createdAt
                      ? new Date(log.createdAt).toLocaleString()
                      : "N/A"}
                  </Td>
                </tr>
              ))
            ) : (
              <tr>
                <Td
                  colSpan={6}
                  className="text-center py-10 text-gray-500 dark:text-gray-400"
                >
                  No audit logs found for the selected filters.
                </Td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 dim:bg-white dark:text-white rounded-md px-3 py-1 text-sm disabled:opacity-50"
        >
          Previous
        </button>

        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!hasNextPage}
          className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 dim:bg-white dark:text-white rounded-md px-3 py-1 text-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

/* -----------------------------
   Table Helpers
------------------------------ */

function Th({ children }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
      {children}
    </th>
  );
}

function Td({ children, className = "" }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
