"use client";

import { Sun, SunMedium, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const OPTIONS = [
  { value: "bright", label: "Bright", icon: Sun },
  { value: "semi-bright", label: "Semi-bright", icon: SunMedium },
  { value: "dark", label: "Dark", icon: Moon },
];

/**
 * Three-way interface theme switcher.
 *
 * - `compact`: icon-only, for a sidebar footer. `labeled` (default): shows
 *   text too, for a Settings page.
 * - `surface` says what it sits on, since the two portals differ:
 *   - "adaptive" (default): a panel that itself re-themes with dark:/dim:
 *     (e.g. the org-admin sidebar, which is white in bright/semi-bright and
 *     dark-gray in dark theme) — so the toggle's own colors use the same
 *     dark:/dim: variants to track it.
 *   - "onDark": a panel that's permanently dark regardless of theme (e.g.
 *     the super-admin sidebar's fixed navy) — so the toggle uses flat
 *     white/opacity colors that read correctly no matter which theme is
 *     active.
 * - `accentColor` tints the active option — pass the org's brand color (or
 *   the super-admin brand color) so the control fits whichever portal it's in.
 */
export default function ThemeToggle({
  compact = false,
  surface = "adaptive",
  accentColor = "#0CAF87",
  className = "",
}) {
  const { themeName, setTheme } = useTheme();
  const onDark = surface === "onDark";

  const trackClass = onDark
    ? "border-white/10 bg-white/5"
    : "border-gray-100 dark:border-gray-800 dim:border-slate-300/70 bg-gray-50 dark:bg-gray-900 dim:bg-slate-200/60";

  const inactiveClass = onDark
    ? "text-white/50 hover:bg-white/10 hover:text-white"
    : "text-gray-500 hover:bg-white dark:text-gray-400 dark:hover:bg-gray-800 dim:text-slate-600 dim:hover:bg-white";

  return (
    <div
      role="radiogroup"
      aria-label="Interface theme"
      className={`inline-flex items-center gap-1 rounded-2xl border p-1 ${trackClass} ${className}`}
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = themeName === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(value)}
            title={label}
            className={`flex items-center rounded-xl font-bold transition-all ${
              compact ? "h-9 w-9 justify-center" : "h-10 gap-2 px-4 text-xs"
            } ${active ? "text-white shadow-md" : inactiveClass}`}
            style={active ? { backgroundColor: accentColor } : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!compact && <span>{label}</span>}
          </button>
        );
      })}
    </div>
  );
}
