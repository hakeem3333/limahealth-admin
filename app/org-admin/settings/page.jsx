"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import {
  Settings, Building2, Activity, Bell, Database, Save, Loader2, CheckCircle2, Palette,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";

// Must stay in sync with the backend's orgSettings schema.
const NUMERIC_FIELDS = ["heartRateThreshold", "sleepHoursThreshold", "dataRetentionMonths"];

// Inputs yield strings; the API expects numbers and rejects empty values.
function toPayload(form) {
  const payload = {};
  for (const [key, value] of Object.entries(form)) {
    if (value === "" || value === null || value === undefined) continue;
    payload[key] = NUMERIC_FIELDS.includes(key) ? Number(value) : value;
  }
  return payload;
}

function errorMessage(error) {
  const data = error?.response?.data;
  const fields = data?.errors?.fieldErrors;
  if (fields && Object.keys(fields).length) {
    return Object.entries(fields).map(([k, v]) => `${k}: ${v.join(", ")}`).join(" · ");
  }
  return data?.message || "Couldn't save settings. Please try again.";
}

const colorMap = {
  SCHOOL:   { icon: "text-blue-600",   btn: "bg-blue-600 hover:bg-blue-700 shadow-blue-100",   ring: "focus:ring-blue-500/10 focus:border-blue-500",   toggle: "bg-blue-600"   },
  COMPANY:  { icon: "text-violet-600", btn: "bg-violet-600 hover:bg-violet-700 shadow-violet-100", ring: "focus:ring-violet-500/10 focus:border-violet-500", toggle: "bg-violet-600" },
  HOSPITAL: { icon: "text-teal-600",   btn: "bg-teal-600 hover:bg-teal-700 shadow-teal-100",   ring: "focus:ring-teal-500/10 focus:border-teal-500",   toggle: "bg-teal-600"   },
  NGO:      { icon: "text-green-600",  btn: "bg-green-600 hover:bg-green-700 shadow-green-100",  ring: "focus:ring-green-500/10 focus:border-green-500",  toggle: "bg-green-600"  },
};

