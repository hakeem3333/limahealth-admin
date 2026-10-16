"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ArrowLeft, Building2, Calendar, KeyRound, Mail, ShieldCheck, UserCheck, UserX } from "lucide-react";
import { api } from "@/lib/axios";
import Button from "@/components/super-admin/ui/Button";
import Badge from "@/components/super-admin/ui/Badge";
import { Card } from "@/components/super-admin/ui/Card";

export default function SuperAdminAdminDetailPage() {
  const { adminId } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["super-admin-admin", adminId],
    queryFn: async () => {
      const res = await api.get(`/super-admin/admins/${adminId}`);
      return res.data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["super-admin-admin", adminId] });
    queryClient.invalidateQueries({ queryKey: ["super-admin-admins"] });
  };

  const resetPassword = useMutation({
    mutationFn: () => api.post(`/super-admin/admins/${adminId}/reset-password`),
    onSuccess: () => toast.success("Password reset email sent"),
    onError: (err) => {
      console.error("Reset password failed:", err);
      toast.error(err?.response?.data?.message || "Failed to reset password");
    },
  });

  const setActive = useMutation({
    mutationFn: (active) =>
      api.patch(`/super-admin/admins/${adminId}/${active ? "activate" : "deactivate"}`),
    onSuccess: (_res, active) => {
      toast.success(active ? "Admin reactivated" : "Admin deactivated");
      refresh();
    },
    onError: (err) => {
      console.error("Update admin status failed:", err);
      toast.error(err?.response?.data?.message || "Failed to update admin status");
    },
  });

  if (isLoading) {
    return <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse max-w-3xl" />;
  }

  if (error || !data) {
    const notFound = error?.response?.status === 404;
    return (
      <div className="rounded-2xl bg-white dark:bg-gray-900 dim:bg-white shadow-card p-12 text-center max-w-3xl">
        <p className="text-red-500 dark:text-red-400 font-semibold">
          {notFound ? "Admin not found." : "Failed to load admin."}
        </p>
        <Link href="/super-admin/admins" className="text-sm text-lh-teal font-semibold hover:underline mt-3 inline-block">
          Back to Admins
        </Link>
      </div>
    );
  }

  const isActive = data.status === "ACTIVE";

  return (
    <div className="space-y-6 max-w-3xl">
      <button
        onClick={() => router.push("/super-admin/admins")}
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-lh-teal transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Admins
      </button>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-lh-teal dark:text-lh-teal-light mb-2">
            Organisation Admin
          </p>
          <h1 className="font-display text-3xl font-bold text-lh-navy dark:text-white">{data.name}</h1>
          <div className="mt-2 flex items-center gap-2">
            <Badge status={data.status} />
            {data.mustChangePassword && (
              <span className="text-[11px] font-semibold text-gray-400">Temporary password not yet changed</span>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => resetPassword.mutate()}
            disabled={resetPassword.isPending}
          >
            <KeyRound className="h-4 w-4" />
            {resetPassword.isPending ? "Sending..." : "Reset Password"}
          </Button>
          {isActive ? (
            <Button
              variant="danger"
              onClick={() => {
                if (confirm("Deactivate this admin? They will be signed out and unable to log in.")) {
                  setActive.mutate(false);
                }
              }}
              disabled={setActive.isPending}
            >
              <UserX className="h-4 w-4" />
              {setActive.isPending ? "Saving..." : "Deactivate"}
            </Button>
          ) : (
            <Button onClick={() => setActive.mutate(true)} disabled={setActive.isPending}>
              <UserCheck className="h-4 w-4" />
              {setActive.isPending ? "Saving..." : "Reactivate"}
            </Button>
          )}
        </div>
      </div>

      <Card className="divide-y divide-gray-100 dark:divide-gray-800">
        <DetailRow icon={Mail} label="Email" value={data.email} />
        <DetailRow
          icon={Building2}
          label="Organisation"
          value={
            data.org ? (
              <Link
                href={`/super-admin/organisations/${data.org.id}`}
                className="text-lh-teal dark:text-lh-teal-light font-semibold hover:underline"
              >
                {data.org.name}
              </Link>
            ) : (
              "Not assigned"
            )
          }
        />
        {data.org && (
          <DetailRow icon={ShieldCheck} label="Organisation Status" value={<Badge status={data.org.status} />} />
        )}
        <DetailRow
          icon={Calendar}
          label="Registered"
          value={data.createdAt ? new Date(data.createdAt).toLocaleString() : "—"}
        />
      </Card>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <Icon className="h-4 w-4 text-gray-400" />
        {label}
      </div>
      <div className="text-sm text-gray-900 dark:text-white text-right">{value}</div>
    </div>
  );
}
