"use client";

import { useState } from "react";
import { api } from "@/lib/axios";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(""); // NEW: form-level error

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

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }

    if (formError) setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setFormError("");

    if (form.password !== form.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    const payload = {
      name: form.schoolName,
      website: form.schoolWebsite,
      firstName: form.adminFirstName,
      lastName: form.adminLastName,
      contact_email: form.adminEmail,
      password: form.password,
    };

    try {
      setLoading(true);
      const res = await api.post("/auth/admin/signup", payload);

      if (res.data.previewLink) {
        console.log("Dev Email Preview:", res.data.previewLink);
      }

      // router.push("/verify-email");
    } catch (err) {
      // 🌐 Network / server unreachable
      if (err?.type === "NETWORK_ERROR") {
        setFormError(
          "Unable to connect to the server. Please try again later.",
        );
        return;
      }

      // 🧩 Zod / field-level validation errors
      if (err?.response?.data?.errors) {
        setErrors(err.response.data.errors);
        return;
      }

      // ❌ Generic backend error
      setFormError(
        err?.response?.data?.message || "Signup failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl rounded-xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-center">Register Your School</h1>
        <p className="mt-2 text-sm text-center text-gray-600">
          Create your school account to access the platform
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {formError && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 border border-red-100 text-center">
              {formError}
            </div>
          )}

          <Section title="School Information">
            <Input
              label="School Name"
              required
              value={form.schoolName}
              error={errors.name}
              onChange={(v) => update("schoolName", v)}
            />
            <Input
              label="School Website"
              placeholder="https://yourschool.edu"
              value={form.schoolWebsite}
              error={errors.website}
              onChange={(v) => update("schoolWebsite", v)}
            />
            <Input
              label="School Email"
              type="email"
              required
              value={form.adminEmail}
              error={errors.contact_email}
              onChange={(v) => update("adminEmail", v)}
            />
          </Section>

          <Section title="Administrator Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                required
                value={form.adminFirstName}
                error={errors.firstName}
                onChange={(v) => update("adminFirstName", v)}
              />
              <Input
                label="Last Name"
                required
                value={form.adminLastName}
                error={errors.lastName}
                onChange={(v) => update("adminLastName", v)}
              />
            </div>

            <Input
              label="Password"
              type="password"
              required
              value={form.password}
              error={errors.password}
              onChange={(v) => update("password", v)}
            />
            <Input
              label="Confirm Password"
              type="password"
              required
              value={form.confirmPassword}
              error={errors.confirmPassword}
              onChange={(v) => update("confirmPassword", v)}
            />
          </Section>

          <p className="text-xs text-gray-500">
            By registering, you confirm that you are authorized to act on behalf
            of your institution and agree to our Terms and Privacy Policy.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-black py-3 text-white font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
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
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
        {title}
      </h2>
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
  error,
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className={`rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black transition-all ${
          error ? "border-red-500 bg-red-50" : "border-gray-300"
        }`}
      />
      {error && (
        <span className="text-xs text-red-600 mt-1 font-medium">
          {Array.isArray(error) ? error[0] : error}
        </span>
      )}
    </label>
  );
}
