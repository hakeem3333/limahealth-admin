const STYLES = {
  ACTIVE: "bg-emerald-600/15 text-emerald-700",
  PENDING_ACTIVATION: "bg-lh-accent/20 text-[#8a5525]",
  PENDING_EMAIL_VERIFICATION: "bg-lh-accent/20 text-[#8a5525]",
  PAYMENT_REQUIRED: "bg-purple-600/15 text-purple-700",
  SUSPENDED: "bg-red-600/15 text-red-700",
  EXPIRED: "bg-orange-600/15 text-orange-700",
  INACTIVE: "bg-gray-400/20 text-gray-600",
};

export default function Badge({ status, className = "" }) {
  const style = STYLES[status] ?? "bg-gray-200 text-gray-600";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${style} ${className}`}
    >
      {status ? status.replace(/_/g, " ") : "Unknown"}
    </span>
  );
}
