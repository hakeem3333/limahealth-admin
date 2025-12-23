"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";

/**
 * School Admin – Profile Page
 */
export default function AdminProfilePage() {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const mutation = useMutation({
    mutationFn: async (values) => {
      const res = await api.put("/admin/change-password", values);
      return res.data;
    },
    onSuccess: () => alert("Password updated successfully!"),
  });

  const handleChange = (field, value) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    mutation.mutate(passwordForm);
  };

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold">Admin Profile</h1>

      {/* Change Password */}
      <Section title="Change Password">
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Current Password"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(v) => handleChange("currentPassword", v)}
          />
          <InputField
            label="New Password"
            type="password"
            value={passwordForm.newPassword}
            onChange={(v) => handleChange("newPassword", v)}
          />
          <InputField
            label="Confirm Password"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(v) => handleChange("confirmPassword", v)}
          />
          <button
            type="submit"
            className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
          >
            Update Password
          </button>
        </form>
      </Section>

      {/* Security Settings */}
      <Section title="Security Settings">
        <CheckboxField label="Enable 2FA" checked={false} onChange={() => {}} />
        <CheckboxField
          label="Email Notifications for Login"
          checked={true}
          onChange={() => {}}
        />
      </Section>

      {/* Session Management */}
      <Section title="Active Sessions">
        <p className="text-sm text-muted-foreground">
          You are currently logged in on 1 device.
        </p>
        <button className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
          Logout Other Sessions
        </button>
      </Section>
    </div>
  );
}

/* -----------------------------
   UI Components
----------------------------- */

function Section({ title, children }) {
  return (
    <div className="rounded-xl border bg-white dark:bg-gray-900 p-4 space-y-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function InputField({ label, value, onChange, type = "text" }) {
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

function CheckboxField({ label, checked, onChange }) {
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
