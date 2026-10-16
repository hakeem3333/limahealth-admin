"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ArrowLeft, UserPlus } from "lucide-react";
import { api } from "@/lib/axios";
import Button from "@/components/super-admin/ui/Button";
import { Card } from "@/components/super-admin/ui/Card";

const inputClass =
  "w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dim:bg-white dark:text-white dark:placeholder:text-gray-500 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-lh-teal outline-none text-sm";

const labelClass =
  "block text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5";

export default function CreateAdminPage() {
  // useSearchParams needs a Suspense boundary in the app router.
  return (
    <Suspense fallback={<div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse max-w-2xl" />}>
      <CreateAdminForm />
    </Suspense>
  );
}

function CreateAdminForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    orgId: searchParams.get("orgId") ?? "",
  });

  const { data: orgs, isLoading: orgsLoading } = useQuery({
    queryKey: ["super-admin-orgs"],
    queryFn: async () => {
      const res = await api.get("/super-admin/organisations");
      return Array.isArray(res.data) ? res.data : res.data?.data ?? [];
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const createAdmin = useMutation({
    mutationFn: () => api.post("/super-admin/admins", form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin-admins"] });
      toast.success("Admin created — login details emailed");
      router.push("/super-admin/admins");
    },
    onError: (err) => {
      console.error("Create admin failed:", err);
      toast.error(err?.response?.data?.message || "Failed to create admin");
    },
  });

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const canSubmit =
    form.firstName.trim() && form.lastName.trim() && form.email.trim() && form.orgId;

  return (
    <div className="space-y-6 max-w-2xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-lh-teal transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Admins
      </button>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-lh-teal dark:text-lh-teal-light mb-2">
          System Authority
        </p>
        <h1 className="font-display text-3xl font-bold text-lh-navy dark:text-white">Add Admin</h1>
        <p className="text-sm text-gray-500 mt-1">
          Creates an organisation admin and emails them a temporary password.
        </p>
      </div>

      <Card>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit) createAdmin.mutate();
          }}
          className="space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="firstName">First name</label>
              <input id="firstName" value={form.firstName} onChange={update("firstName")} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass} htmlFor="lastName">Last name</label>
              <input id="lastName" value={form.lastName} onChange={update("lastName")} className={inputClass} required />
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="email">Email</label>
            <input id="email" type="email" value={form.email} onChange={update("email")} className={inputClass} required />
          </div>

          <div>
            <label className={labelClass} htmlFor="orgId">Organisation</label>
            <select
              id="orgId"
              value={form.orgId}
              onChange={update("orgId")}
              className={inputClass}
              disabled={orgsLoading}
              required
            >
              <option value="">{orgsLoading ? "Loading organisations..." : "Select an organisation"}</option>
              {(orgs ?? []).map((org) => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => router.push("/super-admin/admins")}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || createAdmin.isPending}>
              <UserPlus className="h-4 w-4" />
              {createAdmin.isPending ? "Creating..." : "Create Admin"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
