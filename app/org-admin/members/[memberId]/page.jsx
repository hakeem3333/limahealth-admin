"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import Link from "next/link";
import {
  ChevronLeft,
  Watch,
  User,
  Activity,
  Bell,
  Moon,
  Zap,
  ExternalLink,
  Settings,
  History,
} from "lucide-react";

export default function StudentProfilePage() {
  const params = useParams();
  const memberId = params.memberId;

  const { data, isLoading, error } = useQuery({
    queryKey: ["student-profile", memberId],
    queryFn: async () => {
      const res = await api.get(`/org/students/${memberId}`);
      return res.data;
    },
  });

  if (isLoading) return <ProfileSkeleton />;
  if (error || !data) return <ErrorState />; // Create a small helper for this

  // Fallback objects to prevent "cannot read property of undefined"
  const wearable = data.wearable || { connected: false, lastSync: null };
  const metrics = data.metrics || {
    avgStress7d: 0,
    avgSleep7d: 0,
    activityScore: 0,
  };

  return (
    <div className="space-y-8 py-4">
      {/* ... Navigation remains same ... */}

      {/* Header - Added optional chaining for safety */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-8">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 bg-gray-100 rounded-3xl flex items-center justify-center text-gray-400 shadow-inner">
            <User className="h-10 w-10" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                {data.name}
              </h1>
              <StatusBadge active={data.isActive} />
            </div>
            <p className="text-lg text-gray-500 font-medium mt-1">
              {data.email}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <ActionButton href={`/org-admin/students/${memberId}/edit`}>
            <Settings className="h-4 w-4" />
            Edit Profile
          </ActionButton>
          {/* Ensure this path matches your sidebar/router exactly */}
          <ActionButton href="/org-admin/wearables" variant="primary">
            <Watch className="h-4 w-4" />
            Sync Device
          </ActionButton>
        </div>
      </div>

      {/* Quick Status Grid - Using the fallback 'wearable' object */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <InfoCard title="Current Risk Status">
          <RiskBadge level={data.riskLevel || "LOW"} />
        </InfoCard>

        <InfoCard title="Device Connection">
          <WearableBadge connected={wearable.connected} />
        </InfoCard>

        <InfoCard title="Assigned Counselor">
          {/* ... existing counselor logic ... */}
        </InfoCard>

        <InfoCard title="Last Device Sync">
          <div className="flex items-center gap-2 text-gray-600 mt-1">
            <History className="h-4 w-4 opacity-50" />
            <span className="text-sm font-medium">
              {wearable.lastSync
                ? new Date(wearable.lastSync).toLocaleDateString()
                : "Never"}
            </span>
          </div>
        </InfoCard>
      </div>

      {/* Wellness Metrics - Using the fallback 'metrics' object */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <Section
            title="7-Day Wellness Average"
            icon={<Activity className="h-5 w-5 text-blue-600" />}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              <Metric
                label="Stress Level"
                value={metrics.avgStress7d}
                icon={<Zap className="h-4 w-4 text-orange-500" />}
                sub="0-100 Scale"
              />
              <Metric
                label="Sleep Quality"
                value={`${metrics.avgSleep7d}h`}
                icon={<Moon className="h-4 w-4 text-purple-500" />}
                sub="Daily Average"
              />
              <Metric
                label="Activity Score"
                value={metrics.activityScore}
                icon={<Activity className="h-4 w-4 text-green-500" />}
                sub="Movement Index"
              />
            </div>
          </Section>
          {/* ... Alerts Timeline remains same ... */}
        </div>
        {/* ... Sidebar remains same ... */}
      </div>
    </div>
  );
}

/* -----------------------------
   UI Components
------------------------------ */

function Section({ title, icon, children }) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gray-50 rounded-xl">{icon}</div>
        <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function InfoCard({ title, children }) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
        {title}
      </p>
      {children}
    </div>
  );
}

function Metric({ label, value, icon, sub }) {
  return (
    <div className="rounded-2xl border border-gray-50 bg-gray-50/30 p-4 flex flex-col items-center text-center">
      <div className="p-2 bg-white rounded-lg shadow-sm mb-3">{icon}</div>
      <p className="text-3xl font-black text-gray-900">{value ?? "—"}</p>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
        {label}
      </p>
      <p className="text-[10px] text-gray-400 mt-1 italic">{sub}</p>
    </div>
  );
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
      {active ? "Active Enrollment" : "Withdrawn / Inactive"}
    </span>
  );
}

function WearableBadge({ connected }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
        connected ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700"
      }`}
    >
      <Watch className="h-3 w-3" />
      {connected ? "Device Connected" : "Device Unlinked"}
    </span>
  );
}

function RiskBadge({ level }) {
  const styles = {
    LOW: "bg-green-50 text-green-700 border-green-100",
    MEDIUM: "bg-amber-50 text-amber-600 border-amber-100",
    HIGH: "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <span
      className={`inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest border ${styles[level]}`}
    >
      {level} RISK
    </span>
  );
}

function ActionButton({ href, children, variant = "secondary" }) {
  const styles = {
    secondary: "bg-white border-gray-200 text-gray-600 hover:bg-gray-50",
    primary:
      "bg-blue-600 border-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100",
  };

  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-bold transition-all ${styles[variant]}`}
    >
      {children}
    </Link>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-6 w-40 bg-gray-200 rounded" />
      <div className="h-24 w-full bg-gray-200 rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-3xl" />
        ))}
      </div>
      <div className="h-64 bg-gray-200 rounded-3xl" />
    </div>
  );
}
