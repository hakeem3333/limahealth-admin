"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";
import { api } from "@/lib/axios";
import Button from "@/components/super-admin/ui/Button";
import Badge from "@/components/super-admin/ui/Badge";
import Table, { Td } from "@/components/super-admin/ui/Table";

const ORG_TYPES = ["SCHOOL", "COMPANY", "HOSPITAL", "NGO"];
const ORG_STATUSES = [
  "PENDING_EMAIL_VERIFICATION",
  "PENDING_ACTIVATION",
  "ACTIVE",
  "PAYMENT_REQUIRED",
  "SUSPENDED",
  "EXPIRED",
];

export default function SuperAdminOrganisationsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { data, isLoading, error } = useQuery({
    queryKey: ["super-admin-organisations"],
    queryFn: async () => {
      const res = await api.get("/super-admin/organisations");
      return res.data;
    },
    retry: 1,
  });

  if (isLoading) {
    return <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />;
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl bg-white dark:bg-gray-900 dim:bg-white shadow-card p-12 text-center">
        <p className="text-red-500 dark:text-red-400 font-semibold">
          Server is currently unreachable.
        </p>
        <p className="text-sm text-gray-400 mt-1">Please try again later.</p>
      </div>
    );
  }

  const orgsList = Array.isArray(data)
    ? [...data]
        .filter((o) => o.name?.toLowerCase().includes(search.toLowerCase()))
        .filter((o) => typeFilter === "ALL" || o.orgType === typeFilter)
        .filter((o) => statusFilter === "ALL" || o.status === statusFilter)
        .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-lh-teal dark:text-lh-teal-light mb-2">
            Platform Inventory
          </p>
          <h1 className="font-display text-3xl font-bold text-lh-navy dark:text-white">
            Organisation Registry
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage all organisations on LimaHealth
          </p>
        </div>

        <Link href="/super-admin/organisations/create">
          <Button>
            <Plus className="h-4 w-4" />
            Add Organisation
          </Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 flex-1 bg-white dark:bg-gray-900 dim:bg-white dark:text-white dark:placeholder:text-gray-500 focus:ring-2 focus:ring-lh-teal outline-none text-sm"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-900 dim:bg-white dark:text-white focus:ring-2 focus:ring-lh-teal outline-none text-sm"
        >
          <option value="ALL">All Types</option>
          {ORG_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-900 dim:bg-white dark:text-white focus:ring-2 focus:ring-lh-teal outline-none text-sm"
        >
          <option value="ALL">All Statuses</option>
          {ORG_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      <Table headers={["Organisation", "Type", "Email", "Members", "Admins", "Status", "Registered", "Management"]}>
        {orgsList.length > 0 ? (
          orgsList.map((org) => (
            <tr key={org?.id} className="hover:bg-lh-teal-light/40 dark:hover:bg-gray-800/60 transition-colors">
              <Td className="font-semibold text-gray-900 dark:text-white">{org?.name || "N/A"}</Td>
              <Td className="text-gray-500">{org?.orgType || "N/A"}</Td>
              <Td className="text-gray-500">{org?.email || "N/A"}</Td>
              <Td className="text-gray-500">{org?.membersCount ?? 0}</Td>
              <Td className="text-gray-500">{org?.adminsCount ?? 0}</Td>
              <Td>
                <Badge status={org?.status} />
              </Td>
              <Td className="text-gray-500">
                {org?.createdAt ? new Date(org.createdAt).toLocaleDateString() : "N/A"}
              </Td>
              <Td className="text-right space-x-3">
                <Link
                  href={`/super-admin/organisations/${org?.id}`}
                  className="text-lh-teal dark:text-lh-teal-light font-semibold hover:underline"
                >
                  Configure
                </Link>
                <Link
                  href={`/super-admin/organisations/${org?.id}/admins`}
                  className="text-lh-teal dark:text-lh-teal-light font-semibold hover:underline"
                >
                  Admins
                </Link>
              </Td>
            </tr>
          ))
        ) : (
          <tr>
            <Td colSpan={8} className="text-center py-16 text-gray-400">
              No organisations match your search.
            </Td>
          </tr>
        )}
      </Table>
    </div>
  );
}
