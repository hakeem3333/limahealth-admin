"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/axios";

export default function SuperAdminAdminsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["super-admin-admins"],
    queryFn: async () => {
      const res = await api.get("/super-admin/admins");
      return res.data;
    },
    retry: 1,
  });

  const resetPassword = useMutation({
    mutationFn: (adminId) =>
      api.post(`/super-admin/admins/${adminId}/reset-password`),
    onSuccess: () => alert("Password reset email sent"),
    onError: () => alert("Failed to reset password. Is the server running?"),
  });

  const deactivateAdmin = useMutation({
    mutationFn: (adminId) =>
      api.patch(`/super-admin/admins/${adminId}/deactivate`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["super-admin-admins"] }),
    onError: () => alert("Failed to deactivate admin."),
  });

  if (isLoading) return <p className="p-8 text-center">Loading admins...</p>;

  // Safety check for offline server or missing data
  if (error || !data) {
    return (
      <div className="p-8 text-center border-2 border-dashed rounded-xl">
        <p className="text-red-500 font-medium">Server connection failed.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Unable to fetch administrator list.
        </p>
      </div>
    );
  }

  // Ensure data is an array
  const adminsList = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">School Admins</h1>
          <p className="text-sm text-muted-foreground">
            Manage all school administrators
          </p>
        </div>

        <Link
          href="/super-admin/admins/create"
          className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
        >
          + Add Admin
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white dark:bg-gray-900">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>School</Th>
              <Th>Status</Th>
              <Th>Date Created</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {adminsList.length > 0 ? (
              adminsList.map((admin) => (
                <tr key={admin?.id} className="border-t">
                  <Td className="font-medium">{admin?.name || "N/A"}</Td>
                  <Td>{admin?.email || "N/A"}</Td>
                  <Td>{admin?.schoolName || "N/A"}</Td>
                  <Td>
                    <StatusBadge status={admin?.status} />
                  </Td>
                  <Td>
                    {admin?.createdAt
                      ? new Date(admin.createdAt).toLocaleDateString()
                      : "N/A"}
                  </Td>
                  <Td className="text-right space-x-3">
                    <Link
                      href={`/super-admin/admins/${admin?.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => resetPassword.mutate(admin?.id)}
                      disabled={resetPassword.isPending}
                      className="text-yellow-600 hover:underline disabled:opacity-50"
                    >
                      {resetPassword.isPending ? "..." : "Reset Password"}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Deactivate this admin?"))
                          deactivateAdmin.mutate(admin?.id);
                      }}
                      disabled={deactivateAdmin.isPending}
                      className="text-red-600 hover:underline disabled:opacity-50"
                    >
                      {deactivateAdmin.isPending ? "..." : "Deactivate"}
                    </button>
                  </Td>
                </tr>
              ))
            ) : (
              <tr>
                <Td
                  colSpan={6}
                  className="text-center py-10 text-muted-foreground"
                >
                  No admins found.
                </Td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* -----------------------------
   UI Components
------------------------------ */

function Th({ children, className = "" }) {
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = "" }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

function StatusBadge({ status }) {
  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium ${
        status === "ACTIVE"
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {status || "UNKNOWN"}
    </span>
  );
}
