"use client";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
export const DashboardLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const collapsed = useSidebarStore((s) => s.collapsed);
  return (
    <div className="min-h-screen bg-[#fbfcfb]">
      <Sidebar />
      <div
        className={cn(
          "transition-all duration-200",
          collapsed ? "lg:pl-[76px]" : "lg:pl-56",
        )}
      >
        <TopBar />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
};
