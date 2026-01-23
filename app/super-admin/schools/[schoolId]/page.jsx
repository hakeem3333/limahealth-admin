"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { api } from "@/lib/axios";

export default function SchoolDetailPage() {
  const { schoolId } = useParams();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    contact_email: "",
    status: "ACTIVE",
  });
  const [successMsg, setSuccessMsg] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["school", schoolId],
    queryFn: async () => {
      const res = await api.get(`/super-admin/schools/${schoolId}`);
      return res.data;
    },
  });

  useEffect(() => {
    if (data) {
      setForm({
        name: data.name || "",
        contact_email: data.email || "", // Changed from 'email' to match your schema
        status: data.status || "PENDING_EMAIL_VERIFICATION",
      });
    }
  }, [data]);

  const updateSchool = useMutation({
    mutationFn: (values) => api.put(`/super-admin/schools/${schoolId}`, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school", schoolId] });
      setSuccessMsg("School status updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000); // Clear message after 3s
    },
    onError: (err) => {
      console.error("Update failed:", err);
      alert(err.response?.data?.message || "Failed to update school.");
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
    updateSchool.mutate(form);
  };

  return (
    <div className="max-w-2xl space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">School Management</h1>
        <StatusBadge status={data?.status} />
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {successMsg}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded-lg border shadow-sm"
      >
        <Field
          label="School Name"
          value={form.name}
          onChange={(v) => setForm({ ...form, name: v })}
        />
        <Field
          label="Contact Email"
          value={form.contact_email}
          onChange={(v) => setForm({ ...form, contact_email: v })}
          disabled // Usually, you don't want to change the primary contact email here
        />

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Administrative Status
          </label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full border rounded-md px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="PENDING_EMAIL_VERIFICATION">
              Awaiting Email Verification
            </option>
            <option value="PENDING_ACTIVATION">
              Awaiting SuperAdmin Approval
            </option>
            <option value="ACTIVE">Active / Approved</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
          <p className="text-xs text-muted-foreground mt-1">
            Setting this to "Active" will allow the school admin to log in.
          </p>
        </div>

        <button
          type="submit"
          disabled={updateSchool.isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-colors disabled:opacity-50"
        >
          {updateSchool.isPending ? "Updating..." : "Update School Status"}
        </button>
      </form>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    ACTIVE: "bg-green-100 text-green-700",
    PENDING_ACTIVATION: "bg-yellow-100 text-yellow-700",
    PENDING_EMAIL_VERIFICATION: "bg-blue-100 text-blue-700",
    SUSPENDED: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`text-xs font-bold px-2 py-1 rounded-full ${styles[status] || "bg-gray-100"}`}
    >
      {status?.replace(/_/g, " ")}
    </span>
  );
}

function Field({ label, value, onChange, disabled = false }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
      />
    </label>
  );
}
