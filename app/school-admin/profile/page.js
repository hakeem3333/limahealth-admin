"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";

/* -----------------------------
   Page
------------------------------ */

export default function AdminProfilePage() {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordError, setPasswordError] = useState(null);

  const mutation = useMutation({
    mutationFn: async (values) => {
      const res = await api.put("/admin/change-password", values);
      return res.data;
    },
    onSuccess: () => {
      alert("Password updated successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordError(null);
    },
    onError: () => {
      setPasswordError("Failed to update password. Please try again.");
    },
  });

  const handleChange = (field, value) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (!passwordForm.newPassword || !passwordForm.currentPassword) {
      setPasswordError("Please fill out all password fields");
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

          {passwordError && (
            <p className="text-red-600 text-sm">{passwordError}</p>
          )}

          <button
            type="submit"
            disabled={mutation.isLoading}
            className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {mutation.isLoading ? "Updating..." : "Update Password"}
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
        <button className="rounded-md border px-4 py-2 text-sm transition hover:bg-gray-50 dark:hover:bg-gray-700">
          Logout Other Sessions
        </button>
      </Section>
    </div>
  );
}

/* -----------------------------
   UI Components
------------------------------ */

function Section({ title, children }) {
  return (
    <div className="space-y-4 rounded-xl border bg-white p-4 dark:bg-gray-900">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function InputField({ label, value, onChange, type = "text" }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value || ""}
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
        checked={checked || false}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-gray-300"
      />
      {label}
    </label>
  );
}
