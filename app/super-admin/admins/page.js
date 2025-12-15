"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/axios";

interface Admin {
  id: string;
  name: string;
  email: string;
  schoolName: string;
  schoolId: string;
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
}

export default function SuperAdminAdminsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<Admin[]>({
    queryKey: ["super-admin-admins"],
    queryFn: async () => {
      const res = await api.get("/super-admin/admins");
      return res.data;
    },
  });

  const resetPassword = useMutation({
    mutationFn: (adminId: string) =>
      api.post(`/super-admin/admins/${adminId}/reset-password`),
    onSuccess: () => alert("Password reset email sent"),
  });

  const deactivateAdmin = useMutation({
    mutationFn: (adminId: string) =>
      api.patch(`/super-admin/admins/${adminId}/deactivate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["super-admin-admins"] }),
  });

  if (isLoading) return <p>Loading admins...</p>;
  if (error) return <p>Failed to load admins.</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Admins Table */}
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
            {data.map((admin) => (
              <tr key={admin.id} className="border-t">
                <Td className="font-medium">{admin.name}</Td>
                <Td>{admin.email}</Td>
                <Td>{admin.schoolName}</Td>
                <Td>
                  <StatusBadge status={admin.status} />
                </Td>
                <Td>
                  {new Date(admin.createdAt).toLocaleDateString()}
                </Td>
                <Td className="text-right space-x-3">
                  <Link
                    href={`/super-admin/admins/${admin.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => resetPassword.mutate(admin.id)}
                    className="text-yellow-600 hover:underline"
                  >
                    Reset Password
                  </button>
                  <button
                    onClick={() => deactivateAdmin.mutate(admin.id)}
                    className="text-red-600 hover:underline"
                  >
                    Deactivate
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* -----------------------------
   UI Components
------------------------------ */

function Th({ children, className = "" }: any) {
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = "" }: any) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

function StatusBadge({ status }: { status: "ACTIVE" | "SUSPENDED" }) {
  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium ${
        status === "ACTIVE"
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {status}
    </span>
  );
}
