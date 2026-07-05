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
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export default function SuperAdminLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { label: "Control Center", href: "/super-admin/dashboard", icon: HomeIcon },
    {
      label: "Organisations",
      href: "/super-admin/organisations",
      icon: BuildingStorefrontIcon,
    },
    {
      label: "Global Admins",
      href: "/super-admin/admins",
      icon: UserGroupIcon,
    },
    {
      label: "Platform Analytics",
      href: "/super-admin/reports",
      icon: ChartBarIcon,
    },
    {
      label: "Core Infrastructure",
      href: "/super-admin/settings",
      icon: Cog6ToothIcon,
    },
  ];

  return (
    <div className="flex h-screen bg-[#F5F7FA] dark:bg-gray-950 font-sans selection:bg-teal-100 selection:text-teal-700">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-72 bg-[#0D3B7A] text-white shadow-2xl z-20">
        <div className="flex items-center px-8 h-20 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-[#0CAF87] rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30">
              <ShieldCheckIcon className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-lg font-black tracking-tighter uppercase">
              Lima<span className="text-[#0CAF87]">HQ</span>
            </h1>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">
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

        <div className="p-6 bg-black/20 m-4 rounded-3xl border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/50">
              Core Engine Online
            </span>
          </div>
          <button className="flex items-center w-full gap-3 px-4 py-3 rounded-2xl bg-white/5 hover:bg-red-500/10 text-white/70 hover:text-red-400 transition-all group border border-white/5">
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
        <header className="flex items-center justify-between h-20 px-8 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-10">
          <div className="flex items-center gap-6 flex-1">
            <button
              className="md:hidden p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-teal-50 hover:text-teal-600 transition"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            {/* Global Command Search */}
            <div className="hidden md:flex relative max-w-md w-full">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search organisations, IDs, or global logs..."
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#0D3B7A]/20 text-sm font-medium transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-gray-900 dark:text-white">
                Platform Director
              </p>
              <p className="text-[10px] font-black text-[#0D3B7A] uppercase tracking-widest">
                Global Auth Level 4
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-[#0D3B7A] shadow-xl shadow-[#0D3B7A]/20 flex items-center justify-center text-white font-black text-sm border-2 border-white">
              HQ
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-8 lg:p-12 custom-scrollbar">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Mobile Sidebar (Portalled) */}
      <div
        className={`fixed inset-0 z-[60] transition-all duration-300 md:hidden ${
          sidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
        <aside
          className={`absolute left-0 top-0 w-80 h-full bg-gray-900 shadow-2xl p-6 transition-transform duration-300 transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Mobile nav content similar to desktop but styled for mobile... */}
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
      className={`group flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-bold transition-all duration-200 ${
        active
          ? "bg-[#0CAF87] text-white shadow-lg shadow-teal-900/30"
          : "text-white/50 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon
        className={`h-5 w-5 transition-transform group-hover:scale-110 ${active ? "text-white" : "text-white/30 group-hover:text-[#0CAF87]"}`}
      />
      <span className="tracking-tight">{children}</span>
    </Link>
  );
}
