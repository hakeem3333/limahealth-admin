"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ArrowLeft, Building2 } from "lucide-react";
import { api } from "@/lib/axios";
import Button from "@/components/super-admin/ui/Button";
import { Card } from "@/components/super-admin/ui/Card";

const ORG_TYPES = [
  { value: "SCHOOL", label: "School" },
  { value: "COMPANY", label: "Company" },
  { value: "HOSPITAL", label: "Hospital" },
  { value: "NGO", label: "NGO" },
];

const INITIAL_STATUSES = [
  { value: "ACTIVE", label: "Active — can sign in immediately" },
  { value: "PENDING_ACTIVATION", label: "Pending activation — approve later" },
];

const inputClass =
  "w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dim:bg-white dark:text-white dark:placeholder:text-gray-500 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-lh-teal outline-none text-sm";

const labelClass =
  "block text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5";

export default function CreateOrganisationPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", email: "", orgType: "SCHOOL", status: "ACTIVE" });

  const createOrg = useMutation({
    mutationFn: () => api.post("/super-admin/organisations", form),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["super-admin-organisations"] });
      queryClient.invalidateQueries({ queryKey: ["super-admin-orgs"] });
      toast.success("Organisation created — now add its first admin");
      router.push(`/super-admin/admins/create?orgId=${res.data.id}`);
    },
    onError: (err) => {
      console.error("Create organisation failed:", err);
      toast.error(err?.response?.data?.message || "Failed to create organisation");
    },
  });

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const canSubmit = form.name.trim().length >= 2 && form.email.trim() && form.orgType;

  return (
    <div className="space-y-6 max-w-2xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-lh-teal transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Organisations
      </button>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-lh-teal dark:text-lh-teal-light mb-2">
          Platform Inventory
        </p>
        <h1 className="font-display text-3xl font-bold text-lh-navy dark:text-white">Add Organisation</h1>
        <p className="text-sm text-gray-500 mt-1">
          Skips the self-signup email verification. You&apos;ll add the first admin next.
        </p>
      </div>

      <Card>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit) createOrg.mutate();
          }}
          className="space-y-5"
        >
          <div>
            <label className={labelClass} htmlFor="name">Organisation name</label>
            <input id="name" value={form.name} onChange={update("name")} className={inputClass} required />
          </div>

          <div>
            <label className={labelClass} htmlFor="email">Contact email</label>
            <input id="email" type="email" value={form.email} onChange={update("email")} className={inputClass} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="orgType">Type</label>
              <select id="orgType" value={form.orgType} onChange={update("orgType")} className={inputClass}>
                {ORG_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="status">Initial status</label>
              <select id="status" value={form.status} onChange={update("status")} className={inputClass}>
                {INITIAL_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => router.push("/super-admin/organisations")}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || createOrg.isPending}>
              <Building2 className="h-4 w-4" />
              {createOrg.isPending ? "Creating..." : "Create Organisation"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
