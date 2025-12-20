"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  UsersIcon,
  UserIcon,
  DevicePhoneMobileIcon,
  BellIcon,
  ChartBarIcon,
  HomeIcon,
  Bars3Icon,
  XMarkIcon,
  LogoutIcon,
} from "@heroicons/react/24/outline";

/**
 * School Admin Layout with Sidebar
 */
export default function SchoolAdminLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/school-admin/dashboard", icon: HomeIcon },
    { label: "Students", href: "/school-admin/students", icon: UsersIcon },
    { label: "Counselors", href: "/school-admin/counselors", icon: UserIcon },
    {
      label: "Wearables",
      href: "/school-admin/wearables",
      icon: DevicePhoneMobileIcon,
    },
    { label: "Alerts", href: "/school-admin/alerts", icon: BellIcon },
    { label: "Reports", href: "/school-admin/reports", icon: ChartBarIcon },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:border-r md:border-gray-200 dark:md:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold">LimaHealth Admin</h1>
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

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-50 md:hidden ${
          sidebarOpen ? "" : "hidden"
        }`}
      >
        <div
          className="absolute inset-0 bg-black opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
        <aside className="absolute left-0 top-0 w-64 h-full bg-white dark:bg-gray-800 shadow-lg p-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold">LimaHealth Admin</h1>
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

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between h-16 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-muted-foreground">
              School Admin
            </span>
            <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-1">
              <LogoutIcon className="h-5 w-5" />
              Logout
            </button>
          </div>
        </header>

        {/* Page content */}
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
