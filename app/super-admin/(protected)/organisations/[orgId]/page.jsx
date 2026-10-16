"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  BadgeCheck,
  Mail,
  Lock,
  Copy,
  Check,
  Users,
  UserCog,
  CalendarClock,
  Building2,
  MailCheck,
  ShieldAlert,
  CreditCard,
  Ban,
  Clock,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/axios";
import Badge from "@/components/super-admin/ui/Badge";
import Button from "@/components/super-admin/ui/Button";
import { Card } from "@/components/super-admin/ui/Card";

const STATUS_META = {
  PENDING_EMAIL_VERIFICATION: {
    label: "Awaiting Email Verification",
    icon: MailCheck,
    tone: "amber",
    desc: "The organisation admin hasn't confirmed their email yet.",
  },
  PENDING_ACTIVATION: {
    label: "Awaiting SuperAdmin Approval",
    icon: ShieldAlert,
    tone: "amber",
    desc: "Email verified — needs your review to go live.",
  },
  ACTIVE: {
    label: "Active (Paid)",
    icon: BadgeCheck,
    tone: "emerald",
    desc: "Subscription is live. Normally set automatically on successful payment — only set this manually to override billing.",
  },
  PAYMENT_REQUIRED: {
    label: "Approved — Payment Required",
    icon: CreditCard,
    tone: "purple",
    desc: "Approves the org and lets the admin log in, but they're routed to billing and can't use the platform until they subscribe.",
  },
  SUSPENDED: {
    label: "Suspended",
    icon: Ban,
    tone: "red",
    desc: "Login access is blocked platform-wide.",
  },
  EXPIRED: {
    label: "Expired",
    icon: Clock,
    tone: "orange",
    desc: "Subscription window has lapsed.",
  },
};

const TONES = {
  amber: {
    border: "border-lh-accent",
    bg: "bg-lh-accent-light/60 dark:bg-lh-accent/10",
    text: "text-[#8a5525] dark:text-lh-accent",
    iconBg: "bg-lh-accent/15",
    iconText: "text-lh-accent",
  },
  emerald: {
    border: "border-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400",
    iconBg: "bg-emerald-500/15",
    iconText: "text-emerald-600",
  },
  purple: {
    border: "border-purple-500",
    bg: "bg-purple-50 dark:bg-purple-500/10",
    text: "text-purple-700 dark:text-purple-300",
    iconBg: "bg-purple-500/15",
    iconText: "text-purple-600",
  },
  red: {
    border: "border-red-500",
    bg: "bg-red-50 dark:bg-red-500/10",
    text: "text-red-700 dark:text-red-400",
    iconBg: "bg-red-500/15",
    iconText: "text-red-600",
  },
  orange: {
    border: "border-orange-500",
    bg: "bg-orange-50 dark:bg-orange-500/10",
    text: "text-orange-700 dark:text-orange-400",
    iconBg: "bg-orange-500/15",
    iconText: "text-orange-600",
  },
};

