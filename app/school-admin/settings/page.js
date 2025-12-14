"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";

/**
 * School Admin – Settings Page
 */
export default function SchoolSettingsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["school-settings"],
    queryFn: async () => {
      const res = await api.get("/school/settings");
      return res.data;
    },
  });

  const [form, setForm] = useState<any>(data ?? {});

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      const res = await api.put("/school/settings", values);
      return res.data;
    },
    onSuccess: () => {
      alert("Settings updated successfully!");
    },
  });

  if (isLoading) return <p>Loading settings...</p>;

  const handleChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">School Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {/* School Profile */}
        <Section title="School Profile Info">
          <InputField
            label="School Name"
            value={form.name}
            onChange={(v) => handleChange("name", v)}
          />
          <InputField
            label="Address"
            value={form.address}
            onChange={(v) => handleChange("address", v)}
          />
          <InputField
            label="Contact Email"
            value={form.contactEmail}
            onChange={(v) => handleChange("contactEmail", v)}
          />
        </Section>

        {/* Alert Thresholds */}
        <Section title="Alert Thresholds">
          <InputField
            label="Heart Rate Threshold"
            type="number"
            value={form.heartRateThreshold}
            onChange={(v) => handleChange("heartRateThreshold", v)}
          />
          <InputField
            label="Sleep Hours Threshold"
            type="number"
            value={form.sleepHoursThreshold}
            onChange={(v) => handleChange("sleepHoursThreshold", v)}
          />
        </Section>

        {/* Notification Preferences */}
        <Section title="Notification Preferences">
          <CheckboxField
            label="Email Alerts"
            checked={form.emailAlerts}
            onChange={(v) => handleChange("emailAlerts", v)}
          />
          <CheckboxField
            label="Push Notifications"
            checked={form.pushAlerts}
            onChange={(v) => handleChange("pushAlerts", v)}
          />
        </Section>

        {/* Data Retention */}
        <Section title="Data Retention Settings">
          <InputField
            label="Retain student data (months)"
            type="number"
            value={form.dataRetentionMonths}
            onChange={(v) => handleChange("dataRetentionMonths", v)}
          />
        </Section>

        <button
          type="submit"
          className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
        >
          Save Settings
        </button>
      </form>
    </div>
  );
}

/* -----------------------------
   UI Components
------------------------------ */

function Section({ title, children }: any) {
  return (
    <div className="rounded-xl border bg-white dark:bg-gray-900 p-4 space-y-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function InputField({ label, value, onChange, type = "text" }: any) {
  return (
    <label className="flex flex-col text-sm gap-1">
      <span className="text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border px-3 py-2"
      />
    </label>
  );
}

function CheckboxField({ label, checked, onChange }: any) {
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked ?? false}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-gray-300"
      />
      {label}
    </label>
  );
}
