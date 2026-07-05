"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useState } from "react";

export default function SchoolAdminsPage() {
  const { schoolId } = useParams();
  const queryClient = useQueryClient();
  const [adminId, setAdminId] = useState("");

  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["school-admins", schoolId],
    queryFn: async () => {
      const res = await api.get(`/super-admin/schools/${schoolId}/admins`);
      return res.data;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const assignAdmin = useMutation({
    mutationFn: () =>
      api.post(`/super-admin/schools/${schoolId}/admins`, { adminId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-admins", schoolId] });
      setAdminId("");
    },
    onError: (err) => console.error("Failed to assign admin:", err),
  });

  const removeAdmin = useMutation({
    mutationFn: (id) =>
      api.delete(`/super-admin/schools/${schoolId}/admins/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["school-admins", schoolId] }),
    onError: (err) => console.error("Failed to remove admin:", err),
  });

  if (isLoading) {
    return (
      <p className="p-8 text-center text-muted-foreground">Loading admins...</p>
    );
  }

  if (error) {
    console.error("Failed to fetch school admins:", error);
    return (
      <p className="p-8 text-center text-red-500">Failed to load admins.</p>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">School Admins</h1>

      {/* Assign Admin */}
      <div className="flex gap-2">
        <input
          placeholder="Admin ID"
          value={adminId}
          onChange={(e) => setAdminId(e.target.value)}
          className="border rounded-md px-3 py-2 flex-1"
        />
        <button
          onClick={() => assignAdmin.mutate()}
          disabled={!adminId || assignAdmin.isPending}
          className="bg-black text-white px-4 rounded-md disabled:opacity-50"
        >
          {assignAdmin.isPending ? "Assigning..." : "Assign"}
        </button>
      </div>

      {/* Admin List */}
      <div className="border rounded-xl">
        {data.length === 0 ? (
          <p className="p-4 text-center text-muted-foreground">
            No admins assigned yet.
          </p>
        ) : (
          data.map((admin) => (
            <div
              key={admin.id}
              className="flex items-center justify-between p-3 border-b last:border-none"
            >
              <div>
                <p className="font-medium">{admin.name}</p>
                <p className="text-xs text-muted-foreground">{admin.email}</p>
              </div>
              <button
                onClick={() => {
                  if (confirm("Remove this admin?"))
                    removeAdmin.mutate(admin.id);
                }}
                disabled={removeAdmin.isPending}
                className="text-red-600 text-sm disabled:opacity-50"
              >
                {removeAdmin.isPending ? "Removing..." : "Remove"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
