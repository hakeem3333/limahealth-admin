"use client";

import { useState } from "react";
import { api } from "@/lib/axios";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    schoolName: "",
    schoolWebsite: "",
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    password: "",
    confirmPassword: "",
  });

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/school-signup", form);
      router.push("/signup/verify-email");
    } catch (err) {
      alert(err?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-xl rounded-xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-center">Register Your School</h1>
        <p className="mt-2 text-sm text-center text-gray-600">
          Create your school account to access the platform
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* School Info */}
          <Section title="School Information">
            <Input
              label="School Name"
              required
              value={form.schoolName}
              onChange={(v) => update("schoolName", v)}
            />

            <Input
              label="School Website"
              placeholder="https://yourschool.edu"
              value={form.schoolWebsite}
              onChange={(v) => update("schoolWebsite", v)}
            />

            <Input
              label="School Email"
              type="email"
              required
              value={form.adminEmail}
              onChange={(v) => update("adminEmail", v)}
            />
          </Section>

          {/* Admin Info */}
          <Section title="Administrator Details">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                required
                value={form.adminFirstName}
                onChange={(v) => update("adminFirstName", v)}
              />
              <Input
                label="Last Name"
                required
                value={form.adminLastName}
                onChange={(v) => update("adminLastName", v)}
              />
            </div>

            <Input
              label="Password"
              type="password"
              required
              value={form.password}
              onChange={(v) => update("password", v)}
            />

            <Input
              label="Confirm Password"
              type="password"
              required
              value={form.confirmPassword}
              onChange={(v) => update("confirmPassword", v)}
            />
          </Section>

          {/* Legal */}
          <p className="text-xs text-gray-500">
            By registering, you confirm that you are authorized to act on behalf
            of your institution and agree to our Terms and Privacy Policy.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-black py-3 text-white font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create School Account"}
          </button>
        </form>
      </div>
    </main>
  );
}

/* -----------------------------
   UI Components
------------------------------ */

function Section({ title, children }) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
      {children}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
      />
    </label>
  );
}