export default function OrgSettingsPage() {
  const { orgType, theme, orgName } = useAuth();
  const c = colorMap[orgType] ?? colorMap.SCHOOL;
  const [form, setForm] = useState({});
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["org-settings"],
    queryFn: async () => {
      const res = await api.get("/org/settings");
      return res.data;
    },
  });

  useEffect(() => {
    // API shape: { name, settings: { ...fields } }
    if (data) setForm({ name: data.name, ...data.settings });
  }, [data]);

  const mutation = useMutation({
    mutationFn: async (values) => {
      const res = await api.put("/org/settings", toPayload(values));
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-settings"] });
      setIsSuccessVisible(true);
      setTimeout(() => setIsSuccessVisible(false), 3000);
    },
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  if (isLoading) return <SettingsSkeleton />;

  return (
    <div className="space-y-8 py-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span className="text-3xl">{theme?.icon}</span>
            {theme?.orgLabel} Settings
          </h1>
          <p className="text-gray-500 mt-1 font-medium">
            Configure {orgName || "your organisation"}'s profile, AI alert triggers, and data policies.
          </p>
        </div>
      </div>

      {/* Appearance — a per-browser display preference, not an org-wide policy,
          so it's kept out of the form below and saved straight to this device. */}
      <Section title="Appearance" icon={<Palette className={`h-5 w-5 ${c.icon}`} />}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Interface theme</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Applies to this browser only — everyone else on your team picks their own.
            </p>
          </div>
          <ThemeToggle accentColor={theme?.primary} />
        </div>
      </Section>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* School Profile */}
        <Section
          title={`${theme?.orgLabel || "Organisation"} Identity`}
          icon={<Building2 className={`h-5 w-5 ${c.icon}`} />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label={`${theme?.orgLabel || "Organisation"} Name`}
              ringClass={c.ring}
              value={form.name}
              onChange={(v) => handleChange("name", v)}
              placeholder="e.g. St. Andrews Academy"
            />
            <InputField
              label="Contact Email"
              type="email"
              value={form.contactEmail}
              onChange={(v) => handleChange("contactEmail", v)}
              placeholder="admin@school.edu"
            />
            <div className="md:col-span-2">
              <InputField
                label="Physical Address"
                value={form.address}
                onChange={(v) => handleChange("address", v)}
                placeholder="123 Education Way, City, State"
              />
            </div>
          </div>
        </Section>

        {/* Alert Thresholds */}
        <Section
          title="AI Wellness Thresholds"
          icon={<Activity className="h-5 w-5 text-orange-500" />}
        >
          <div className="bg-orange-50/50 p-4 rounded-2xl mb-4 text-xs text-orange-700 font-medium leading-relaxed">
            Note: A heart rate at or above the BPM trigger raises a "High" alert to your support staff; 20 BPM above it raises a "Critical" alert. The sleep target feeds each member's AI wellness score.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="BPM Stress Trigger (Heart Rate)"
              type="number"
              value={form.heartRateThreshold}
              onChange={(v) => handleChange("heartRateThreshold", v)}
              suffix="BPM"
              min={60}
              max={200}
              step={1}
            />
            <InputField
              label="Minimum Sleep Target"
              type="number"
              value={form.sleepHoursThreshold}
              onChange={(v) => handleChange("sleepHoursThreshold", v)}
              suffix="Hours"
              min={4}
              max={12}
              step={0.5}
            />
          </div>
        </Section>

        {/* Notifications & Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Section
            title="Communication"
            icon={<Bell className="h-5 w-5 text-purple-600" />}
          >
            <div className="space-y-4">
              <ToggleField
                label="Emergency Email Alerts"
                description="Send emails for critical severity alerts"
                checked={form.emailAlerts}
                onChange={(v) => handleChange("emailAlerts", v)}
                toggleClass={c.toggle}
              />
              <ToggleField
                label="Browser Notifications"
                description="Real-time push alerts in dashboard"
                checked={form.pushAlerts}
                onChange={(v) => handleChange("pushAlerts", v)}
                toggleClass={c.toggle}
              />
            </div>
          </Section>

          <Section
            title="Privacy & Data"
            icon={<Database className="h-5 w-5 text-gray-600" />}
          >
            <InputField
              label="Data Retention Period"
              type="number"
              value={form.dataRetentionMonths}
              onChange={(v) => handleChange("dataRetentionMonths", v)}
              suffix="Months"
              min={1}
              step={1}
            />
            <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest leading-tight">
              After this period, biometric logs are automatically anonymized.
            </p>
          </Section>
        </div>

        {/* Fixed Save Bar */}
        <div className="flex items-center gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
          <button
            type="submit"
            disabled={mutation.isPending}
            className={`flex items-center justify-center gap-2 rounded-xl px-8 py-3 text-white font-bold transition-all shadow-lg disabled:opacity-50 ${c.btn}`}
          >
            {mutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            Save Configuration
          </button>

          {mutation.isError && (
            <p className="text-sm font-bold text-red-600">{errorMessage(mutation.error)}</p>
          )}

          {isSuccessVisible && (
            <div className="flex items-center gap-2 text-green-600 font-bold animate-in fade-in slide-in-from-left-4">
              <CheckCircle2 className="h-5 w-5" />
              <span>Settings Synchronized</span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

/* -----------------------------
   UI Components
----------------------------- */

function Section({ title, icon, children }) {
  return (
    <div className="rounded-3xl border border-gray-100 dark:border-gray-800 dim:border-slate-300/70 bg-white dark:bg-gray-900 dim:bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gray-50 dark:bg-gray-800 dim:bg-slate-100 rounded-xl">{icon}</div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function InputField({ label, value, onChange, type = "text", placeholder, suffix, min, max, step, ringClass = "focus:ring-blue-500/10 focus:border-blue-500" }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className={`w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-100 focus:ring-2 outline-none transition-all ${ringClass}`}
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300">{suffix}</span>
        )}
      </div>
    </div>
  );
}

function ToggleField({ label, description, checked, onChange, toggleClass = "bg-blue-600" }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer" onClick={() => onChange(!checked)}>
      <div className="space-y-0.5">
        <p className="text-sm font-bold text-gray-900 dark:text-white">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <div className={`w-12 h-6 rounded-full p-1 transition-colors ${checked ? toggleClass : "bg-gray-200 dark:bg-gray-700"}`}>
        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transition-transform ${checked ? "translate-x-6" : "translate-x-0"}`} />
      </div>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-10 w-48 bg-gray-200 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 bg-gray-200 rounded-3xl col-span-2" />
        <div className="h-64 bg-gray-200 rounded-3xl" />
        <div className="h-64 bg-gray-200 rounded-3xl" />
      </div>
    </div>
  );
}
