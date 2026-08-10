export type TargetMetric = "CALLS" | "DEALS_CLOSED" | "REVENUE";

export interface TargetSetting {
  metric: TargetMetric;
  target: number;
  enabled: boolean;
}

export interface DepartmentTargetsResponse {
  period: string;
  targets: TargetSetting[];
}

export interface MetricAchievement {
  metric: TargetMetric;
  target: number;
  actual: number;
  achievementPct: number;
}

export interface AgentAchievement {
  userId: string;
  name: string;
  overallPct: number;
  metrics: MetricAchievement[];
}

export interface DepartmentAchievementResponse {
  period: string;
  overallPct: number;
  metrics: MetricAchievement[];
  agents: AgentAchievement[];
}

export interface SaveDepartmentTargetsRequest {
  period: string;
  targets: TargetSetting[];
}