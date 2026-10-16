"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { ageFromDateString, todayInputValue, ADULT_AGE } from "@/lib/age";
import { ChevronLeft, UserPlus, CheckCircle2, ShieldCheck, AlertTriangle } from "lucide-react";

const colorMap = {
  SCHOOL:   { btn: "bg-blue-600 hover:bg-blue-700 shadow-blue-100",     ring: "focus:ring-blue-500/20 focus:border-blue-500" },
  COMPANY:  { btn: "bg-violet-600 hover:bg-violet-700 shadow-violet-100", ring: "focus:ring-violet-500/20 focus:border-violet-500" },
  HOSPITAL: { btn: "bg-teal-600 hover:bg-teal-700 shadow-teal-100",     ring: "focus:ring-teal-500/20 focus:border-teal-500" },
  NGO:      { btn: "bg-green-600 hover:bg-green-700 shadow-green-100",  ring: "focus:ring-green-500/20 focus:border-green-500" },
};

const EMPTY_FORM = { firstName: "", lastName: "", email: "", dateOfBirth: "" };
const EMPTY_PARENT = { firstName: "", lastName: "", email: "" };

export default function NewMemberPage() {
  const queryClient = useQueryClient();
  const { orgType, memberLabel } = useAuth();
  const c = colorMap[orgType] ?? colorMap.SCHOOL;
  const isSchool = orgType === "SCHOOL";

  const [form, setForm] = useState(EMPTY_FORM);
  const [parent, setParent] = useState(EMPTY_PARENT);
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState(null);

  const age = isSchool ? ageFromDateString(form.dateOfBirth) : null;
  const isMinor = age !== null && age < ADULT_AGE;

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrorMsg("");
  };

  const updateParent = (field, value) => {
    setParent((prev) => ({ ...prev, [field]: value }));
    setErrorMsg("");
  };

  const createMember = useMutation({
    // This form only ever creates the member tier (Student/Employee/Staff/
    // Member depending on org type) — support-tier accounts (Counselor,
    // Wellness Coach, etc.) have their own enrollment flow.
    mutationFn: (values) => api.post("/org/members", values),
    onSuccess: (res, values) => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["parent-consent-overview"] });
      setResult({ ...res.data, parentEmail: values.parent?.email });
      setForm(EMPTY_FORM);
      setParent(EMPTY_PARENT);
    },
    onError: (err) => {
      setErrorMsg(err?.response?.data?.message || "Failed to enroll. Please try again.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setResult(null);
    createMember.mutate({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      role: memberLabel,
      ...(isSchool && form.dateOfBirth ? { dateOfBirth: form.dateOfBirth } : {}),
      ...(isSchool && isMinor ? { parent } : {}),
    });
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
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Enroll {memberLabel}</h1>
        <p className="text-gray-500 mt-1 font-medium">
          Add a single {memberLabel.toLowerCase()}. For onboarding many at once, use{" "}
          <Link href="/org-admin/bulk-enrollment" className="underline font-bold text-gray-700 dark:text-gray-300">
            Bulk Enroll
          </Link>{" "}
          instead.
        </p>
      </div>

      {result ? (
        <div className="bg-white dark:bg-gray-900 dim:bg-white rounded-3xl border border-gray-100 dark:border-gray-800 dim:border-slate-300/70 shadow-xl p-10 text-center space-y-4">
          <div className="h-14 w-14 mx-auto rounded-2xl bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <p className="text-lg font-black text-gray-900 dark:text-white">Enrolled successfully</p>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            {result.name} has been enrolled. A welcome email with login details is on its way.
          </p>

          {result.parentLinked && (
            <div className="max-w-sm mx-auto flex items-start gap-2 text-left rounded-2xl bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 text-green-800 dark:text-green-400 px-4 py-3 text-sm font-medium">
              <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
              A parental consent request has been emailed to {result.parentEmail}.
            </div>
          )}
          {result.isMinor && !result.parentLinked && (
            <div className="max-w-sm mx-auto flex items-start gap-2 text-left rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 text-amber-800 dark:text-amber-400 px-4 py-3 text-sm font-medium">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                {result.parentError ?? "No parent was linked."} Link a parent from the student&apos;s
                profile to send the consent request.
              </span>
            </div>
          )}

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setResult(null)}
              className={`rounded-2xl px-6 py-3 text-white font-black shadow-lg transition-all hover:-translate-y-0.5 ${c.btn}`}
            >
              Enroll Another
            </button>
            <Link
              href="/org-admin/members"
              className="rounded-2xl px-6 py-3 font-black text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              Back to Directory
            </Link>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-900 dim:bg-white rounded-3xl border border-gray-100 dark:border-gray-800 dim:border-slate-300/70 shadow-xl p-8 space-y-6"
        >
          {errorMsg && (
            <div className="rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-700 dark:text-red-400 px-4 py-3 text-sm font-bold">
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

          {isSchool && (
            <div className="space-y-2">
              <Field
                label="Date of Birth"
                type="date"
                value={form.dateOfBirth}
                onChange={(v) => update("dateOfBirth", v)}
                ring={c.ring}
                max={todayInputValue()}
              />
              <AgeHint age={age} />
            </div>
          )}

          {isSchool && isMinor && (
            <div className="rounded-2xl border border-amber-100 dark:border-amber-500/20 bg-amber-50/40 dark:bg-amber-500/10 p-5 space-y-5">
              <div>
                <p className="text-sm font-black text-gray-900 dark:text-white">Parent / Guardian</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Students under {ADULT_AGE} need parental consent. We&apos;ll email the parent a consent
                  request as soon as you enroll.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field
                  label="Parent First Name"
                  value={parent.firstName}
                  onChange={(v) => updateParent("firstName", v)}
                  ring={c.ring}
                  required
                />
                <Field
                  label="Parent Last Name"
                  value={parent.lastName}
                  onChange={(v) => updateParent("lastName", v)}
                  ring={c.ring}
                  required
                />
              </div>
              <Field
                label="Parent Email"
                type="email"
                value={parent.email}
                onChange={(v) => updateParent("email", v)}
                ring={c.ring}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">
              Role
            </label>
            <div className="w-full px-4 py-3 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
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

function AgeHint({ age }) {
  if (age === null) {
    return (
      <p className="text-xs text-gray-400 ml-1">
        Optional, but needed to know whether parental consent is required.
      </p>
    );
  }
  if (age < 0) return <p className="text-xs font-bold text-red-600 ml-1">Date of birth is in the future.</p>;
  return age < ADULT_AGE ? (
    <p className="text-xs font-bold text-amber-600 ml-1">Age {age} — under {ADULT_AGE}, parental consent required.</p>
  ) : (
    <p className="text-xs font-bold text-green-600 ml-1">Age {age} — no parental consent needed.</p>
  );
}

function Field({ label, value, onChange, type = "text", ring, required, max }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">
        {label}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-3 rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:ring-2 outline-none transition-all font-medium ${ring}`}
      />
    </label>
  );
}
