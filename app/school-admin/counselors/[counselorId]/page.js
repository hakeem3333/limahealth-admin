"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

/* -----------------------------
   Types
------------------------------ */

type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

interface Student {
  id: string;
  name: string;
  riskLevel: RiskLevel;
  wearableConnected: boolean;
}

interface Intervention {
  id: string;
  studentName: string;
  note: string;
  createdAt: string;
}

interface CounselorProfile {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  activeAlerts: number;
  lastActivity: string | null;
  students: Student[];
  interventions: Intervention[];
}

/* -----------------------------
   Page
------------------------------ */

export default function CounselorProfilePage() {
  const { counselorId } = useParams<{ counselorId: string }>();

  const {
    data,
    isLoading,
    error,
  } = useQuery<CounselorProfile>({
    queryKey: ["counselor-profile", counselorId],
    enabled: !!counselorId,
    queryFn: async () => {
      const res = await api.get(
        `/school/counselors/${counselorId}`
      );
      return res.data;
    },
  });

  if (isLoading) return <ProfileSkeleton />;

  if (error || !data) {
    return (
      <div className="text-red-600">
        Failed to load counselor profile.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground">
        <Link
          href="/school-admin/counselors"
          className="hover:underline"
        >
          Counselors
        </Link>{" "}
        / {data.name}
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{data.name}</h1>
          <p className="text-muted-foreground">{data.email}</p>
        </div>

        <StatusBadge active={data.isActive} />
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <InfoCard title="Assigned Students">
          <p className="text-2xl font-bold">
            {data.students.length}
          </p>
        </InfoCard>

        <InfoCard title="Active Alerts">
          <p className="text-2xl font-bold">
            {data.activeAlerts}
          </p>
        </InfoCard>

        <InfoCard title="Last Activity">
          <p className="text-sm">
            {data.lastActivity
              ? formatDateTime(data.lastActivity)
              : "No activity"}
          </p>
        </InfoCard>
      </div>

      {/* Assigned Students */}
      <Section title="Assigned Students">
        {data.students.length === 0 ? (
          <p className="text-muted-foreground">
            No students assigned.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <TableHead scope="col">Name</TableHead>
                  <TableHead scope="col">Risk Level</TableHead>
                  <TableHead scope="col">Wearable</TableHead>
                  <TableHead scope="col" className="text-right">
                    Profile
                  </TableHead>
                </tr>
              </thead>
              <tbody>
                {data.students.map((student) => (
                  <tr key={student.id} className="border-t">
                    <TableCell>{student.name}</TableCell>
                    <TableCell>
                      <RiskBadge level={student.riskLevel} />
                    </TableCell>
                    <TableCell>
                      {student.wearableConnected
                        ? "Connected"
                        : "Not linked"}
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Recent Interventions */}
      <Section title="Recent Interventions">
        {data.interventions.length === 0 ? (
          <p className="text-muted-foreground">
            No interventions recorded.
          </p>
        ) : (
          <ul className="space-y-2">
            {data.interventions.map((i) => (
              <li
                key={i.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">
                    {i.studentName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {i.note}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDate(i.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <ActionButton disabled>
          Assign Students
        </ActionButton>
        <ActionButton disabled>
          Deactivate Counselor
        </ActionButton>
      </div>
    </div>
  );
}

/* -----------------------------
   Helpers
------------------------------ */

function formatDateTime(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    dateStyle: "medium",
  });
}

/* -----------------------------
   UI Components
------------------------------ */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-white p-4 dark:bg-gray-900">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-white p-4 dark:bg-gray-900">
      <p className="mb-2 text-sm text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
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
  return (
    <td className={`px-4 py-3 ${className}`}>
      {children}
    </td>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
        active
          ? "bg-green-100 text-green-700"
          : "bg-gray-200 text-gray-700"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function RiskBadge({ level }: { level: RiskLevel }) {
  const styles: Record<RiskLevel, string> = {
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

function ActionButton({
  children,
  disabled = false,
}: {
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      className={`rounded-md border px-4 py-2 text-sm font-medium transition ${
        disabled
          ? "cursor-not-allowed opacity-50"
          : "hover:bg-gray-50 dark:hover:bg-gray-800"
      }`}
    >
      {children}
    </button>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 w-40 rounded bg-gray-200" />
      <div className="h-8 w-64 rounded bg-gray-200" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-xl bg-gray-200"
          />
        ))}
      </div>
      <div className="h-48 rounded-xl bg-gray-200" />
    </div>
  );
}
