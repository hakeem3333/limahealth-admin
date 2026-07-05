"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import {
  Users,
  AlertCircle,
  History,
  ChevronLeft,
  UserCheck,
  Calendar,
  ExternalLink,
  ClipboardList,
  UserMinus,
  UserPlus,
} from "lucide-react";

export default function CounselorProfilePage() {
  const params = useParams();
  const staffId = params.staffId;

  const { data, isLoading, error } = useQuery({
    queryKey: ["counselor-profile", staffId],
    queryFn: async () => {
      const res = await api.get(`/org/counselors/${staffId}`);
      return res.data;
    },
  });

  if (isLoading) return <ProfileSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-red-50 rounded-3xl border border-red-100">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-red-900">
          Failed to load counselor
        </h2>
        <p className="text-red-700/70 max-w-xs mx-auto mt-2">
          The counselor profile could not be retrieved. Please check your
          connection.
        </p>
        <Link
          href="/org-admin/counselors"
          className="mt-6 text-sm font-bold text-red-900 underline"
        >
          Back to List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      {/* Breadcrumb & Navigation */}
      <nav className="flex items-center gap-2 text-sm font-bold text-gray-400">
        <Link
          href="/org-admin/counselors"
          className="hover:text-blue-600 transition-colors flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Counselors
        </Link>
        <span>/</span>
        <span className="text-gray-900">{data.name}</span>
      </nav>

      {/* Profile Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-8">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-100">
            {data.name.charAt(0)}
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
          <button className="flex items-center gap-2 bg-white border border-gray-200 px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all text-sm">
            <UserPlus className="h-4 w-4" />
            Assign Students
          </button>
          <button className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 px-5 py-2.5 rounded-xl font-bold hover:bg-red-100 transition-all text-sm">
            <UserMinus className="h-4 w-4" />
            Deactivate
          </button>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Assigned Caseload"
          value={data.students.length}
          subtitle="Students"
          icon={<Users className="h-6 w-6 text-blue-600" />}
        />
        <MetricCard
          title="Active Risk Alerts"
          value={data.activeAlerts}
          subtitle="Requires attention"
          icon={<AlertCircle className="h-6 w-6 text-orange-500" />}
          variant={data.activeAlerts > 0 ? "warning" : "default"}
        />
        <MetricCard
          title="Last Logged Activity"
          value={
            data.lastActivity
              ? new Date(data.lastActivity).toLocaleDateString()
              : "Never"
          }
          subtitle={
            data.lastActivity ? "Productive session" : "No login history"
          }
          icon={<History className="h-6 w-6 text-purple-500" />}
        />
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Assigned Students Table */}
        <Section
          title="Assigned Students"
          icon={<UserCheck className="h-5 w-5" />}
        >
          {data.students.length === 0 ? (
            <div className="p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-gray-400 font-medium">
                No students currently assigned to this counselor.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50">
                    <TableHead>Student</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.students.map((student) => (
                    <tr
                      key={student.id}
                      className="group hover:bg-gray-50/50 transition-colors"
                    >
                      <TableCell className="font-bold text-gray-900">
                        {student.name}
                      </TableCell>
                      <TableCell>
                        <RiskBadge level={student.riskLevel} />
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-lg ${student.wearableConnected ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}
                        >
                          {student.wearableConnected ? "LINKED" : "UNLINKED"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/org-admin/students/${student.id}`}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors inline-block"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </TableCell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {/* Recent Interventions / Notes */}
        <Section
          title="Recent Interventions"
          icon={<ClipboardList className="h-5 w-5" />}
        >
          {data.interventions.length === 0 ? (
            <div className="p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-gray-400 font-medium">
                No intervention history recorded yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.interventions.map((i) => (
                <div
                  key={i.id}
                  className="group p-4 rounded-2xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-900">
                      {i.studentName}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <Calendar className="h-3 w-3" />
                      {new Date(i.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed italic">
                    "{i.note}"
                  </p>
                </div>
              ))}
              <button className="w-full py-3 text-sm font-bold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                View Full Activity Log
              </button>
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

/* ----------------------------- UI Components ----------------------------- */

function Section({ title, icon, children }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">{icon}</div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon, variant = "default" }) {
  const themes = {
    default: "bg-white border-gray-100",
    warning: "bg-orange-50 border-orange-100",
  };

  return (
    <div
      className={`rounded-3xl border p-6 shadow-sm transition-all hover:shadow-md ${themes[variant]}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-gray-50 rounded-2xl">{icon}</div>
      </div>
      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
        {title}
      </p>
      <h3 className="text-3xl font-black text-gray-900 mt-1">{value}</h3>
      <p className="text-sm text-gray-500 font-medium mt-1">{subtitle}</p>
    </div>
  );
}

function TableHead({ children, className = "" }) {
  return (
    <th
      className={`px-4 py-3 text-xs font-black text-gray-400 uppercase tracking-widest ${className}`}
    >
      {children}
    </th>
  );
}

function TableCell({ children, className = "" }) {
  return <td className={`px-4 py-4 text-sm ${className}`}>{children}</td>;
}

function StatusBadge({ active }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tight border ${
        active
          ? "bg-green-50 text-green-700 border-green-100"
          : "bg-gray-100 text-gray-500 border-gray-200"
      }`}
    >
      {active ? "Active Counselor" : "Inactive Account"}
    </span>
  );
}

function RiskBadge({ level }) {
  const styles = {
    LOW: "bg-green-50 text-green-600",
    MEDIUM: "bg-amber-50 text-amber-600",
    HIGH: "bg-red-50 text-red-600",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter ${styles[level] || "bg-gray-100"}`}
    >
      {level} RISK
    </span>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-6 w-32 bg-gray-200 rounded" />
      <div className="h-24 w-full bg-gray-200 rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-32 bg-gray-200 rounded-3xl" />
        <div className="h-32 bg-gray-200 rounded-3xl" />
        <div className="h-32 bg-gray-200 rounded-3xl" />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="h-96 bg-gray-200 rounded-3xl" />
        <div className="h-96 bg-gray-200 rounded-3xl" />
      </div>
    </div>
  );
}
