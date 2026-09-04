const VARIANTS = {
  primary: "bg-lh-navy text-white hover:bg-lh-teal",
  accent: "bg-lh-accent text-white hover:bg-lh-accent/90",
  outline: "border border-gray-200 bg-white text-gray-700 hover:border-lh-teal hover:text-lh-teal",
  ghost: "bg-transparent text-gray-700 hover:bg-lh-teal-light",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const SIZES = {
  md: "h-11 px-5 text-sm",
  sm: "h-9 px-4 text-xs",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant] ?? VARIANTS.primary} ${SIZES[size] ?? SIZES.md} ${className}`}
      {...props}
    />
  );
}
