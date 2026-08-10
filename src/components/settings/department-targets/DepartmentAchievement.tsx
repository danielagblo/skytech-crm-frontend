"use client";
import { AlertCircle } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDepartmentAchievement } from "@/hooks/useDepartmentTargets";
import {
  TARGET_METRIC_LABELS,
  formatMetricValue,
  formatPercent,
} from "@/lib/department-target";

export const DepartmentAchievement = ({ period }: { period: string }) => {
  const { data, isLoading, isError } = useDepartmentAchievement(period);

  if (isLoading) return <Skeleton className="h-96" />;

  const metrics = data?.metrics ?? [];
  const agents = data?.agents ?? [];
  const overall = data?.overallPct ?? 0;

  return (
    <section className="surface overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b p-5">
        <div>
          <h2 className="font-semibold">Achievement</h2>
          <p className="text-sm text-muted-foreground">
            Team progress for {period}.
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold">{formatPercent(overall)}</p>
          <p className="text-xs text-muted-foreground">overall</p>
        </div>
      </div>

      {isError ? (
        <EmptyState
          icon={AlertCircle}
          title="Achievement could not be loaded"
          message="This feature may require the Pro plan, or the server may be temporarily unavailable."
        />
      ) : metrics.length === 0 && agents.length === 0 ? (
        <EmptyState
          title="No targets set yet"
          message="Enable at least one metric and set a target above to start tracking achievement."
        />
      ) : (
        <>
          {metrics.length > 0 && (
            <div className="grid gap-3 border-b p-5 md:grid-cols-3">
              {metrics.map((metric) => {
                const width = Math.min(Math.max(metric.achievementPct, 0), 100);
                return (
                  <div key={metric.metric} className="rounded-xl border p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        {TARGET_METRIC_LABELS[metric.metric]}
                      </p>
                      <p className="text-sm font-semibold">
                        {formatPercent(metric.achievementPct)}
                      </p>
                    </div>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatMetricValue(metric.metric, metric.actual)} of{" "}
                      {formatMetricValue(metric.metric, metric.target)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {agents.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    {metrics.map((metric) => (
                      <TableHead
                        key={metric.metric}
                        className="text-right"
                      >
                        {TARGET_METRIC_LABELS[metric.metric]}
                      </TableHead>
                    ))}
                    <TableHead className="text-right">Overall</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.map((agent) => {
                    const byMetric = new Map(
                      agent.metrics.map((m) => [m.metric, m]),
                    );
                    return (
                      <TableRow key={agent.userId}>
                        <TableCell className="font-semibold">
                          {agent.name}
                        </TableCell>
                        {metrics.map((metric) => {
                          const row = byMetric.get(metric.metric);
                          return (
                            <TableCell
                              key={metric.metric}
                              className="text-right"
                            >
                              {row
                                ? `${formatMetricValue(metric.metric, row.actual)} · ${formatPercent(row.achievementPct)}`
                                : "—"}
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-right font-semibold">
                          {formatPercent(agent.overallPct)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              title="No active agents"
              message={`There are no active agents in this workspace to report on for ${period}.`}
            />
          )}
        </>
      )}
    </section>
  );
};