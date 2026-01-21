"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { api } from "@/lib/axios";

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

  if (isLoading || !form)
    return (
      <p className="p-8 text-center text-muted-foreground">Loading settings…</p>
    );
  if (error)
    return (
      <p className="p-8 text-center text-red-500">Failed to load settings.</p>
    );

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div className="max-w-3xl space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Platform Settings</h1>
        <p className="text-sm text-muted-foreground">
          Global configuration for LimaHealth
        </p>
      </header>

      {successMsg && <p className="text-green-600 font-medium">{successMsg}</p>}
      {errorMsg && <p className="text-red-600 font-medium">{errorMsg}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Governance */}
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
            options={[
              "PENDING_EMAIL_VERIFICATION",
              "PENDING_ACTIVATION",
              "ACTIVE",
            ]}
          />
        </Section>

        {/* Security */}
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

        {/* Features */}
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

        {/* Data */}
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

        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-md bg-black px-6 py-2 text-white disabled:opacity-50"
        >
          {mutation.isPending ? "Saving…" : "Save Settings"}
        </button>
      </form>
    </div>
  );
}

/* ---------------- UI Primitives ---------------- */

function Section({ title, children }) {
  return (
    <div className="rounded-xl border p-5 space-y-4 bg-white dark:bg-gray-900">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex justify-between items-center text-sm">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

function NumberField({ label, value, onChange, min, max }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span>{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="border rounded-md px-3 py-2"
      />
    </label>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded-md px-3 py-2"
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