function getInitials(name) {
  if (!name) return "OR";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function OrganisationDetailPage() {
  const { orgId } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", email: "", status: "ACTIVE" });
  const [copied, setCopied] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["organisation", orgId],
    queryFn: async () => {
      const res = await api.get(`/super-admin/organisations/${orgId}`);
      return res.data;
    },
  });

  useEffect(() => {
    if (data) {
      setForm({
        name: data.name || "",
        email: data.email || "",
        status: data.status || "PENDING_EMAIL_VERIFICATION",
      });
    }
  }, [data]);

  const updateOrganisation = useMutation({
    mutationFn: (values) => api.put(`/super-admin/organisations/${orgId}`, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organisation", orgId] });
      toast.success("Organisation status updated successfully!");
    },
    onError: (err) => {
      console.error("Update failed:", err);
      toast.error(err.response?.data?.message || "Failed to update organisation.");
    },
  });

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(String(orgId));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — silently ignore */
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl space-y-6">
        <div className="h-44 bg-gray-200 dark:bg-gray-800 rounded-3xl animate-pulse" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
          <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error)
    return (
      <div className="rounded-2xl bg-white dark:bg-gray-900 dim:bg-white shadow-card p-12 text-center max-w-2xl">
        <p className="text-red-500 dark:text-red-400 font-semibold">Failed to load organisation data.</p>
      </div>
    );

  const handleSubmit = (e) => {
    e.preventDefault();
    updateOrganisation.mutate(form);
  };

  const hasPendingChange = form.status !== data?.status;

  return (
    <div className="max-w-5xl space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-lh-teal transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Registry
      </button>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-lh-navy text-white shadow-2xl shadow-lh-navy/20">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 12% 15%, rgba(217, 140, 74, 0.25), transparent 40%), radial-gradient(circle at 88% 85%, rgba(31, 111, 107, 0.35), transparent 45%)",
          }}
        />
        <div className="relative z-10 p-7 sm:p-9">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <div className="h-16 w-16 shrink-0 rounded-2xl bg-gradient-to-br from-lh-accent to-lh-teal flex items-center justify-center font-display text-2xl font-bold shadow-lg ring-4 ring-white/10">
                {getInitials(data?.name)}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 flex items-center gap-1.5">
                  <Building2 className="h-3 w-3" />
                  {data?.orgType || "Organisation"}
                </p>
                <h1 className="font-display text-2xl sm:text-3xl font-bold truncate mt-0.5">
                  {data?.name || "Unnamed Organisation"}
                </h1>
                <p className="text-white/60 text-sm mt-1 flex items-center gap-1.5 truncate">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  {data?.email || "No contact email"}
                </p>
              </div>
            </div>
            <div className="shrink-0">
              <Badge status={data?.status} />
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-2.5">
            <button
              onClick={handleCopyId}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-3.5 py-2 text-xs font-semibold text-white/80 transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
              ID: {String(orgId).slice(0, 8)}…
            </button>
            <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/10 px-3.5 py-2 text-xs font-semibold text-white/80">
              <CalendarClock className="h-3.5 w-3.5" />
              Registered {data?.createdAt ? new Date(data.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—"}
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/10 px-3.5 py-2 text-xs font-semibold text-white/80">
              <Users className="h-3.5 w-3.5" />
              {data?.membersCount ?? 0} Members
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/10 px-3.5 py-2 text-xs font-semibold text-white/80">
              <UserCog className="h-3.5 w-3.5" />
              {data?.adminsCount ?? 0} Admins
            </span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Form */}
        <Card className="lg:col-span-2 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Field
              label="Organisation Name"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              icon={Building2}
            />
            <Field label="Contact Email" value={form.email} disabled icon={Mail} hint="Verified on sign-up — cannot be edited here." />

            <div className="space-y-3">
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                Administrative Status
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(STATUS_META).map(([value, meta]) => (
                  <StatusOption
                    key={value}
                    selected={form.status === value}
                    isCurrent={data?.status === value}
                    value={value}
                    meta={meta}
                    onClick={(v) => setForm({ ...form, status: v })}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                To approve a pending org, set it to &quot;Approved — Payment Required&quot; — the admin can then log in and subscribe. &quot;Active&quot; is normally set automatically once payment succeeds.
              </p>
            </div>

            {hasPendingChange && (
              <div className="flex items-center gap-2.5 rounded-xl border border-dashed border-lh-teal/40 bg-lh-teal-light/40 dark:bg-lh-teal/10 px-4 py-3 text-xs font-semibold text-lh-teal dark:text-lh-teal-light">
                <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                <span>
                  Changing from{" "}
                  <span className="font-bold">
                    {STATUS_META[data?.status]?.label ?? data?.status ?? "Unknown"}
                  </span>{" "}
                  to <span className="font-bold">{STATUS_META[form.status]?.label ?? form.status}</span>
                </span>
              </div>
            )}

            <Button
              type="submit"
              disabled={updateOrganisation.isPending || !hasPendingChange}
              className="w-full"
            >
              {updateOrganisation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              {updateOrganisation.isPending
                ? "Updating..."
                : hasPendingChange
                ? "Update Organisation Status"
                : "No Changes to Save"}
            </Button>
          </form>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
              Registry Details
            </p>
            <DetailRow icon={Building2} label="Type" value={data?.orgType || "—"} />
            <DetailRow
              icon={CalendarClock}
              label="Registered"
              value={data?.createdAt ? new Date(data.createdAt).toLocaleDateString() : "—"}
            />
            <DetailRow icon={Users} label="Members" value={data?.membersCount ?? 0} />
            <DetailRow icon={UserCog} label="Admins" value={data?.adminsCount ?? 0} />
          </Card>

          <Card className="space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
              Quick Actions
            </p>
            <Link href={`/super-admin/organisations/${orgId}/admins`}>
              <Button variant="outline" className="w-full">
                <UserCog className="h-4 w-4" />
                Manage Admins
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 rounded-xl bg-lh-teal-light/60 dark:bg-lh-teal/20 text-lh-teal dark:text-lh-teal-light flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{value}</p>
      </div>
    </div>
  );
}

function StatusOption({ selected, isCurrent, value, meta, onClick }) {
  const tone = TONES[meta.tone];
  const Icon = meta.icon;
  const pending = selected && !isCurrent;
  const highlighted = selected || isCurrent;

  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`text-left p-3.5 rounded-2xl border-2 transition-all ${
        selected
          ? `${tone.border} ${tone.bg} shadow-sm ${pending ? "border-dashed" : ""}`
          : isCurrent
          ? `${tone.border} bg-white dark:bg-gray-900 dim:bg-white`
          : "border-gray-100 dark:border-gray-800 dim:border-slate-200 bg-white dark:bg-gray-900 dim:bg-white hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50/60 dark:hover:bg-gray-800/60"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
            highlighted ? `${tone.iconBg} ${tone.iconText}` : "bg-gray-100 dark:bg-gray-800 text-gray-400"
          }`}
        >
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-xs font-bold ${highlighted ? tone.text : "text-gray-700 dark:text-gray-200"}`}>
                {meta.label}
              </span>
              {isCurrent && (
                <span
                  className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full ${tone.iconBg} ${tone.iconText}`}
                >
                  Current
                </span>
              )}
            </div>
            {pending && <ArrowRight className={`h-4 w-4 shrink-0 ${tone.iconText}`} />}
            {selected && isCurrent && <CheckCircle2 className={`h-4 w-4 shrink-0 ${tone.iconText}`} />}
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{meta.desc}</p>
        </div>
      </div>
    </button>
  );
}

function Field({ label, value, onChange, disabled = false, icon: Icon, hint }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">{label}</span>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        )}
        <input
          value={value}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dim:bg-white dark:text-white rounded-xl py-2.5 focus:ring-2 focus:ring-lh-teal focus:border-lh-teal outline-none disabled:bg-gray-50 dark:disabled:bg-gray-800/50 disabled:text-gray-500 text-sm transition-all ${
            Icon ? "pl-10" : "pl-4"
          } ${disabled ? "pr-10" : "pr-4"}`}
        />
        {disabled && (
          <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300 pointer-events-none" />
        )}
      </div>
      {hint && <span className="text-[11px] text-gray-400">{hint}</span>}
    </label>
  );
}
