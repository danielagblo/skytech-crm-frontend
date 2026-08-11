"use client";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";
import type { DashboardPeriod } from "@/types/dashboard.types";
import {
  demoDashboard,
  demoPage,
  demoResponse,
  isDemoSession,
} from "@/lib/demo-data";

export const useDashboard = (period: DashboardPeriod = "today") =>
  useQuery({
    queryKey: ["dashboard", "overview", period],
    queryFn: () =>
      isDemoSession()
        ? demoResponse(demoDashboard)
        : dashboardService.getOverview(period),
    select: (response) => response.data.data,
  });
export const useTopDeals = (period: "last_6_months" | "last_year") =>
  useQuery({
    queryKey: ["dashboard", "top-deals", period],
    queryFn: () =>
      isDemoSession()
        ? demoResponse(demoPage([]))
        : dashboardService.getTopDeals(period),
    select: (response) => response.data.data,
    retry: false,
  });
export const useAgentStats = (userId: string) =>
  useQuery({
    queryKey: ["dashboard", "agent", userId],
    queryFn: () => dashboardService.getAgentStats(userId),
    select: (response) => response.data.data,
    enabled: Boolean(userId),
  });
