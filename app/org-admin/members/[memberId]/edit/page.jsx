"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { ageFromDateString, todayInputValue, ADULT_AGE } from "@/lib/age";
import Link from "next/link";
import { ChevronLeft, Save, AlertTriangle } from "lucide-react";

const colorMap = {
  SCHOOL:   { btn: "bg-blue-600 hover:bg-blue-700 shadow-blue-100",     ring: "focus:ring-blue-500/20 focus:border-blue-500" },
  COMPANY:  { btn: "bg-violet-600 hover:bg-violet-700 shadow-violet-100", ring: "focus:ring-violet-500/20 focus:border-violet-500" },
  HOSPITAL: { btn: "bg-teal-600 hover:bg-teal-700 shadow-teal-100",     ring: "focus:ring-teal-500/20 focus:border-teal-500" },
  NGO:      { btn: "bg-green-600 hover:bg-green-700 shadow-green-100",  ring: "focus:ring-green-500/20 focus:border-green-500" },
};

export default function EditMemberPage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params.memberId;
  const queryClient = useQueryClient();
  const { orgType, memberLabel } = useAuth();
  const c = colorMap[orgType] ?? colorMap.SCHOOL;

  const { data, isLoading, error } = useQuery({
    queryKey: ["student-profile", memberId],
    queryFn: async () => {
      const res = await api.get(`/org/members/${memberId}`);
      return res.data;
    },
  });

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", dateOfBirth: "", isActive: true });
  const [errorMsg, setErrorMsg] = useState("");
  const isSchool = orgType === "SCHOOL";
  const age = isSchool ? ageFromDateString(form.dateOfBirth) : null;

  useEffect(() => {
    if (!data) return;
    setForm({
      firstName: data.firstName ?? "",
      lastName: data.lastName ?? "",
      email: data.email ?? "",
      dateOfBirth: data.dateOfBirth ?? "",
      isActive: !!data.isActive,
    });
  }, [data]);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrorMsg("");
  };

  const updateMember = useMutation({
    mutationFn: ({ dateOfBirth, ...values }) =>
      api.patch(`/org/members/${memberId}`, {
        ...values,
        // Only schools show the field; an empty value clears a previously saved date.
        ...(isSchool ? { dateOfBirth: dateOfBirth || null } : {}),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-profile", memberId] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["parent-consent-overview"] });
      router.push(`/org-admin/members/${memberId}`);
    },
    onError: (err) => {
      setErrorMsg(err?.response?.data?.message || "Failed to save changes.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    updateMember.mutate(form);
  };

  if (isLoading) return <EditSkeleton />;
  if (error || !data) return <ErrorState memberId={memberId} />;

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      <Link
        href={`/org-admin/members/${memberId}`}
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-700 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Profile
      </Link>

      <div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
          Edit {memberLabel}
        </h1>
        <p className="text-gray-500 mt-1 font-medium">
          Update {data.name}&apos;s profile details.
        </p>
      </div>

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
            {age !== null && age >= 0 && (
              <p className={`text-xs font-bold ml-1 ${age < ADULT_AGE ? "text-amber-600" : "text-green-600"}`}>
                Age {age} — {age < ADULT_AGE ? `under ${ADULT_AGE}, parental consent required.` : "no parental consent needed."}
              </p>
            )}
          </div>
        )}

        <label className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => update("isActive", e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Active Enrollment</span>
        </label>

        <div className="flex gap-3">
          <Link
            href={`/org-admin/members/${memberId}`}
            className="flex-1 flex items-center justify-center rounded-2xl px-6 py-4 font-black text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={updateMember.isPending}
            className={`flex-1 flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-white font-black shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 ${c.btn}`}
          >
            <Save className="h-5 w-5" />
            {updateMember.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
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

function ErrorState({ memberId }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-16 text-center shadow-sm">
      <div className="h-12 w-12 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <p className="text-lg font-black text-gray-900 dark:text-white">Couldn&apos;t load this member</p>
      <p className="text-sm text-gray-500 max-w-xs">
        They may no longer be enrolled, or something went wrong loading their profile.
      </p>
      <Link
        href={`/org-admin/members/${memberId}`}
        className="mt-2 text-sm font-bold text-blue-600 hover:underline"
      >
        Back to Profile
      </Link>
    </div>
  );
}

function EditSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4 animate-pulse">
      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
      <div className="h-10 w-64 bg-gray-200 dark:bg-gray-800 rounded" />
      <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
    </div>
  );
}
