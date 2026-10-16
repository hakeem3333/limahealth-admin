"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import toast from "react-hot-toast";
import DeactivateCounselorModal from "@/components/DeactivateCounselorModal";
import { useAuth } from "@/context/AuthContext";
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
  X,
  Search,
} from "lucide-react";

export default function CounselorProfilePage() {
  const params = useParams();
  const staffId = params.staffId;
  const { memberLabel, membersLabel, supportLabel, supportsLabel } = useAuth();
  const queryClient = useQueryClient();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["counselor-profile", staffId],
    queryFn: async () => {
      const res = await api.get(`/org/counselors/${staffId}`);
      return res.data;
    },
  });

  const setActive = useMutation({
    mutationFn: (isActive) => api.patch(`/org/counselors/${staffId}/status`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counselor-profile", staffId] });
      queryClient.invalidateQueries({ queryKey: ["support-staff"] });
    },
    onError: (err) => toast.error(err?.response?.data?.message ?? "Couldn't update status"),
  });

  if (isLoading) return <ProfileSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-red-50 dark:bg-red-500/10 rounded-3xl border border-red-100 dark:border-red-500/20">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-red-900 dark:text-red-400">
          Failed to load {supportLabel.toLowerCase()}
        </h2>
        <p className="text-red-700/70 dark:text-red-400/70 max-w-xs mx-auto mt-2">
          The {supportLabel.toLowerCase()} profile could not be retrieved. Please check your
          connection.
        </p>
        <Link
          href="/org-admin/support-staff"
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
          href="/org-admin/support-staff"
          className="hover:text-blue-600 transition-colors flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          {supportsLabel}
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white">{data.name}</span>
      </nav>

      {/* Profile Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-8">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-100">
            {data.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
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
          <button
            onClick={() => setShowAssignModal(true)}
            disabled={!data.isActive}
            title={data.isActive ? undefined : `Reactivate this ${supportLabel.toLowerCase()} to assign ${membersLabel.toLowerCase()}`}
            className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-5 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus className="h-4 w-4" />
            Assign {membersLabel}
          </button>
          <button
            onClick={() =>
              data.isActive && data.students.length > 0
                ? setShowDeactivateModal(true)
                : setActive.mutate(!data.isActive)
            }
            disabled={setActive.isPending}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all text-sm disabled:opacity-50 ${
              data.isActive
                ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20"
                : "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-500/20 hover:bg-green-100 dark:hover:bg-green-500/20"
            }`}
          >
            <UserMinus className="h-4 w-4" />
            {data.isActive ? "Deactivate" : "Reactivate"}
          </button>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Assigned Caseload"
          value={data.students.length}
          subtitle={membersLabel}
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
          title={`Assigned ${membersLabel}`}
          icon={<UserCheck className="h-5 w-5" />}
        >
          {data.students.length === 0 ? (
            <div className="p-12 text-center bg-gray-50 dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
              <p className="text-gray-400 font-medium">
                No {membersLabel.toLowerCase()} currently assigned to this {supportLabel.toLowerCase()}.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50 dark:border-gray-800">
                    <TableHead>{memberLabel}</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {data.students.map((student) => (
                    <tr
                      key={student.id}
                      className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <TableCell className="font-bold text-gray-900 dark:text-white">
                        {student.name}
                      </TableCell>
                      <TableCell>
                        <RiskBadge level={student.riskLevel} />
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-lg ${student.wearableConnected ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400" : "bg-gray-100 dark:bg-gray-800 text-gray-400"}`}
                        >
                          {student.wearableConnected ? "LINKED" : "UNLINKED"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/org-admin/members/${student.id}`}
                          className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-block"
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
            <div className="p-12 text-center bg-gray-50 dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
              <p className="text-gray-400 font-medium">
                No intervention history recorded yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.interventions.map((i) => (
                <div
                  key={i.id}
                  className="group p-4 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-blue-100 dark:hover:border-blue-500/30 hover:bg-blue-50/30 dark:hover:bg-blue-500/5 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-900 dark:text-white">
                      {i.studentName}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <Calendar className="h-3 w-3" />
                      {new Date(i.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic">
                    &quot;{i.note}&quot;
                  </p>
                </div>
              ))}
              <button className="w-full py-3 text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">
                View Full Activity Log
              </button>
            </div>
          )}
        </Section>
      </div>

      {showDeactivateModal && (
        <DeactivateCounselorModal
          counselor={{ id: data.id, name: data.name }}
          studentsCount={data.students.length}
          onClose={() => setShowDeactivateModal(false)}
          onDone={() => {
            queryClient.invalidateQueries({ queryKey: ["counselor-profile", staffId] });
            queryClient.invalidateQueries({ queryKey: ["support-staff"] });
            setShowDeactivateModal(false);
          }}
        />
      )}

      {showAssignModal && (
        <AssignStudentsModal
          counselorId={staffId}
          currentStudentIds={data.students.map((s) => s.id)}
          onClose={() => setShowAssignModal(false)}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["counselor-profile", staffId] });
            setShowAssignModal(false);
          }}
        />
      )}
    </div>
  );
}

/* ----------------------------- UI Components ----------------------------- */

function AssignStudentsModal({ counselorId, currentStudentIds, onClose, onSaved }) {
  const { membersLabel } = useAuth();
  const membersWord = membersLabel.toLowerCase();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(() => new Set(currentStudentIds));

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["members-for-assign"],
    queryFn: async () => (await api.get("/org/members")).data,
  });

  const assign = useMutation({
    mutationFn: (studentIds) =>
      api.post(`/org/counselors/${counselorId}/assign`, { studentIds }),
    onSuccess: () => onSaved(),
    onError: (err) => toast.error(err?.response?.data?.message ?? "Couldn't save caseload"),
  });

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = members.filter((m) =>
    (m.name || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-black text-gray-900 dark:text-white">Assign {membersLabel}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${membersWord}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 space-y-1">
          {isLoading ? (
            <p className="text-sm text-gray-400 text-center py-8">Loading {membersWord}…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No {membersWord} found.</p>
          ) : (
            filtered.map((m) => (
              <label
                key={m.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selected.has(m.id)}
                  onChange={() => toggle(m.id)}
                  className="h-4 w-4 rounded accent-blue-600"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{m.name}</p>
                  <p className="text-xs text-gray-400 truncate">{m.email}</p>
                </div>
              </label>
            ))
          )}
        </div>

        <div className="p-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {selected.size} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => assign.mutate([...selected])}
              disabled={assign.isPending}
              className="px-5 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all text-sm disabled:opacity-50"
            >
              {assign.isPending ? "Saving…" : "Save Caseload"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="bg-white dark:bg-gray-900 dim:bg-white rounded-3xl border border-gray-100 dark:border-gray-800 dim:border-slate-300/70 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">{icon}</div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon, variant = "default" }) {
  const themes = {
    default: "bg-white dark:bg-gray-900 dim:bg-white border-gray-100 dark:border-gray-800 dim:border-slate-300/70",
    warning: "bg-orange-50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/20",
  };

  return (
    <div
      className={`rounded-3xl border p-6 shadow-sm transition-all hover:shadow-md ${themes[variant]}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl">{icon}</div>
      </div>
      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
        {title}
      </p>
      <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{value}</h3>
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
  const { supportLabel } = useAuth();
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tight border ${
        active
          ? "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-100 dark:border-green-500/20"
          : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700"
      }`}
    >
      {active ? `Active ${supportLabel}` : "Inactive Account"}
    </span>
  );
}

function RiskBadge({ level }) {
  const styles = {
    LOW: "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400",
    MEDIUM: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
    HIGH: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter ${styles[level] || "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"}`}
    >
      {level} RISK
    </span>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
      <div className="h-24 w-full bg-gray-200 dark:bg-gray-800 rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
        <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
        <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
        <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
      </div>
    </div>
  );
}
