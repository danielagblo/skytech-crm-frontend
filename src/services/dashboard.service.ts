import api from "@/lib/axios";
import type { ApiResponse, PaginatedResponse } from "@/types/api.types";
import type {
  AgentStats,
  DashboardOverview,
  DashboardPeriod,
} from "@/types/dashboard.types";
import type { TopDeal } from "@/types/deal.types";

export const dashboardService = {
  getOverview: (period: DashboardPeriod = "today") =>
    api.get<ApiResponse<DashboardOverview>>("/dashboard/overview", {
      params: { period },
    }),
  getTopDeals: (period: "last_6_months" | "last_year", page = 0, size = 20) =>
    api.get<PaginatedResponse<TopDeal>>("/dashboard/top-deals", {
      params: { period, page, size },
    }),
  getAgentStats: (userId: string) =>
    api.get<ApiResponse<AgentStats>>(`/dashboard/agent-stats/${userId}`),
};
