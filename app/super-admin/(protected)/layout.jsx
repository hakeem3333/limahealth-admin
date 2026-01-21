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
} from "@heroicons/react/24/outline";

/**
 * SuperAdmin Layout with Sidebar
 */
export default function SuperAdminLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/super-admin/dashboard", icon: HomeIcon },
    {
      label: "Schools",
      href: "/super-admin/schools",
      icon: BuildingStorefrontIcon,
    },
    { label: "Admins", href: "/super-admin/admins", icon: UserGroupIcon },
    { label: "Reports", href: "/super-admin/reports", icon: ChartBarIcon },
    {
      label: "System Settings",
      href: "/super-admin/settings",
      icon: Cog6ToothIcon,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex md:flex-col md:w-64 border-r bg-white dark:bg-gray-800">
        <div className="flex items-center justify-center h-16 border-b">
          <h1 className="text-xl font-bold">LimaHealth SuperAdmin</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
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
      </aside>

      {/* Sidebar (Mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 w-64 h-full bg-white dark:bg-gray-800 p-4 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-bold">LimaHealth</h1>
              <button onClick={() => setSidebarOpen(false)}>
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <nav className="space-y-2">
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
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-4 bg-white dark:bg-gray-800 border-b">
          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground">
              SuperAdmin
            </span>
            <button className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}

/* -----------------------------
   Sidebar Link Component
------------------------------ */

function SidebarLink({ href, icon: Icon, children, active, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition ${
        active
          ? "bg-black text-white dark:bg-gray-700"
          : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
      }`}
    >
      <Icon className="h-5 w-5" />
      {children}
    </Link>
  );
}
