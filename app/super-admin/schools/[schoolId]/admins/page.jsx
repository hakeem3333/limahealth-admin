"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useState } from "react";

export default function SchoolAdminsPage() {
  const { schoolId } = useParams();
  const queryClient = useQueryClient();
  const [adminId, setAdminId] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["school-admins", schoolId],
    queryFn: async () => {
      const res = await api.get(`/super-admin/schools/${schoolId}/admins`);
      return res.data;
    },
  });

  const assignAdmin = useMutation({
    mutationFn: () =>
      api.post(`/super-admin/schools/${schoolId}/admins`, { adminId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-admins", schoolId] });
      setAdminId("");
    },
  });

  const removeAdmin = useMutation({
    mutationFn: (id) =>
      api.delete(`/super-admin/schools/${schoolId}/admins/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["school-admins", schoolId] }),
  });

  if (isLoading) return <p>Loading admins...</p>;

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
          className="bg-black text-white px-4 rounded-md"
        >
          Assign
        </button>
      </div>

      {/* List of Admins */}
      <div className="border rounded-xl">
        {data.map((admin) => (
          <div
            key={admin.id}
            className="flex items-center justify-between p-3 border-b last:border-none"
          >
            <div>
              <p className="font-medium">{admin.name}</p>
              <p className="text-xs text-muted-foreground">{admin.email}</p>
            </div>
            <button
              onClick={() => removeAdmin.mutate(admin.id)}
              className="text-red-600 text-sm"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
