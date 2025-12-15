"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { api } from "@/lib/axios";

interface School {
  id: string;
  name: string;
  email: string;
  status: "ACTIVE" | "SUSPENDED";
}

export default function SchoolDetailPage() {
  const { schoolId } = useParams<{ schoolId: string }>();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<School>({
    queryKey: ["school", schoolId],
    queryFn: async () => {
      const res = await api.get(`/super-admin/schools/${schoolId}`);
      return res.data;
    },
  });

  const [form, setForm] = useState<School | null>(null);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const updateSchool = useMutation({
    mutationFn: (values: Partial<School>) =>
      api.put(`/super-admin/schools/${schoolId}`, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school", schoolId] });
      alert("School updated");
    },
  });

  if (isLoading || !form) return <p>Loading school...</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">School Details</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateSchool.mutate(form);
        }}
        className="space-y-4"
      >
        <Field
          label="School Name"
          value={form.name}
          onChange={(v) => setForm({ ...form, name: v })}
        />

        <Field
          label="School Email"
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
        />

        <div className="flex items-center justify-between">
          <span className="font-medium">Status</span>
          <select
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value as any })
            }
            className="border rounded-md px-2 py-1"
          >
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>

        <button className="bg-black text-white px-4 py-2 rounded-md">
          Save Changes
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded-md px-3 py-2"
      />
    </label>
  );
}
