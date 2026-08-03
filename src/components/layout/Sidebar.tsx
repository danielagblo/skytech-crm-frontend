"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLogout } from "@/hooks/useAuth";
import { usePermission, type Permission } from "@/hooks/usePermission";

const nav: Array<{
  href: string;
  label: string;
  icon: string;
  permission?: Permission;
}> = [
  { href: "/home", label: "Home", icon: "/assets/navIcons/home_Icon.svg" },
  {
    href: "/pipeline",
    label: "Pipeline",
    icon: "/assets/navIcons/pipeline_Icon.svg",
  },
  { href: "/tasks", label: "Task Bar", icon: "/assets/notes_Icon.svg" },
  { href: "/leads", label: "Leads", icon: "/assets/navIcons/leads_Icon.svg" },
  {
    href: "/calendar",
    label: "Calendar",
    icon: "/assets/navIcons/calendar_Icon.svg",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: "/assets/navIcons/settings_Icon.svg",
    permission: "view:settings",
  },
];

export const Sidebar = () => {
  const path = usePathname();
  const { logout, isPending } = useLogout();
  const { can } = usePermission();
  const available = nav.filter(
    (item) => !item.permission || can(item.permission),
  );
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-28 flex-col border-r bg-card lg:flex">
        <div className="flex h-[90px] items-center justify-center border-b">
          <img
            src="/assets/skytech_Logo.png"
            alt="Skytech"
            className="h-12 w-12 rounded-xl object-contain"
          />
        </div>
        <nav className="flex-1 pt-5">
          {available.map((item) => {
            const active =
              path === item.href || path.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex h-[74px] flex-col items-center justify-center gap-1.5 text-[10px] text-muted-foreground transition-colors hover:bg-primary/15 hover:text-foreground",
                  active && "bg-primary/65 text-foreground",
                )}
              >
                <img
                  src={item.icon}
                  alt=""
                  className="nav-asset h-6 w-6 object-contain"
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <button
          onClick={logout}
          disabled={isPending}
          className="flex h-[88px] flex-col items-center justify-center gap-1.5 border-t text-[10px] text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          <img
            src="/assets/navIcons/logout_Icon.svg"
            alt=""
            className="nav-asset h-7 w-7"
          />
          <span>{isPending ? "Signing out…" : "Logout"}</span>
        </button>
      </aside>
      <nav
        className="fixed inset-x-0 bottom-0 z-50 grid h-[70px] border-t bg-card/95 shadow-[0_-8px_30px_rgba(15,23,42,.08)] backdrop-blur lg:hidden"
        style={{
          gridTemplateColumns: `repeat(${available.length}, minmax(0, 1fr))`,
        }}
      >
        {available.map((item) => {
          const active = path === item.href || path.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 text-[9px] text-muted-foreground",
                active &&
                  "text-foreground after:absolute after:inset-x-3 after:top-0 after:h-1 after:rounded-b-full after:bg-primary",
              )}
            >
              <img src={item.icon} alt="" className="nav-asset h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};
