"use client";
import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { useDashboard, useTopDeals } from "@/hooks/useDashboard";
import { useAuthStore } from "@/store/authStore";
import { CallStatsCard } from "./CallStatsCard";
import { ExecutivePerformanceTable } from "./ExecutivePerformanceTable";
import { AgentRankCard } from "./AgentRankCard";
import { RevenueChart } from "./RevenueChart";
import { TopDealsChart } from "./TopDealsChart";
import { UpcomingActivity } from "./UpcomingActivity";
import { FollowUpReminders } from "./FollowUpReminders";
import { ActivityLog } from "@/components/activity/ActivityLog";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermission } from "@/hooks/usePermission";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DashboardPeriod } from "@/types/dashboard.types";
import { DASHBOARD_PERIODS } from "@/lib/crm-options";
export const HomeDashboard = () => {
  const [period, setPeriod] = useState<DashboardPeriod>("today");
  const periodLabel =
    DASHBOARD_PERIODS.find((option) => option.value === period)?.label ??
    "Today";
  const overview = useDashboard(period);
  const sixMonths = useTopDeals("last_6_months");
  const year = useTopDeals("last_year");
  const user = useAuthStore((state) => state.user);
  const { can } = usePermission();
  if (overview.isLoading)
    return (
      <div className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  if (overview.isError || !overview.data)
    return (
      <EmptyState
        icon={AlertCircle}
        title="Dashboard could not be loaded"
        message="Check your connection and refresh this page. Your CRM records are not affected."
      />
    );
  const data = overview.data;
  return (
    <div className="min-w-0 space-y-4 overflow-hidden">
      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(520px,1.05fr)] min-[2200px]:grid-cols-[minmax(0,1fr)_minmax(720px,1fr)]">
        <div className="min-w-0 space-y-4">
          <section className="overflow-hidden border bg-card">
            <div className="flex h-9 items-center justify-between bg-muted px-5">
              <span className="text-sm font-medium">{periodLabel}</span>
              <Select
                value={period}
                onValueChange={(value: DashboardPeriod) => setPeriod(value)}
              >
                <SelectTrigger className="h-7 w-40 border-0 bg-transparent px-2 shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DASHBOARD_PERIODS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="divide-y px-5">
              <CallStatsCard
                title="Outgoing calls"
                stats={data.outgoingCalls}
              />
              <CallStatsCard
                title="Incoming calls"
                stats={data.incomingCalls}
              />
            </div>
          </section>
          {can("view:executive-performance") && (
            <ExecutivePerformanceTable rows={data.executivePerformance} />
          )}
        </div>
        <div className="min-w-0 space-y-4">
          <UpcomingActivity followUps={data.followUpReminders} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <AgentRankCard user={user} rank={data.agentRank} />
        <FollowUpReminders rows={data.followUpReminders} />
        <RevenueChart data={data.topRevenuePerAgent} />
        <TopDealsChart
          sixMonths={sixMonths.data?.content ?? []}
          year={year.data?.content ?? []}
          gated={sixMonths.isError || year.isError}
        />
      </div>
      {can("view:settings") && <ActivityLog />}
    </div>
  );
};
