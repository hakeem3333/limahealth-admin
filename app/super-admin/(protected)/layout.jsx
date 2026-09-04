"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BuildingStorefrontIcon,
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  HomeIcon,
  Bars3Icon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { playfairDisplay } from "@/lib/fonts";
import { api } from "@/lib/axios";

const navItems = [
  { label: "Control Center", href: "/super-admin/dashboard", icon: HomeIcon },
  { label: "Organisations", href: "/super-admin/organisations", icon: BuildingStorefrontIcon },
  { label: "Global Admins", href: "/super-admin/admins", icon: UserGroupIcon },
  { label: "Platform Analytics", href: "/super-admin/reports", icon: ChartBarIcon },
  { label: "Core Infrastructure", href: "/super-admin/settings", icon: Cog6ToothIcon },
];

export default function SuperAdminLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeItem = navItems.find((item) => pathname.startsWith(item.href));

  const handleLogout = async () => {
    try {
      await api.post("/super-admin/logout");
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      window.location.href = "/super-admin/login";
    }
  };

  return (
    <div className={`${playfairDisplay.variable} flex h-screen lh-page-wash font-sans selection:bg-lh-teal-light selection:text-lh-teal`}>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-72 bg-lh-navy text-white shadow-2xl z-20">
        <div className="flex items-center px-8 h-20 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-lh-accent rounded-xl flex items-center justify-center shadow-lg shadow-lh-accent/30">
              <ShieldCheckIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold tracking-tight leading-none">
                Lima<span className="text-lh-accent">HQ</span>
              </h1>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mt-1">
                Super Admin
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-8 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">
            System Authority
          </p>
          {navItems.map((item) => (
            <SidebarLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              active={pathname.startsWith(item.href)}
            >
              {item.label}
            </SidebarLink>
          ))}
        </nav>

        <div className="p-5 mx-4 mb-4 bg-black/20 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
              Core Engine Online
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-red-500/10 text-white/70 hover:text-red-300 transition-all group border border-white/5"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 opacity-50 group-hover:opacity-100" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Terminate Session
            </span>
          </button>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between h-20 px-8 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center gap-6 flex-1">
            <button
              className="md:hidden p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-lh-teal-light hover:text-lh-teal transition"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            <h2 className="font-display hidden lg:block text-xl font-bold text-lh-navy">
              {activeItem?.label ?? "LimaHQ"}
            </h2>

            {/* Global Command Search */}
            <div className="hidden md:flex relative max-w-sm w-full ml-auto lg:ml-6">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search organisations, IDs, or logs..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-lh-teal/30 text-sm font-medium transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pl-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">Platform Director</p>
              <p className="text-[10px] font-bold text-lh-teal uppercase tracking-widest">
                Global Auth Level 4
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-lh-navy shadow-md flex items-center justify-center text-white font-bold text-sm border-2 border-white">
              HQ
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6 lg:p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Mobile Sidebar (Portalled) */}
      <div
        className={`fixed inset-0 z-[60] transition-all duration-300 md:hidden ${
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
        <aside
          className={`absolute left-0 top-0 w-72 h-full bg-lh-navy text-white shadow-2xl p-6 transition-transform duration-300 transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="space-y-1 mt-4">
            {navItems.map((item) => (
              <SidebarLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                active={pathname.startsWith(item.href)}
                onClick={() => setSidebarOpen(false)}
              >
                {item.label}
              </SidebarLink>
            ))}
          </nav>
        </aside>
      </div>
    </div>
  );
}

function SidebarLink({ href, icon: Icon, children, active, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group flex items-center gap-4 px-4 py-3.5 rounded-r-lg border-l-4 text-sm font-semibold transition-all duration-200 ${
        active
          ? "border-lh-accent bg-white/10 text-white"
          : "border-transparent text-white/50 hover:bg-white/5 hover:text-white"
      }`}
    >
      <Icon
        className={`h-5 w-5 transition-transform group-hover:scale-110 ${active ? "text-lh-accent" : "text-white/30 group-hover:text-lh-accent"}`}
      />
      <span className="tracking-tight">{children}</span>
    </Link>
  );
}
