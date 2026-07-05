"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import {
  KeyRound,
  ShieldCheck,
  Monitor,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  User,
} from "lucide-react";

export default function AdminProfilePage() {
  const { user } = useAuth();
  const [successMsg, setSuccessMsg] = useState("");
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
    onSuccess: () => {
      setSuccessMsg("Password updated successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setSuccessMsg(""), 5000);
    },
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
    <div className="space-y-8 max-w-2xl py-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Admin Profile
        </h1>
        <p className="text-gray-500 mt-1 text-lg">
          Manage your account settings and security preferences.
        </p>
      </div>

      {/* Account Overview */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-6 shadow-sm">
        <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
          {user?.firstName?.charAt(0) || <User />}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {user?.firstName} {user?.lastName}
          </h2>
          <p className="text-gray-500 font-medium">{user?.email}</p>
          <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100 uppercase">
            {user?.role?.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Change Password */}
      <Section
        title="Change Password"
        icon={<KeyRound className="w-5 h-5 text-blue-600" />}
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {successMsg && (
            <div className="flex items-center gap-2 bg-green-50 text-green-700 p-4 rounded-xl border border-green-100 text-sm font-medium animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" /> {successMsg}
            </div>
          )}
          {mutation.isError && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 text-sm font-medium">
              <AlertTriangle className="w-4 h-4" />{" "}
              {mutation.error?.response?.data?.message ||
                "Error updating password"}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Current Password"
              type="password"
              placeholder="••••••••"
              value={passwordForm.currentPassword}
              onChange={(v) => handleChange("currentPassword", v)}
            />
            <div className="hidden md:block" /> {/* Spacer */}
            <InputField
              label="New Password"
              type="password"
              placeholder="Min. 8 characters"
              value={passwordForm.newPassword}
              onChange={(v) => handleChange("newPassword", v)}
            />
            <InputField
              label="Confirm New Password"
              type="password"
              placeholder="Repeat new password"
              value={passwordForm.confirmPassword}
              onChange={(v) => handleChange("confirmPassword", v)}
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
          >
            {mutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Update Password"
            )}
          </button>
        </form>
      </Section>

      {/* Security Settings */}
      <Section
        title="Security Settings"
        icon={<ShieldCheck className="w-5 h-5 text-blue-600" />}
      >
        <div className="space-y-4 pt-2">
          <CheckboxField
            label="Enable Two-Factor Authentication (2FA)"
            description="Adds an extra layer of security to your account."
            checked={true}
            onChange={() => {}}
          />
          <CheckboxField
            label="Security Notifications"
            description="Receive email alerts for new logins or password changes."
            checked={true}
            onChange={() => {}}
          />
        </div>
      </Section>

      {/* Session Management */}
      <Section
        title="Active Sessions"
        icon={<Monitor className="w-5 h-5 text-blue-600" />}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
          <div>
            <p className="text-sm font-medium text-gray-900">
              Current Device: Chrome on MacOS
            </p>
            <p className="text-xs text-gray-500">
              Last active: Just now • Lagos, Nigeria
            </p>
          </div>
          <button className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
            Logout Other Sessions
          </button>
        </div>
      </Section>
    </div>
  );
}

/* -----------------------------
   UI Components
----------------------------- */

function Section({ title, icon, children }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
        {icon}
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function InputField({ label, value, onChange, type = "text", placeholder }) {
  return (
    <label className="flex flex-col text-sm gap-2">
      <span className="font-semibold text-gray-700 ml-1">{label}</span>
      <input
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
      />
    </label>
  );
}

function CheckboxField({ label, description, checked, onChange }) {
  return (
    <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
      <div className="relative flex items-center mt-1">
        <input
          type="checkbox"
          checked={checked ?? false}
          onChange={(e) => onChange(e.target.checked)}
          className="h-5 w-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
        />
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
          {label}
        </span>
        {description && (
          <span className="text-xs text-gray-500">{description}</span>
        )}
      </div>
    </label>
  );
}
