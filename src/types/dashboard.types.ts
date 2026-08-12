export interface CallStats {
  total: number;
  nonResponses: number;
  networkInterruptions: number;
  customerHungUp: number;
  avgDuration: number;
  successRate: number;
}

export type DashboardPeriod =
  | "today"
  | "this_week"
  | "this_month"
  | "three_months";

export interface DashboardOverview {
  outgoingCalls: CallStats;
  incomingCalls: CallStats;
  topRevenuePerAgent: { userId: string; name: string; revenue: number }[];
  executivePerformance: {
    userId: string;
    name: string;
    closedDeals: number;
    revenue: number;
    conversionRate: number;
    rating: number;
    rank: number;
    score: number;
  }[];
  followUpReminders: {
    dealId: string;
    dealTitle: string;
    followUpAt: string;
    type: string;
  }[];
  recentPayments: {
    dealId: string;
    dealTitle: string;
    amount: number;
    paidAt: string;
  }[];
  agentRank: {
    rank: number;
    totalAgents: number;
    loggedCallSeconds: number;
    activeSessionSeconds: number;
    targetAchievement: number;
    salesRevenue: number;
  };
}

export interface AgentStats {
  userId: string;
  name: string;
  deals: number;
  revenue: number;
  tasksDone: number;
}
