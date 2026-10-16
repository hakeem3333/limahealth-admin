const STYLES = {
  ACTIVE: "bg-emerald-600/15 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  PENDING_ACTIVATION: "bg-lh-accent/20 text-[#8a5525] dark:text-lh-accent",
  PENDING_EMAIL_VERIFICATION: "bg-lh-accent/20 text-[#8a5525] dark:text-lh-accent",
  PAYMENT_REQUIRED: "bg-purple-600/15 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
  SUSPENDED: "bg-red-600/15 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  EXPIRED: "bg-orange-600/15 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
  INACTIVE: "bg-gray-400/20 text-gray-600 dark:text-gray-400",
};

export default function Badge({ status, className = "" }) {
  const style = STYLES[status] ?? "bg-gray-200 text-gray-600 dark:bg-gray-700/50 dark:text-gray-300";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${style} ${className}`}
    >
      {status ? status.replace(/_/g, " ") : "Unknown"}
    </span>
  );
}
