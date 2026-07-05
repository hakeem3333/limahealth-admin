"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import {
  ShieldCheck,
  ArrowLeft,
  Building2,
  Mail,
  History,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";

export default function SchoolDetailPage() {
  const { schoolId } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    name: "",
    contact_email: "",
    status: "PENDING_ACTIVATION",
  });

  // 1. Fetch Data
  const { data, isLoading, error } = useQuery({
    queryKey: ["school", schoolId],
    queryFn: async () => {
      const res = await api.get(`/super-admin/schools/${schoolId}`);
      return res.data;
    },
  });

  // 2. Sync Form State
  useEffect(() => {
    if (data) {
      setForm({
        name: data.name || "",
        contact_email: data.contact_email || "",
        status: data.status || "PENDING_EMAIL_VERIFICATION",
      });
    }
  }, [data]);

  // 3. Update Mutation
  const updateSchool = useMutation({
    mutationFn: (values) => 
      api.put(`/super-admin/schools/${schoolId}`, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school", schoolId] });
      toast.success("Institutional protocol updated successfully.");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Protocol update failed.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSchool.mutate(form);
  };

  if (isLoading) return <LoadingState />;

  if (error) return (
    <div className="p-12 text-center bg-white rounded-[2.5rem] border border-red-100">
      <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h2 className="text-xl font-black text-gray-900">Handshake Failed</h2>
      <p className="text-gray-500">Could not retrieve institutional record.</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Navigation */}
      <button
        onClick={() => router.back()}
        className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
        Back to Registry
      </button>

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-indigo-900/5">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <Building2 className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-gray-900">
              {data?.name}
            </h1>
            <p className="text-sm font-bold text-gray-400 mt-1">
              ID: {String(schoolId).slice(0, 8)}... (Institutional Node)
            </p>
          </div>
        </div>
        <StatusBadge status={data?.status} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Config */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-8"
          >
            <h3 className="text-lg font-black tracking-tight border-b border-gray-50 pb-4">
              Core Identification
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <Field
                label="Registered School Name"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
                icon={<Building2 className="h-4 w-4" />}
              />
              <Field
                label="Primary Contact"
                value={form.contact_email}
                disabled
                icon={<Mail className="h-4 w-4" />}
              />
            </div>

            <div className="space-y-4 pt-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Administrative Authority Level
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatusOption
                  current={form.status}
                  value="PAYMENT_REQUIRED"
                  label="Grant Access (Unpaid)"
                  desc="Authorize access but redirect to billing"
                  onClick={(v) => setForm({ ...form, status: v })}
                />
                <StatusOption
                  current={form.status}
                  value="ACTIVE"
                  label="Fully Authorized"
                  desc="Bypass billing for partners/trials"
                  onClick={(v) => setForm({ ...form, status: v })}
                />
                <StatusOption
                  current={form.status}
                  value="PENDING_ACTIVATION"
                  label="Verification Stage"
                  desc="Awaiting SuperAdmin approval"
                  onClick={(v) => setForm({ ...form, status: v })}
                />
                <StatusOption
                  current={form.status}
                  value="SUSPENDED"
                  label="Suspended"
                  desc="Revoke all institutional access"
                  onClick={(v) => setForm({ ...form, status: v })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={updateSchool.isPending}
              className="w-full flex items-center justify-center gap-3 bg-gray-950 hover:bg-indigo-600 text-white font-black uppercase tracking-[0.2em] text-xs py-5 rounded-2xl transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
            >
              {updateSchool.isPending ? "Syncing..." : "Update Institutional Protocol"}
              <ShieldCheck className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Sidebar Context */}
        <div className="space-y-6">
          <div className="bg-gray-950 text-white rounded-[2rem] p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <History className="h-5 w-5 text-indigo-400" />
              <h4 className="text-sm font-black uppercase tracking-widest">Metadata</h4>
            </div>
            <div className="space-y-4">
              <MetaItem
                label="Registered"
                value={new Date(data?.createdAt).toLocaleDateString()}
              />
              <MetaItem
                label="Population"
                value={`${data?.studentsCount || 0} Students`}
              />
              <MetaItem
                label="Admin Staff"
                value={`${data?.adminsCount || 0} Accounts`}
              />
            </div>
          </div>

          <div className="bg-indigo-50 rounded-[2rem] p-8 border border-indigo-100">
            <p className="text-xs font-bold text-indigo-900 leading-relaxed italic">
              "Transitioning status to 'Grant Access' will trigger the automatic 
              subscription enforcement protocol for this node."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -----------------------------
   UI Components
------------------------------ */

function StatusBadge({ status }) {
  const styles = {
    ACTIVE: "bg-emerald-50 text-emerald-600 ring-emerald-600/10",
    PAYMENT_REQUIRED: "bg-purple-50 text-purple-600 ring-purple-600/10",
    PENDING_ACTIVATION: "bg-amber-50 text-amber-600 ring-amber-600/10",
    PENDING_EMAIL_VERIFICATION: "bg-blue-50 text-blue-700 ring-blue-700/10",
    SUSPENDED: "bg-rose-50 text-rose-600 ring-rose-600/10",
  };
  return (
    <span className={`text-[10px] font-black px-4 py-2 rounded-xl ring-1 ring-inset tracking-widest uppercase ${styles[status] || "bg-gray-100"}`}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}

function Field({ label, value, onChange, disabled = false, icon }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
          {icon}
        </div>
        <input
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-gray-50 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-600 rounded-xl px-11 py-3 text-sm font-bold text-gray-900 transition-all disabled:opacity-50"
        />
      </div>
    </div>
  );
}

function StatusOption({ current, value, label, desc, onClick }) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`text-left p-4 rounded-2xl border-2 transition-all ${
        active ? "border-indigo-600 bg-indigo-50/50" : "border-gray-50 bg-white hover:border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-black uppercase tracking-tight ${active ? "text-indigo-600" : "text-gray-900"}`}>
          {label}
        </span>
        {active && <CheckCircle2 className="h-4 w-4 text-indigo-600" />}
      </div>
      <p className="text-[10px] font-medium text-gray-500">{desc}</p>
    </button>
  );
}

function MetaItem({ label, value }) {
  return (
    <div className="flex justify-between items-center border-b border-white/5 pb-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{label}</span>
      <span className="text-xs font-bold text-white/80">{value}</span>
    </div>
  );
}

function LoadingState() {
  return <div className="max-w-4xl mx-auto h-[60vh] bg-gray-50 animate-pulse rounded-[2.5rem]" />;
}