"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import Link from "next/link";

/**
 * School Admin – Student Profile
 */
export default function StudentProfilePage() {
  const params = useParams();
  const studentId = params.studentId;

  const { data, isLoading, error } = useQuery({
    queryKey: ["student-profile", studentId],
    queryFn: async () => {
      const res = await api.get(`/school/students/${studentId}`);
      return res.data;
    },
  });

  if (isLoading) return <ProfileSkeleton />;

  if (error) {
    return <div className="text-red-600">Failed to load student profile.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground">
        <Link href="/school-admin/students" className="hover:underline">
          Students
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <InfoCard title="Risk Level">
          <RiskBadge level={data.riskLevel} />
        </InfoCard>

        <InfoCard title="Wearable Status">
          <WearableBadge connected={data.wearable.connected} />
        </InfoCard>

        <InfoCard title="Last Sync">
          <p className="text-sm">
            {data.wearable.lastSync
              ? new Date(data.wearable.lastSync).toLocaleString()
              : "Never"}
          </p>
        </InfoCard>

        <InfoCard title="Assigned Counselor">
          <p className="text-sm">{data.counselor?.name ?? "Not assigned"}</p>
        </InfoCard>
      </div>

      {/* Wellness Summary */}
      <Section title="Wellness Summary">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Metric
            label="Avg Stress (7 days)"
            value={data.metrics.avgStress7d}
          />
          <Metric
            label="Avg Sleep (7 days)"
            value={`${data.metrics.avgSleep7d} hrs`}
          />
          <Metric label="Activity Score" value={data.metrics.activityScore} />
        </div>
      </Section>

      {/* Recent Alerts */}
      <Section title="Recent Alerts">
        {data.alerts.length === 0 ? (
          <p className="text-muted-foreground">No alerts for this student 🎉</p>
        ) : (
          <ul className="space-y-2">
            {data.alerts.map((alert) => (
              <li
                key={alert.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">{alert.type}</p>
                  <p className="text-sm text-muted-foreground">
                    Risk: {alert.riskLevel} •{" "}
                    {new Date(alert.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <Link
                  href="/school-admin/alerts"
                  className="text-blue-600 hover:underline text-sm"
                >
                  View
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <ActionButton href="/school-admin/alerts">View Alerts</ActionButton>
        <ActionButton href="/school-admin/wearables">
          Manage Wearables
        </ActionButton>
        <ActionButton href={`/school-admin/students/${studentId}/edit`}>
          Edit Student
        </ActionButton>
      </div>
    </div>
  );
}

/* -----------------------------
   UI Components
------------------------------ */

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

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border p-3 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">{value ?? "—"}</p>
    </div>
  );
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

function WearableBadge({ connected }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
        connected
          ? "bg-blue-100 text-blue-700"
          : "bg-yellow-100 text-yellow-800"
      }`}
    >
      {connected ? "Connected" : "Not linked"}
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
      className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${styles[level]}`}
    >
      {level}
    </span>
  );
}

function ActionButton({ href, children }) {
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl" />
        ))}
      </div>
      <div className="h-40 bg-gray-200 rounded-xl" />
    </div>
  );
}
