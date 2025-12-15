"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { api } from "@/lib/axios";

interface SystemSettings {
  globalAlertThreshold: number;
  criticalAlertThreshold: number;
  dataRetentionMonths: number;
  allowWearables: boolean;
  emailNotificationsEnabled: boolean;
}

export default function SuperAdminSettingsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery<SystemSettings>({
    queryKey: ["system-settings"],
    queryFn: async () => {
      const res = await api.get("/super-admin/settings");
      return res.data;
    },
  });

  const mutation = useMutation({
    mutationFn: (values: SystemSettings) =>
      api.put("/super-admin/settings", values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
      alert("Settings saved successfully");
    },
  });

  const [form, setForm] = useState<SystemSettings | null>(null);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  if (isLoading || !form) return <p>Loading settings...</p>;
  if (error) return <p>Failed to load settings.</p>;

  const updateField = <K extends keyof SystemSettings>(
    field: K,
    value: SystemSettings[K]
  ) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">System Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure global behavior across all schools
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Alert Thresholds */}
        <Section title="Alert Thresholds">
          <NumberField
            label="Global Alert Threshold"
            value={form.globalAlertThreshold}
            onChange={(v) => updateField("globalAlertThreshold", v)}
            hint="Default stress score that triggers an alert"
          />
          <NumberField
            label="Critical Alert Threshold"
            value={form.criticalAlertThreshold}
            onChange={(v) => updateField("criticalAlertThreshold", v)}
            hint="Escalation threshold for urgent intervention"
          />
        </Section>

        {/* Data Retention */}
        <Section title="Data Retention">
          <NumberField
            label="Retention Period (Months)"
            value={form.dataRetentionMonths}
            onChange={(v) => updateField("dataRetentionMonths", v)}
            hint="How long student data is stored"
          />
        </Section>

        {/* Platform Features */}
        <Section title="Platform Features">
          <Toggle
            label="Enable Wearable Integrations"
            checked={form.allowWearables}
            onChange={(v) => updateField("allowWearables", v)}
          />
          <Toggle
            label="Enable Email Notifications"
            checked={form.emailNotificationsEnabled}
            onChange={(v) =>
              updateField("emailNotificationsEnabled", v)
            }
          />
        </Section>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-md bg-black px-5 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {mutation.isPending ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
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
    <div className="rounded-xl border bg-white dark:bg-gray-900 p-5 space-y-4">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded-md border px-3 py-2"
      />
      {hint && (
        <span className="text-xs text-muted-foreground">{hint}</span>
      )}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 text-sm">
      <span className="font-medium">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4"
      />
    </label>
  );
}
