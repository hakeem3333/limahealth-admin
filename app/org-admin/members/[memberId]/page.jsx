"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
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
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  Send,
  UserPlus,
  UserCog,
  Check,
  X,
} from "lucide-react";

export default function StudentProfilePage() {
  const params = useParams();
  const memberId = params.memberId;
  const { orgType, supportLabel } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["student-profile", memberId],
    queryFn: async () => {
      const res = await api.get(`/org/members/${memberId}`);
      return res.data;
    },
  });

  if (isLoading) return <ProfileSkeleton />;
  if (error || !data) return <ErrorState />;

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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-8">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center text-gray-400 shadow-inner">
            <User className="h-10 w-10" />
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
            {orgType === "SCHOOL" && (
              <AgeBadge age={data.age} isMinor={data.isMinor} editHref={`/org-admin/members/${memberId}/edit`} />
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <ActionButton href={`/org-admin/members/${memberId}/edit`}>
            <Settings className="h-4 w-4" />
            Edit Profile
          </ActionButton>
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

        <InfoCard title={`Assigned ${supportLabel}`}>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mt-1">
            <UserCog className="h-4 w-4 opacity-50" />
            <span className="text-sm font-medium">
              {data.counselor?.name ?? "Unassigned"}
            </span>
          </div>
        </InfoCard>

        <InfoCard title="Last Device Sync">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mt-1">
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
        <div className="space-y-8">
          <CounselorRequestCard studentId={memberId} />
          {orgType === "SCHOOL" && data.isMinor !== false && <ParentConsentCard studentId={memberId} />}
          {orgType === "SCHOOL" && data.isMinor === false && (
            <Section title="Parental Consent" icon={<ShieldCheck className="h-5 w-5 text-blue-600" />}>
              <p className="text-xs text-gray-500 dark:text-gray-400 pt-2">
                {data.firstName} is {data.age}, so parental consent isn&apos;t required.
              </p>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

/* -----------------------------
   Counselor Change Requests
------------------------------ */

function CounselorRequestCard({ studentId }) {
  const { memberLabel, supportLabel } = useAuth();
  const queryClient = useQueryClient();
  const [decidingId, setDecidingId] = useState(null);
  const [newCounselorId, setNewCounselorId] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { data: requests, isLoading } = useQuery({
    queryKey: ["counselor-requests", studentId],
    queryFn: async () => {
      const res = await api.get("/counselor-requests", { params: { status: "ALL", studentId } });
      return res.data;
    },
  });

  const { data: counselors } = useQuery({
    queryKey: ["org-counselors"],
    queryFn: async () => (await api.get("/org/counselors")).data,
    enabled: decidingId !== null,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["counselor-requests", studentId] });

  const resolve = useMutation({
    mutationFn: ({ id, decision }) =>
      api.patch(`/counselor-requests/${id}/resolve`, {
        decision,
        ...(decision === "APPROVED" ? { newCounselorId } : {}),
        ...(adminNote ? { adminNote } : {}),
      }),
    onSuccess: () => {
      setDecidingId(null);
      setNewCounselorId("");
      setAdminNote("");
      setErrorMsg("");
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["student-profile", studentId] });
    },
    onError: (err) => setErrorMsg(err?.response?.data?.message || "Failed to resolve request."),
  });

  const startApprove = (id) => {
    setErrorMsg("");
    setNewCounselorId("");
    setDecidingId({ id, decision: "APPROVED" });
  };
  const startDeny = (id) => {
    setErrorMsg("");
    setAdminNote("");
    setDecidingId({ id, decision: "DENIED" });
  };

  const pending = requests?.filter((r) => r.status === "PENDING") ?? [];
  const history = requests?.filter((r) => r.status !== "PENDING").slice(0, 3) ?? [];

  return (
    <Section title={`${supportLabel} Change Requests`} icon={<UserCog className="h-5 w-5 text-blue-600" />}>
      {isLoading ? (
        <div className="h-20 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-2xl" />
      ) : (
        <div className="space-y-4 pt-2">
          {pending.length === 0 && history.length === 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400">No requests from this {memberLabel.toLowerCase()} yet.</p>
          )}

          {pending.map((req) => (
            <div key={req.id} className="rounded-2xl border border-amber-100 dark:border-amber-500/20 bg-amber-50/40 dark:bg-amber-500/10 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20">
                  <ShieldQuestion className="h-3 w-3" /> Pending
                </span>
                <span className="text-[11px] text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{req.reason}</p>

              {decidingId?.id === req.id ? (
                <div className="space-y-2">
                  {decidingId.decision === "APPROVED" ? (
                    <select
                      value={newCounselorId}
                      onChange={(e) => setNewCounselorId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">Select new {supportLabel.toLowerCase()}…</option>
                      {counselors?.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder={`Note to ${memberLabel.toLowerCase()} (optional)`}
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  )}
                  {errorMsg && <p className="text-xs text-red-600 dark:text-red-400 font-medium">{errorMsg}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDecidingId(null)}
                      className="flex-1 rounded-xl px-3 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => resolve.mutate(decidingId)}
                      disabled={resolve.isPending || (decidingId.decision === "APPROVED" && !newCounselorId)}
                      className={`flex-1 rounded-xl px-3 py-2 text-xs font-bold text-white disabled:opacity-50 ${
                        decidingId.decision === "APPROVED" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {resolve.isPending ? "Saving…" : "Confirm"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => startApprove(req.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => startDeny(req.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <X className="h-3.5 w-3.5" /> Deny
                  </button>
                </div>
              )}
            </div>
          ))}

          {history.length > 0 && (
            <div className="space-y-2 pt-1">
              {history.map((req) => (
                <div key={req.id} className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-50 dark:border-gray-800 pt-2">
                  <span className={req.status === "APPROVED" ? "text-green-600 dark:text-green-400 font-bold" : "text-gray-400 font-bold"}>
                    {req.status === "APPROVED" ? "Approved" : "Denied"}
                  </span>
                  <span>{new Date(req.resolvedAt ?? req.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Section>
  );
}

/* -----------------------------
   Parental Consent
------------------------------ */

function ParentConsentCard({ studentId }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["parent-status", studentId],
    queryFn: async () => {
      const res = await api.get(`/parent-relationships/student/${studentId}`);
      return res.data;
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["parent-status", studentId] });

  return (
    <Section title="Parental Consent" icon={<ShieldCheck className="h-5 w-5 text-blue-600" />}>
      {isLoading ? (
        <div className="h-20 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-2xl" />
      ) : data?.parent ? (
        <ConsentStatus studentId={studentId} data={data} onSent={invalidate} />
      ) : (
        <LinkParentForm studentId={studentId} onLinked={invalidate} />
      )}
    </Section>
  );
}

function ConsentStatus({ studentId, data, onSent }) {
  const { parent, consentGiven, pendingRequest } = data;
  const [sentMsg, setSentMsg] = useState("");

  const sendRequest = useMutation({
    mutationFn: () => api.post("/parent-consent/request", { studentId }),
    onSuccess: () => {
      setSentMsg(`Consent request emailed to ${parent.email}.`);
      onSent();
    },
  });

  // A live pending request takes priority over a past decision — resending
  // after a decline (or to reconfirm a grant) means a new answer is awaited.
  const badge = pendingRequest
    ? { label: "Request pending", cls: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20", Icon: ShieldQuestion }
    : consentGiven === true
    ? { label: "Consent granted", cls: "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-100 dark:border-green-500/20", Icon: ShieldCheck }
    : consentGiven === false
    ? { label: "Consent declined", cls: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20", Icon: ShieldAlert }
    : { label: "Not yet requested", cls: "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700", Icon: ShieldQuestion };

  return (
    <div className="space-y-4 pt-2">
      <div>
        <p className="text-sm font-bold text-gray-900 dark:text-white">{parent.firstName} {parent.lastName}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{parent.email}</p>
      </div>

      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.cls}`}>
        <badge.Icon className="h-3.5 w-3.5" />
        {badge.label}
      </span>

      {pendingRequest && (
        <p className="text-[11px] text-gray-400">
          Expires {new Date(pendingRequest.expiresAt).toLocaleDateString()}
        </p>
      )}

      {consentGiven !== true && (
        <button
          onClick={() => { setSentMsg(""); sendRequest.mutate(); }}
          disabled={sendRequest.isPending}
          className="w-full flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {sendRequest.isPending ? "Sending..." : pendingRequest ? "Resend request" : "Send consent request"}
        </button>
      )}

      {sentMsg && <p className="text-xs text-green-600 dark:text-green-400 font-medium">{sentMsg}</p>}
      {sendRequest.isError && (
        <p className="text-xs text-red-600 dark:text-red-400 font-medium">
          {sendRequest.error?.response?.data?.message || "Failed to send request."}
        </p>
      )}
    </div>
  );
}

function LinkParentForm({ studentId, onLinked }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });
  const [errorMsg, setErrorMsg] = useState("");

  const linkParent = useMutation({
    mutationFn: (values) => api.post("/parent-relationships/link", { studentId, ...values }),
    onSuccess: () => {
      setForm({ firstName: "", lastName: "", email: "" });
      onLinked();
    },
    onError: (err) => {
      setErrorMsg(err?.response?.data?.message || "Failed to link parent.");
    },
  });

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrorMsg("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    linkParent.mutate(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pt-2">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        No parent/guardian linked yet. Add one to request consent for viewing this student&apos;s wellness data.
      </p>

      {errorMsg && (
        <div className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-700 dark:text-red-400 px-3 py-2 text-xs font-bold">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          placeholder="First name"
          value={form.firstName}
          required
          onChange={(e) => update("firstName", e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
        />
        <input
          type="text"
          placeholder="Last name"
          value={form.lastName}
          required
          onChange={(e) => update("lastName", e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
        />
      </div>
      <input
        type="email"
        placeholder="Parent email"
        value={form.email}
        required
        onChange={(e) => update("email", e.target.value)}
        className="w-full px-3 py-2 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
      />

      <button
        type="submit"
        disabled={linkParent.isPending}
        className="w-full flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all disabled:opacity-50"
      >
        <UserPlus className="h-4 w-4" />
        {linkParent.isPending ? "Linking..." : "Link parent"}
      </button>
    </form>
  );
}

/* -----------------------------
   UI Components
------------------------------ */

function Section({ title, icon, children }) {
  return (
    <div className="rounded-3xl border border-gray-100 dark:border-gray-800 dim:border-slate-300/70 bg-white dark:bg-gray-900 dim:bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gray-50 dark:bg-gray-800 dim:bg-slate-100 rounded-xl">{icon}</div>
        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function InfoCard({ title, children }) {
  return (
    <div className="rounded-3xl border border-gray-100 dark:border-gray-800 dim:border-slate-300/70 bg-white dark:bg-gray-900 dim:bg-white p-5 shadow-sm">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
        {title}
      </p>
      {children}
    </div>
  );
}

function Metric({ label, value, icon, sub }) {
  return (
    <div className="rounded-2xl border border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/40 p-4 flex flex-col items-center text-center">
      <div className="p-2 bg-white dark:bg-gray-900 rounded-lg shadow-sm mb-3">{icon}</div>
      <p className="text-3xl font-black text-gray-900 dark:text-white">{value ?? "—"}</p>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
        {label}
      </p>
      <p className="text-[10px] text-gray-400 mt-1 italic">{sub}</p>
    </div>
  );
}

function AgeBadge({ age, isMinor, editHref }) {
  if (age === null || age === undefined) {
    return (
      <Link
        href={editHref}
        className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight border bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        Age unknown · add date of birth
      </Link>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight border ${
        isMinor
          ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20"
          : "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700"
      }`}
    >
      Age {age}
      {isMinor && " · Under 18 · consent required"}
    </span>
  );
}

function StatusBadge({ active }) {
  return (
    <span
      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight border ${
        active
          ? "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-100 dark:border-green-500/20"
          : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700"
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
        connected ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400" : "bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400"
      }`}
    >
      <Watch className="h-3 w-3" />
      {connected ? "Device Connected" : "Device Unlinked"}
    </span>
  );
}

function RiskBadge({ level }) {
  const styles = {
    LOW: "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-100 dark:border-green-500/20",
    MEDIUM: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20",
    HIGH: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20",
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
    secondary: "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800",
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

function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-16 text-center shadow-sm">
      <div className="h-12 w-12 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <p className="text-lg font-black text-gray-900 dark:text-white">Couldn&apos;t load this member</p>
      <p className="text-sm text-gray-500 max-w-xs">
        They may no longer be enrolled, or something went wrong loading their profile.
      </p>
      <Link
        href="/org-admin/members"
        className="mt-2 text-sm font-bold text-blue-600 hover:underline"
      >
        Back to Members
      </Link>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-6 w-40 bg-gray-200 dark:bg-gray-800 rounded" />
      <div className="h-24 w-full bg-gray-200 dark:bg-gray-800 rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
        ))}
      </div>
      <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
    </div>
  );
}
