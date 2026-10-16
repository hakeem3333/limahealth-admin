"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { api } from "@/lib/axios";
import Button from "@/components/super-admin/ui/Button";
import { Card } from "@/components/super-admin/ui/Card";
import ThemeToggle from "@/components/ThemeToggle";

export default function SuperAdminSettingsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["platform-settings"],
    queryFn: async () => (await api.get("/super-admin/settings")).data,
  });

  const mutation = useMutation({
    mutationFn: (values) => api.put("/super-admin/settings", values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-settings"] });
      setSuccessMsg("Platform settings updated successfully!");
      setErrorMsg("");
    },
    onError: () => {
      setErrorMsg("Failed to save settings. Please try again.");
      setSuccessMsg("");
    },
  });

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  if (isLoading || !form) {
    return <div className="h-96 max-w-3xl bg-gray-200 rounded-2xl animate-pulse" />;
  }
  if (error)
    return (
      <div className="rounded-2xl bg-white shadow-card p-12 text-center max-w-3xl">
        <p className="text-red-500 font-semibold">Failed to load settings.</p>
      </div>
    );

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div className="max-w-3xl space-y-8">
      <header>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-lh-teal dark:text-lh-teal-light mb-2">
          Core Infrastructure
        </p>
        <h1 className="font-display text-3xl font-bold text-lh-navy dark:text-white">
          Platform Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Global configuration for LimaHealth
        </p>
      </header>

      {successMsg && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium">
          <CheckCircle2 className="h-4 w-4" />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
          <AlertTriangle className="h-4 w-4" />
          {errorMsg}
        </div>
      )}

      {/* Appearance — a per-browser display preference, not a platform-wide
          policy, so it's kept out of the form below and saved straight to
          this device rather than sent to /super-admin/settings. */}
      <Card className="space-y-4">
        <h2 className="font-display font-bold text-lh-navy dark:text-white">Appearance</h2>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Interface theme</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Applies to this browser only — every Super Admin picks their own.
            </p>
          </div>
          <ThemeToggle accentColor="#1F6F6B" />
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Section title="Platform Governance">
          <Toggle
            label="Allow New School Signup"
            checked={form.allowSchoolSignup}
            onChange={(v) => update("allowSchoolSignup", v)}
          />
          <Toggle
            label="Require Email Verification"
            checked={form.requireEmailVerification}
            onChange={(v) => update("requireEmailVerification", v)}
          />
          <Select
            label="Default School Status"
            value={form.defaultSchoolStatus}
            onChange={(v) => update("defaultSchoolStatus", v)}
            options={["PENDING_EMAIL_VERIFICATION", "PENDING_ACTIVATION", "ACTIVE"]}
          />
        </Section>

        <Section title="Security & Compliance">
          <NumberField
            label="Admin OTP Expiry (minutes)"
            value={form.adminOtpExpiryMinutes}
            min={5}
            max={60}
            onChange={(v) => update("adminOtpExpiryMinutes", v)}
          />
          <Toggle
            label="Enforce Audit Logging"
            checked={form.enforceAuditLogging}
            onChange={(v) => update("enforceAuditLogging", v)}
          />
        </Section>

        <Section title="Platform Features">
          <Toggle
            label="Enable Wearable Integrations"
            checked={form.enableWearables}
            onChange={(v) => update("enableWearables", v)}
          />
          <Toggle
            label="Enable Alerts System"
            checked={form.enableAlerts}
            onChange={(v) => update("enableAlerts", v)}
          />
        </Section>

        <Section title="Data & Privacy">
          <NumberField
            label="Data Retention (months)"
            value={form.dataRetentionMonths}
            min={1}
            max={120}
            onChange={(v) => update("dataRetentionMonths", v)}
          />
          <Toggle
            label="Enforce Data Anonymization"
            checked={form.enforceAnonymization}
            onChange={(v) => update("enforceAnonymization", v)}
          />
        </Section>

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving…" : "Save Settings"}
        </Button>
      </form>
    </div>
  );
}

/* ---------------- UI Primitives ---------------- */

function Section({ title, children }) {
  return (
    <Card className="space-y-4 p-6">
      <h2 className="font-display font-bold text-lh-navy dark:text-white">{title}</h2>
      {children}
    </Card>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex justify-between items-center text-sm">
      <span className="text-gray-700 dark:text-gray-300">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-lh-teal h-4 w-4"
      />
    </label>
  );
}

function NumberField({ label, value, onChange, min, max }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-gray-700 dark:text-gray-300">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl px-3 py-2 focus:ring-2 focus:ring-lh-teal outline-none"
      />
    </label>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-gray-700 dark:text-gray-300">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl px-3 py-2 focus:ring-2 focus:ring-lh-teal outline-none"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt.replaceAll("_", " ")}
          </option>
        ))}
      </select>
    </label>
  );
}
