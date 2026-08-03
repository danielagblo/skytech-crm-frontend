import { ArrowUpRight, PhoneCall } from "lucide-react";
import type { CallStats } from "@/types/dashboard.types";
const duration = (seconds: number) =>
  `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${Math.round(seconds % 60)
    .toString()
    .padStart(2, "0")}`;
export const CallStatsCard = ({
  title,
  stats,
}: {
  title: string;
  stats: CallStats;
}) => {
  const rows = [
    ["Number of non responses", stats.nonResponses],
    ["Network interruptions", stats.networkInterruptions],
    ["Customer hung up", stats.customerHungUp],
    ["Average duration", duration(stats.avgDuration)],
  ];
  return (
    <section className="surface p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowUpRight className="h-4 w-4 text-info" />
          <h3 className="font-semibold">{title}</h3>
        </div>
        <span className="text-2xl font-semibold">{stats.total}</span>
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-[140px_1fr]">
        <div className="relative mx-auto flex h-28 w-36 items-end justify-center overflow-hidden">
          <div className="absolute top-0 h-32 w-32 rounded-full border-[14px] border-gray-100 border-r-primary border-t-primary rotate-45" />
          <div className="relative mb-2 text-center">
            <p className="text-2xl font-semibold">
              {stats.successRate.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">Successful call</p>
          </div>
        </div>
        <div className="space-y-2.5">
          {rows.map(([label, value]) => (
            <div
              key={String(label)}
              className="flex items-center gap-3 text-xs"
            >
              <span className="text-muted-foreground">{label}</span>
              <span className="h-px flex-1 bg-gray-100" />
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700">
        <PhoneCall className="h-4 w-4" />
        Live call-log statistics
      </div>
    </section>
  );
};
