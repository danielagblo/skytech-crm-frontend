"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ChevronLeft,
  Home,
  KanbanSquare,
  LogOut,
  Menu,
  Settings,
  Target,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebarStore";
import { useAuthStore } from "@/store/authStore";
import { useLogout } from "@/hooks/useAuth";
import { usePermission, type Permission } from "@/hooks/usePermission";

const nav: {
  href: string;
  label: string;
  icon: typeof Home;
  permission?: Permission;
}[] = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/pipeline", label: "Pipeline", icon: KanbanSquare },
  { href: "/tasks", label: "Task Bar", icon: Target },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    permission: "view:settings",
  },
];

export const Sidebar = () => {
  const path = usePathname();
  const { collapsed, mobileOpen, toggle, setMobileOpen } = useSidebarStore();
  const user = useAuthStore((state) => state.user);
  const { logout, isPending } = useLogout();
  const { can } = usePermission();
  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-lg border bg-white p-2 shadow lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>
      {mobileOpen && (
        <button
          className="fixed inset-0 z-40 bg-black/25 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation overlay"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-sidebar transition-all duration-200",
          collapsed ? "w-[76px]" : "w-56",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-20 items-center gap-3 border-b px-4">
          <img
            src="/assets/skytech_Logo.png"
            alt="Skytech"
            className="h-10 w-10 rounded-xl object-contain"
          />
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-semibold">Systems Aisle</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Skytech CRM
              </p>
            </div>
          )}
          <button
            className="ml-auto hidden rounded-md p-1 hover:bg-muted lg:block"
            onClick={toggle}
            aria-label="Collapse sidebar"
          >
            <ChevronLeft
              className={cn("h-4 w-4 transition", collapsed && "rotate-180")}
            />
          </button>
          <button
            className="ml-auto lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav
            .filter((item) => !item.permission || can(item.permission))
            .map((item) => {
              const active =
                path === item.href || path.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "relative flex h-11 items-center gap-3 rounded-lg px-3 text-sm text-gray-500 transition hover:bg-white hover:text-gray-900",
                    active &&
                      "bg-white font-medium text-green-700 shadow-sm before:absolute before:-left-3 before:h-7 before:w-1 before:rounded-r before:bg-primary",
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && item.label}
                </Link>
              );
            })}
        </nav>
        <div className="border-t p-3">
          <button
            onClick={logout}
            disabled={isPending}
            className="mb-3 flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-gray-500 hover:bg-white disabled:opacity-50"
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && (isPending ? "Signing out…" : "Logout")}
          </button>
          {!collapsed && (
            <div className="rounded-xl bg-white p-3">
              <p className="truncate text-sm font-semibold">
                {user
                  ? `${user.firstName} ${user.lastName}`
                  : "Loading profile…"}
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.role ?? "—"}
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
