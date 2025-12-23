"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/axios";

export default function AuditLogsPage() {
  const [action, setAction] = useState("");
  const [actorRole, setActorRole] = useState("");

  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["audit-logs", action, actorRole],
    queryFn: async () => {
      const res = await api.get("/super-admin/audit-logs", {
        params: { action, actorRole },
      });
      return res.data;
    },
  });

  if (isLoading) return <p>Loading audit logs...</p>;
  if (error) return <p>Failed to load audit logs.</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">
          Security & compliance activity across the platform
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          placeholder="Action (e.g. UPDATE_SCHOOL)"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        />
        <select
          value={actorRole}
          onChange={(e) => setActorRole(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="">All Roles</option>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="SCHOOL_ADMIN">School Admin</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto rounded-xl border bg-white dark:bg-gray-900">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
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
            {data.map((log) => (
              <tr key={log.id} className="border-t">
                <Td>{log.actorName}</Td>
                <Td>{log.actorRole}</Td>
                <Td className="font-mono text-xs">{log.action}</Td>
                <Td>
                  {log.targetType}
                  {log.targetId && (
                    <span className="text-xs text-muted-foreground">
                      {" "}
                      ({log.targetId})
                    </span>
                  )}
                </Td>
                <Td>{log.ipAddress}</Td>
                <Td>{new Date(log.createdAt).toLocaleString()}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* -----------------------------
   Table Helpers
------------------------------ */

function Th({ children }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
      {children}
    </th>
  );
}

function Td({ children }) {
  return <td className="px-4 py-3">{children}</td>;
}
