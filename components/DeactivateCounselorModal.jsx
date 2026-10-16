"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { X, UserX } from "lucide-react";

const UNASSIGN = "__unassign__";

/**
 * Deactivating a counselor who still has a caseload: the admin picks who takes
 * those students over (or leaves them unassigned) before the account is closed.
 * The API refuses to deactivate otherwise (409 CASELOAD_NOT_EMPTY).
 */
export default function DeactivateCounselorModal({ counselor, studentsCount, onClose, onDone }) {
  const { membersLabel, supportLabel } = useAuth();
  const [target, setTarget] = useState("");

  const { data: counselors = [], isLoading } = useQuery({
    queryKey: ["support-staff", ""],
    queryFn: async () => (await api.get("/org/counselors", { params: { search: "" } })).data,
  });
  const options = counselors.filter((c) => c.isActive && c.id !== counselor.id);

  const deactivate = useMutation({
    mutationFn: () =>
      api.patch(`/org/counselors/${counselor.id}/status`, {
        isActive: false,
        ...(target === UNASSIGN ? { unassign: true } : { reassignToId: target }),
      }),
    onSuccess: () => {
      toast.success(`${counselor.name} deactivated`);
      onDone();
    },
    onError: (err) => toast.error(err?.response?.data?.message ?? "Couldn't deactivate"),
  });

  const members = (membersLabel ?? "Students").toLowerCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-black text-gray-900 dark:text-white">Deactivate {counselor.name}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {counselor.name} has <strong>{studentsCount}</strong> assigned {members}. Choose who takes them over
            so their bookings, messages and alerts keep reaching someone.
          </p>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="" disabled>
              {isLoading ? "Loading…" : `Select a ${(supportLabel ?? "counselor").toLowerCase()}`}
            </option>
            {options.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.studentsCount ?? 0} {members})
              </option>
            ))}
            <option value={UNASSIGN}>Leave them unassigned</option>
          </select>
          {target === UNASSIGN && (
            <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
              Unassigned {members} can&apos;t book sessions or message anyone until you assign them a new{" "}
              {(supportLabel ?? "counselor").toLowerCase()}.
            </p>
          )}
        </div>

        <div className="p-6 pt-0 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => deactivate.mutate()}
            disabled={!target || deactivate.isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-all text-sm disabled:opacity-50"
          >
            <UserX className="h-4 w-4" />
            {deactivate.isPending ? "Deactivating…" : "Deactivate"}
          </button>
        </div>
      </div>
    </div>
  );
}
