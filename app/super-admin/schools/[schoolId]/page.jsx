"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { api } from "@/lib/axios";

export default function SchoolDetailPage() {
  const { schoolId } = useParams();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", email: "", status: "ACTIVE" });
  const [successMsg, setSuccessMsg] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["school", schoolId],
    queryFn: async () => {
      const res = await api.get(`/super-admin/schools/${schoolId}`);
      return res.data;
    },
    onError: (err) => console.error("Failed to fetch school:", err),
  });

  useEffect(() => {
    if (data) {
      setForm({
        name: data.name || "",
        email: data.email || "",
        status: data.status || "ACTIVE",
      });
    }
  }, [data]);

  const updateSchool = useMutation({
    mutationFn: (values) => api.put(`/super-admin/schools/${schoolId}`, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school", schoolId] });
      setSuccessMsg("School updated successfully!");
    },
    onError: (err) => {
      console.error("Failed to update school:", err);
      alert("Failed to update school. Please try again.");
    },
  });

  if (isLoading)
    return (
      <p className="p-8 text-center text-muted-foreground">Loading school...</p>
    );
  if (error)
    return (
      <p className="p-8 text-center text-red-500">
        Failed to load school data.
      </p>
    );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      alert("Name and email cannot be empty.");
      return;
    }
    updateSchool.mutate(form);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">School Details</h1>

      {successMsg && <p className="text-green-600 font-medium">{successMsg}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
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
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="border rounded-md px-2 py-1"
          >
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={updateSchool.isPending}
          className="bg-black text-white px-4 py-2 rounded-md disabled:opacity-50"
        >
          {updateSchool.isPending ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, value, onChange }) {
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
