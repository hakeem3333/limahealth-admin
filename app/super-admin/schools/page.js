"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/axios";

interface School {
  id: string;
  name: string;
  email: string;
  studentsCount: number;
  adminsCount: number;
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
}

export default function SuperAdminSchoolsPage() {
  const { data, isLoading, error } = useQuery<School[]>({
    queryKey: ["super-admin-schools"],
    queryFn: async () => {
      const res = await api.get("/super-admin/schools");
      return res.data;
    },
  });

  if (isLoading) return <p>Loading schools...</p>;
  if (error) return <p>Failed to load schools.</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Schools</h1>
          <p className="text-sm text-muted-foreground">
            Manage all schools on LimaHealth
          </p>
        </div>

        <Link
          href="/super-admin/schools/create"
          className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
        >
          + Add School
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border bg-white dark:bg-gray-900">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <Th>School</Th>
              <Th>Email</Th>
              <Th>Students</Th>
              <Th>Admins</Th>
              <Th>Status</Th>
              <Th>Date Created</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((school) => (
              <tr key={school.id} className="border-t">
                <Td className="font-medium">{school.name}</Td>
                <Td>{school.email}</Td>
                <Td>{school.studentsCount}</Td>
                <Td>{school.adminsCount}</Td>
                <Td>
                  <StatusBadge status={school.status} />
                </Td>
                <Td>
                  {new Date(school.createdAt).toLocaleDateString()}
                </Td>
                <Td className="text-right">
                  <Link
                    href={`/super-admin/schools/${school.id}`}
                    className="text-blue-600 hover:underline mr-3"
                  >
                    View / Edit
                  </Link>
                  <Link
                    href={`/super-admin/schools/${school.id}/admins`}
                    className="text-blue-600 hover:underline"
                  >
                    Admins
                  </Link>
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
