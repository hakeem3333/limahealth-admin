"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

/* -----------------------------
   Types
------------------------------ */

type Severity = "ALL" | "LOW" | "MEDIUM" | "HIGH";
type Status = "ALL" | "OPEN" | "ACKNOWLEDGED" | "RESOLVED";

interface Alert {
  id: string;
  studentId: string;
  studentName: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  trigger: string;
  counselorName?: string | null;
  status: "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
  createdAt: string;
}

/* -----------------------------
   Page
------------------------------ */

export default function AlertsPage() {
  const [severity, setSeverity] = useState<Severity>("ALL");
  const [status, setStatus] = useState<Status>("ALL");

  const {
    data = [],
    isLoading,
    error,
  } = useQuery<Alert[]>({
    queryKey: ["school-alerts", severity, status],
    queryFn: async () => {
      const res = await api.get("/school/alerts", {
        params: {
          severity: severity === "ALL" ? undefined : severity,
          status: status === "ALL" ? undefined : status,
        },
      });
      return res.data;
    },
  });

  if (isLoading) return <AlertsSkeleton />;

  if (error) {
    return <div className="text-red-600">Failed to load alerts.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Alerts</h1>
        <p className="text-muted-foreground">
          AI-generated student stress and risk alerts
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <FilterSelect
          label="Severity"
          value={severity}
          onChange={setSeverity}
          options={["ALL", "LOW", "MEDIUM", "HIGH"]}
        />
        <FilterSelect
          label="Status"
          value={status}
          onChange={setStatus}
          options={["ALL", "OPEN", "ACKNOWLEDGED", "RESOLVED"]}
        />
      </div>

      {/* Alerts Table */}
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <TableHead scope="col">Student</TableHead>
              <TableHead scope="col">Severity</TableHead>
              <TableHead scope="col">Trigger</TableHead>
              <TableHead scope="col">Counselor</TableHead>
              <TableHead scope="col">Status</TableHead>
              <TableHead scope="col">Created</TableHead>
              <TableHead scope="col" className="text-right">
                Action
              </TableHead>
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-6 text-center text-muted-foreground"
                >
                  No alerts found.
                </td>
              </tr>
            ) : (
              data.map((alert) => (
                <tr key={alert.id} className="border-t">
                  <TableCell>
                    <Link
                      href={`/school-admin/students/${alert.studentId}`}
                      className="font-medium hover:underline"
                    >
                      {alert.studentName}
                    </Link>
                  </TableCell>

                  <TableCell>
                    <SeverityBadge level={alert.severity} />
                  </TableCell>

                  <TableCell>{alert.trigger}</TableCell>

                  <TableCell>
                    {alert.counselorName ?? "Unassigned"}
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={alert.status} />
                  </TableCell>

                  <TableCell>
                    {new Date(alert.createdAt).toLocaleDateString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {alert.status === "OPEN" && (
                        <ActionButton
                          onClick={() =>
                            console.log("Acknowledge", alert.id)
                          }
                        >
                          Acknowledge
                        </ActionButton>
                      )}
                      {alert.status !== "RESOLVED" && (
                        <ActionButton
                          variant="danger"
                          onClick={() =>
                            console.log("Resolve", alert.id)
                          }
                        >
                          Resolve
                        </ActionButton>
                      )}
                    </div>
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
   UI Components
------------------------------ */

function FilterSelect<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: readonly T[];
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="rounded-md border px-3 py-2 text-sm"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}

function TableHead({
  children,
  className = "",
  scope = "col",
}: {
  children: React.ReactNode;
  className?: string;
  scope?: "col" | "row";
}) {
  return (
    <th
      scope={scope}
      className={`px-4 py-3 text-left font-medium text-muted-foreground ${className}`}
    >
      {children}
    </th>
  );
}

function TableCell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

function SeverityBadge({ level }: { level: Alert["severity"] }) {
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

function StatusBadge({ status }: { status: Alert["status"] }) {
  const styles = {
    OPEN: "bg-red-100 text-red-700",
    ACKNOWLEDGED: "bg-yellow-100 text-yellow-800",
    RESOLVED: "bg-green-100 text-green-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function ActionButton({
  children,
  onClick,
  variant = "default",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "danger";
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
        variant === "danger"
          ? "bg-red-600 text-white hover:bg-red-700"
          : "border hover:bg-gray-50 dark:hover:bg-gray-800"
      }`}
    >
      {children}
    </button>
  );
}

function AlertsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-40 rounded bg-gray-200" />
      <div className="h-12 w-72 rounded bg-gray-200" />
      <div className="h-72 w-full rounded-xl bg-gray-200" />
    </div>
  );
}
