"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { ChevronLeft, UserPlus, CheckCircle2 } from "lucide-react";

const colorMap = {
  SCHOOL:   { btn: "bg-blue-600 hover:bg-blue-700 shadow-blue-100",     ring: "focus:ring-blue-500/20 focus:border-blue-500" },
  COMPANY:  { btn: "bg-violet-600 hover:bg-violet-700 shadow-violet-100", ring: "focus:ring-violet-500/20 focus:border-violet-500" },
  HOSPITAL: { btn: "bg-teal-600 hover:bg-teal-700 shadow-teal-100",     ring: "focus:ring-teal-500/20 focus:border-teal-500" },
  NGO:      { btn: "bg-green-600 hover:bg-green-700 shadow-green-100",  ring: "focus:ring-green-500/20 focus:border-green-500" },
};

export default function NewMemberPage() {
  const queryClient = useQueryClient();
  const { orgType, memberLabel } = useAuth();
  const c = colorMap[orgType] ?? colorMap.SCHOOL;

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrorMsg("");
  };

  const createMember = useMutation({
    // This form only ever creates the member tier (Student/Employee/Staff/
    // Member depending on org type) — support-tier accounts (Counselor,
    // Wellness Coach, etc.) have their own enrollment flow.
    mutationFn: (values) => api.post("/org/members", { ...values, role: memberLabel }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      setSuccessMsg(`${res.data.name} has been enrolled. A welcome email with login details is on its way.`);
      setForm({ firstName: "", lastName: "", email: "" });
    },
    onError: (err) => {
      setErrorMsg(err?.response?.data?.message || "Failed to enroll. Please try again.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    createMember.mutate(form);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      <Link
        href="/org-admin/members"
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-700 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to {memberLabel}s Directory
      </Link>

      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Enroll {memberLabel}</h1>
        <p className="text-gray-500 mt-1 font-medium">
          Add a single {memberLabel.toLowerCase()}. For onboarding many at once, use{" "}
          <Link href="/org-admin/bulk-enrollment" className="underline font-bold text-gray-700">
            Bulk Enroll
          </Link>{" "}
          instead.
        </p>
      </div>

      {successMsg ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-10 text-center space-y-4">
          <div className="h-14 w-14 mx-auto rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <p className="text-lg font-black text-gray-900">Enrolled successfully</p>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">{successMsg}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setSuccessMsg("")}
              className={`rounded-2xl px-6 py-3 text-white font-black shadow-lg transition-all hover:-translate-y-0.5 ${c.btn}`}
            >
              Enroll Another
            </button>
            <Link
              href="/org-admin/members"
              className="rounded-2xl px-6 py-3 font-black text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all"
            >
              Back to Directory
            </Link>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 space-y-6"
        >
          {errorMsg && (
            <div className="rounded-2xl bg-red-50 border border-red-100 text-red-700 px-4 py-3 text-sm font-bold">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field
              label="First Name"
              value={form.firstName}
              onChange={(v) => update("firstName", v)}
              ring={c.ring}
              required
            />
            <Field
              label="Last Name"
              value={form.lastName}
              onChange={(v) => update("lastName", v)}
              ring={c.ring}
              required
            />
          </div>

          <Field
            label="Email"
            type="email"
            value={form.email}
            onChange={(v) => update("email", v)}
            ring={c.ring}
            required
          />

          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">
              Role
            </label>
            <div className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 text-gray-500 font-medium">
              {memberLabel}
            </div>
          </div>

          <button
            type="submit"
            disabled={createMember.isPending}
            className={`w-full flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-white font-black shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 ${c.btn}`}
          >
            <UserPlus className="h-5 w-5" />
            {createMember.isPending ? "Enrolling..." : `Enroll ${memberLabel}`}
          </button>
        </form>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", ring, required }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">
        {label}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-3 rounded-2xl border border-gray-100 bg-white shadow-sm focus:ring-2 outline-none transition-all font-medium ${ring}`}
      />
    </label>
  );
}
