import type { TargetMetric } from "@/types/department-target.types";

export const TARGET_METRIC_LABELS: Record<TargetMetric, string> = {
  CALLS: "Calls",
  DEALS_CLOSED: "Deals closed",
  REVENUE: "Revenue",
};

export const TARGET_METRIC_DESCRIPTIONS: Record<TargetMetric, string> = {
  CALLS: "Phone calls logged on deals during the month",
  DEALS_CLOSED: "Deals moved to Client Retention during the month",
  REVENUE: "Amount collected from those deals",
};

export const formatMetricValue = (
  metric: TargetMetric,
  value: number,
): string =>
  metric === "REVENUE"
    ? new Intl.NumberFormat("en-GH", {
        style: "currency",
        currency: "GHS",
        maximumFractionDigits: 0,
      }).format(value)
    : String(Math.round(value));

export const formatPercent = (value: number): string =>
  `${Number.isFinite(value) ? value.toFixed(1) : "0.0"}%`;