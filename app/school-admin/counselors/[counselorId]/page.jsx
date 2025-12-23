"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

/**
 * School Admin – Counselor Profile
 */
export default function CounselorProfilePage() {
  const params = useParams();
  const counselorId = params.counselorId;

  const { data, isLoading, error } = useQuery({
    queryKey: ["counselor-profile", counselorId],
    queryFn: async () => {
      const res = await api.get(`/school/counselors/${counselorId}`);
      return res.data;
    },
  });

  if (isLoading) return <ProfileSkeleton />;

  if (error) {
    return (
      <div className="text-red-600">Failed to load counselor profile.</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground">
        <Link href="/school-admin/counselors" className="hover:underline">
          Counselors
        </Link>{" "}
        / {data.name}
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{data.name}</h1>
          <p className="text-muted-foreground">{data.email}</p>
        </div>

        <StatusBadge active={data.isActive} />
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InfoCard title="Assigned Students">
          <p className="text-2xl font-bold">{data.students.length}</p>
        </InfoCard>

        <InfoCard title="Active Alerts">
          <p className="text-2xl font-bold">{data.activeAlerts}</p>
        </InfoCard>

        <InfoCard title="Last Activity">
          <p className="text-sm">
            {data.lastActivity
              ? new Date(data.lastActivity).toLocaleString()
              : "No activity"}
          </p>
        </InfoCard>
      </div>

      {/* Assigned Students */}
      <Section title="Assigned Students">
        {data.students.length === 0 ? (
          <p className="text-muted-foreground">No students assigned.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <TableHead>Name</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Wearable</TableHead>
                  <TableHead className="text-right">Profile</TableHead>
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
                      {student.wearableConnected ? "Connected" : "Not linked"}
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
          <p className="text-muted-foreground">No interventions recorded.</p>
        ) : (
          <ul className="space-y-2">
            {data.interventions.map((i) => (
              <li
                key={i.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">{i.studentName}</p>
                  <p className="text-sm text-muted-foreground">{i.note}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(i.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <ActionButton href="#">Assign Students</ActionButton>
        <ActionButton href="#">Deactivate Counselor</ActionButton>
      </div>
    </div>
  );
}

/* ----------------------------- UI Components ----------------------------- */

function Section({ title, children }) {
  return (
    <div className="rounded-xl border bg-white dark:bg-gray-900 p-4">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function InfoCard({ title, children }) {
  return (
    <div className="rounded-xl border bg-white dark:bg-gray-900 p-4">
      <p className="text-sm text-muted-foreground mb-2">{title}</p>
      {children}
    </div>
  );
}

function TableHead({ children }) {
  return (
    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
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
      className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
        active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function RiskBadge({ level }) {
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

function ActionButton({ children, href }) {
  return (
    <Link
      href={href}
      className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
    >
      {children}
    </Link>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 w-40 bg-gray-200 rounded" />
      <div className="h-8 w-64 bg-gray-200 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl" />
        ))}
      </div>
      <div className="h-48 bg-gray-200 rounded-xl" />
    </div>
  );
}
