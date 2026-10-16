"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Plus, KeyRound, UserX, UserCheck } from "lucide-react";
import { api } from "@/lib/axios";
import Button from "@/components/super-admin/ui/Button";
import Badge from "@/components/super-admin/ui/Badge";
import Table, { Td } from "@/components/super-admin/ui/Table";

export default function SuperAdminAdminsPage() {
  const queryClient = useQueryClient();
  const [activeAdminId, setActiveAdminId] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["super-admin-admins"],
    queryFn: async () => {
      const res = await api.get("/super-admin/admins");
      return res.data;
    },
    retry: 1,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const resetPassword = useMutation({
    mutationFn: (adminId) =>
      api.post(`/super-admin/admins/${adminId}/reset-password`),
    onMutate: (adminId) => setActiveAdminId(adminId),
    onSuccess: () => {
      alert("Password reset email sent");
    },
    onError: (err) => {
      console.error("Reset password failed:", err);
      alert("Failed to reset password");
    },
    onSettled: () => setActiveAdminId(null),
  });

  const setAdminActive = useMutation({
    mutationFn: ({ adminId, active }) =>
      api.patch(`/super-admin/admins/${adminId}/${active ? "activate" : "deactivate"}`),
    onMutate: ({ adminId }) => setActiveAdminId(adminId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["super-admin-admins"],
      });
    },
    onError: (err) => {
      console.error("Update admin status failed:", err);
      alert("Failed to update admin status");
    },
    onSettled: () => setActiveAdminId(null),
  });

  if (isLoading) {
    return <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />;
  }

  if (error || !data) {
    console.error("Fetch admins error:", error, data);
    return (
      <div className="rounded-2xl bg-white dark:bg-gray-900 dim:bg-white shadow-card p-12 text-center">
        <p className="text-red-500 dark:text-red-400 font-semibold">Server connection failed.</p>
        <p className="text-sm text-gray-400 mt-1">
          Unable to fetch administrator list.
        </p>
      </div>
    );
  }

  const adminsList = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-lh-teal dark:text-lh-teal-light mb-2">
            System Authority
          </p>
          <h1 className="font-display text-3xl font-bold text-lh-navy dark:text-white">
            Global Admins
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage all organisation administrators
          </p>
        </div>

        <Link href="/super-admin/admins/create">
          <Button>
            <Plus className="h-4 w-4" />
            Add Admin
          </Button>
        </Link>
      </div>

      <Table headers={["Name", "Email", "Organisation", "Status", "Registered", "Actions"]}>
        {adminsList.length > 0 ? (
          adminsList.map((admin) => {
            const isActive = activeAdminId === admin?.id;
            return (
              <tr key={admin?.id || admin?.email} className="hover:bg-lh-teal-light/40 dark:hover:bg-gray-800/60 transition-colors">
                <Td className="font-semibold text-gray-900 dark:text-white">{admin?.name || "N/A"}</Td>
                <Td className="text-gray-500">{admin?.email || "N/A"}</Td>
                <Td className="text-gray-500">{admin?.orgName || "N/A"}</Td>
                <Td>
                  <Badge status={admin?.status} />
                </Td>
                <Td className="text-gray-500">
                  {admin?.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "N/A"}
                </Td>
                <Td className="text-right space-x-3 whitespace-nowrap">
                  <Link
                    href={`/super-admin/admins/${admin?.id}`}
                    className="text-lh-teal dark:text-lh-teal-light font-semibold hover:underline"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => resetPassword.mutate(admin?.id)}
                    disabled={isActive}
                    className="inline-flex items-center gap-1 text-lh-accent font-semibold hover:underline disabled:opacity-50"
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    {isActive ? "..." : "Reset"}
                  </button>
                  {admin?.status === "INACTIVE" ? (
                    <button
                      onClick={() => setAdminActive.mutate({ adminId: admin?.id, active: true })}
                      disabled={isActive}
                      className="inline-flex items-center gap-1 text-emerald-600 font-semibold hover:underline disabled:opacity-50"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      {isActive ? "..." : "Reactivate"}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (confirm("Deactivate this admin?")) {
                          setAdminActive.mutate({ adminId: admin?.id, active: false });
                        }
                      }}
                      disabled={isActive}
                      className="inline-flex items-center gap-1 text-red-600 font-semibold hover:underline disabled:opacity-50"
                    >
                      <UserX className="h-3.5 w-3.5" />
                      {isActive ? "..." : "Deactivate"}
                    </button>
                  )}
                </Td>
              </tr>
            );
          })
        ) : (
          <tr>
            <Td colSpan={6} className="text-center py-16 text-gray-400">
              No admins found.
            </Td>
          </tr>
        )}
      </Table>
    </div>
  );
}
