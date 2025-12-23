"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/axios";

export default function SuperAdminSchoolsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["super-admin-schools"],
    queryFn: async () => {
      const res = await api.get("/super-admin/schools");
      return res.data;
    },
    // This stops React Query from retrying infinitely if the server is down
    retry: 1,
  });

  if (isLoading) return <p className="p-8 text-center">Loading schools...</p>;

  // Check if there was an error OR if the data simply didn't arrive
  if (error || !data) {
    return (
      <div className="p-8 text-center border-2 border-dashed rounded-xl">
        <p className="text-red-500 font-medium">
          Server is currently unreachable.
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Please ensure your backend is running at the correct URL.
        </p>
      </div>
    );
  }

  // Ensure 'schools' is an array. If your API nests the array (e.g., data.schools),
  // change 'data' to 'data.schools' below.
  const schoolsList = Array.isArray(data) ? data : [];

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
            {schoolsList.length > 0 ? (
              schoolsList.map((school) => (
                <tr key={school?.id} className="border-t">
                  <Td className="font-medium">{school?.name || "N/A"}</Td>
                  <Td>{school?.email || "N/A"}</Td>
                  <Td>{school?.studentsCount ?? 0}</Td>
                  <Td>{school?.adminsCount ?? 0}</Td>
                  <Td>
                    <StatusBadge status={school?.status} />
                  </Td>
                  <Td>
                    {school?.createdAt
                      ? new Date(school.createdAt).toLocaleDateString()
                      : "N/A"}
                  </Td>
                  <Td className="text-right">
                    <Link
                      href={`/super-admin/schools/${school?.id}`}
                      className="text-blue-600 hover:underline mr-3"
                    >
                      View / Edit
                    </Link>
                    <Link
                      href={`/super-admin/schools/${school?.id}/admins`}
                      className="text-blue-600 hover:underline"
                    >
                      Admins
                    </Link>
                  </Td>
                </tr>
              ))
            ) : (
              <tr>
                <Td
                  colSpan={7}
                  className="text-center py-10 text-muted-foreground"
                >
                  No schools found.
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
