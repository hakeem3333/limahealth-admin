"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useState } from "react";
import { ArrowLeft, UserPlus, X } from "lucide-react";
import Button from "@/components/super-admin/ui/Button";
import { Card } from "@/components/super-admin/ui/Card";

export default function OrganisationAdminsPage() {
  const { orgId } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [adminId, setAdminId] = useState("");

  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["org-admins", orgId],
    queryFn: async () => {
      const res = await api.get(`/super-admin/organisations/${orgId}/admins`);
      return res.data;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const assignAdmin = useMutation({
    mutationFn: () =>
      api.post(`/super-admin/organisations/${orgId}/admins`, { adminId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-admins", orgId] });
      setAdminId("");
    },
    onError: (err) => console.error("Failed to assign admin:", err),
  });

  const removeAdmin = useMutation({
    mutationFn: (id) =>
      api.delete(`/super-admin/organisations/${orgId}/admins/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["org-admins", orgId] }),
    onError: (err) => console.error("Failed to remove admin:", err),
  });

  if (isLoading) {
    return <div className="h-72 bg-gray-200 rounded-2xl animate-pulse max-w-2xl" />;
  }

  if (error) {
    console.error("Failed to fetch organisation admins:", error);
    return (
      <div className="rounded-2xl bg-white shadow-card p-12 text-center max-w-2xl">
        <p className="text-red-500 font-semibold">Failed to load admins.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-lh-teal transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Organisation
      </button>

      <h1 className="font-display text-2xl font-bold text-lh-navy">Organisation Admins</h1>

      <Card className="space-y-6">
        <div className="flex gap-2">
          <input
            placeholder="Admin ID"
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 flex-1 focus:ring-2 focus:ring-lh-teal outline-none text-sm"
          />
          <Button
            onClick={() => assignAdmin.mutate()}
            disabled={!adminId || assignAdmin.isPending}
          >
            <UserPlus className="h-4 w-4" />
            {assignAdmin.isPending ? "Assigning..." : "Assign"}
          </Button>
        </div>

        <div className="border border-gray-100 rounded-xl divide-y divide-gray-50">
          {data.length === 0 ? (
            <p className="p-6 text-center text-gray-400 text-sm">
              No admins assigned yet.
            </p>
          ) : (
            data.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{admin.name}</p>
                  <p className="text-xs text-gray-400">{admin.email}</p>
                </div>
                <button
                  onClick={() => {
                    if (confirm("Remove this admin?")) removeAdmin.mutate(admin.id);
                  }}
                  disabled={removeAdmin.isPending}
                  className="flex items-center gap-1.5 text-red-600 text-xs font-bold disabled:opacity-50 hover:underline"
                >
                  <X className="h-3.5 w-3.5" />
                  {removeAdmin.isPending ? "Removing..." : "Remove"}
                </button>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
