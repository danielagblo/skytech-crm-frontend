"use client";

import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export const DashboardLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <div className="min-h-screen bg-background text-foreground">
    <Sidebar />
    <div className="min-h-screen pb-[76px] lg:pl-28 lg:pb-0">
      <TopBar />
      <main className="min-h-[calc(100dvh-4.5rem)] bg-[hsl(var(--workspace))] p-3 sm:p-4 lg:min-h-[calc(100dvh-5.625rem)] lg:p-4 2xl:p-5">
        {children}
      </main>
    </div>
  </div>
);
