"use client";
import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { useDashboard, useTopDeals } from "@/hooks/useDashboard";
import { useAuthStore } from "@/store/authStore";
import { PageHeader } from "@/components/shared/PageHeader";
import { CallStatsCard } from "./CallStatsCard";
import { ExecutivePerformanceTable } from "./ExecutivePerformanceTable";
import { AgentRankCard } from "./AgentRankCard";
import { RevenueChart } from "./RevenueChart";
import { TopDealsChart } from "./TopDealsChart";
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
    <div className="space-y-6">
      <PageHeader
        title={periodLabel}
        description="Your sales operation at a glance"
      />
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white/70 p-4 shadow-sm backdrop-blur">
        <div>
          <p className="eyebrow">Timeframe</p>
          <p className="text-sm text-muted-foreground">
            Filter dashboard metrics by recent activity.
          </p>
        </div>
        <Select value={period} onValueChange={(value: DashboardPeriod) => setPeriod(value)}>
          <SelectTrigger className="w-48">
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
      <div className="grid gap-4 xl:grid-cols-2">
        <CallStatsCard title="Outgoing calls" stats={data.outgoingCalls} />
        <CallStatsCard title="Incoming calls" stats={data.incomingCalls} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <ExecutivePerformanceTable rows={data.executivePerformance} />
        <AgentRankCard user={user} rank={data.agentRank} />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <RevenueChart data={data.topRevenuePerAgent} />
        <TopDealsChart
          sixMonths={sixMonths.data?.content ?? []}
          year={year.data?.content ?? []}
          gated={sixMonths.isError || year.isError}
        />
      </div>
      <FollowUpReminders rows={data.followUpReminders} />
      {can("view:settings") && <ActivityLog />}
    </div>
  );
};
