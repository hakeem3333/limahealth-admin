"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  UsersIcon, UserIcon, DevicePhoneMobileIcon,
  BellIcon, ChartBarIcon, HomeIcon,
  Bars3Icon, XMarkIcon, ArrowLeftOnRectangleIcon,
  CloudArrowUpIcon, Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/context/AuthContext";

export default function OrgAdminLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, user, theme, orgName, orgType, membersLabel, supportsLabel } = useAuth();

  const navItems = [
    { label: "Overview",       href: "/org-admin/dashboard",       icon: HomeIcon },
    { label: membersLabel,     href: "/org-admin/members",         icon: UsersIcon },
    { label: supportsLabel,    href: "/org-admin/support-staff",   icon: UserIcon },
    { label: "Wearables",      href: "/org-admin/wearables",       icon: DevicePhoneMobileIcon },
    { label: "Bulk Enroll",    href: "/org-admin/bulk-enrollment", icon: CloudArrowUpIcon },
    { label: "Alerts",         href: "/org-admin/alerts",          icon: BellIcon },
    { label: "Analytics",      href: "/org-admin/reports",         icon: ChartBarIcon },
    { label: "Settings",       href: "/org-admin/settings",        icon: Cog6ToothIcon },
  ];

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "A";

  // Tailwind can't resolve dynamic class names — use static inline style overrides via `style` prop
  // These Tailwind classes use hardcoded palette values from the LimaHealth design system
  const colorMap = {
    // SCHOOL  → Teal  #0CAF87  (brand primary — health & trust)
    SCHOOL:   { active: "bg-[#0CAF87] text-white shadow-teal-100",   dot: "bg-[#0CAF87]",  badge: "bg-[#EBF9F5] text-[#0F6E56] border-[#9FE1CB]", avatar: "from-[#0CAF87] to-[#0F6E56]", glow: "shadow-teal-100"  },
    // COMPANY → Purple #6C5CE7  (professional energy)
    COMPANY:  { active: "bg-[#6C5CE7] text-white shadow-violet-100", dot: "bg-[#6C5CE7]",  badge: "bg-[#E9E6FE] text-[#534AB7] border-[#AFA9EC]", avatar: "from-[#6C5CE7] to-[#534AB7]", glow: "shadow-violet-100"},
    // HOSPITAL→ Navy  #0D3B7A  (clinical authority)
    HOSPITAL: { active: "bg-[#0D3B7A] text-white shadow-blue-100",   dot: "bg-[#0D3B7A]",  badge: "bg-[#E8EEF8] text-[#0C447C] border-[#85B7EB]", avatar: "from-[#0D3B7A] to-[#0C447C]", glow: "shadow-blue-100"  },
    // NGO     → Amber #F9A825  (warm community)
    NGO:      { active: "bg-[#F9A825] text-white shadow-amber-100",  dot: "bg-[#F9A825]",  badge: "bg-[#FEF3CD] text-[#B45309] border-[#FAC775]", avatar: "from-[#F9A825] to-[#B45309]", glow: "shadow-amber-100" },
  };
  const c = colorMap[orgType] ?? colorMap.SCHOOL;

  const Sidebar = ({ mobile = false }) => (
    <aside className={`flex flex-col ${mobile ? "w-full h-full" : "w-72"} bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800`}>
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 h-20 border-b border-gray-50 dark:border-gray-800">
        <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${c.avatar} flex items-center justify-center shadow-lg ${c.glow}`}>
          <span className="text-white font-black text-sm">{theme.icon}</span>
        </div>
        <div>
          <h1 className="text-base font-black tracking-tight text-gray-900 dark:text-white">
            Lima<span style={{ color: theme.primary }}>Health</span>
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{theme.orgLabel} Portal</p>
        </div>
      </div>

      {/* Org badge */}
      <div className="mx-4 mt-4 mb-2 px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Organisation</p>
        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{orgName}</p>
        <span className={`inline-flex items-center gap-1 mt-1.5 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${c.badge}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
          {theme.orgLabel}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Management</p>
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => mobile && setSidebarOpen(false)}
              className={`group flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-150 ${
                active
                  ? `${c.active} shadow-lg`
                  : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 hover:text-gray-900"
              }`}
            >
              <item.icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${active ? "text-white" : "text-gray-400 group-hover:text-current"}`} />
              <span className="tracking-tight">{item.label}</span>
              {active && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white/70 animate-pulse" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-50 dark:border-gray-800">
        <button
          onClick={logout}
          className="flex items-center w-full gap-3 px-4 py-3 rounded-2xl hover:bg-red-50 text-gray-500 hover:text-red-600 transition-all group"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5 opacity-50 group-hover:opacity-100" />
          <span className="text-sm font-bold">Sign Out</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 font-sans">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0 shadow-sm">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      <div className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className={`absolute left-0 top-0 w-80 h-full shadow-2xl transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <Sidebar mobile />
        </div>
      </div>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between h-20 px-6 md:px-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 z-10">
          <button className="md:hidden p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition" onClick={() => setSidebarOpen(true)}>
            <Bars3Icon className="h-5 w-5" />
          </button>

          <div className="hidden md:flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${c.dot} animate-pulse`} />
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">System Operational</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-gray-900 dark:text-white leading-tight">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.primary }}>
                {theme.orgLabel} Administrator
              </p>
            </div>
            <div className={`h-10 w-10 rounded-2xl bg-gradient-to-br ${c.avatar} shadow-lg ${c.glow} flex items-center justify-center text-white font-black text-sm`}>
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
