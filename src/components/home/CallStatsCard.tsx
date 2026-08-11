import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import type { CallStats } from "@/types/dashboard.types";
const duration = (seconds: number) =>
  `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${Math.round(seconds % 60)
    .toString()
    .padStart(2, "0")}`;
const Gauge = ({ pct }: { pct: number }) => {
  const clamped = Math.max(0, Math.min(100, pct));
  const radius = 44;
  const circumference = Math.PI * radius;
  const fill = (clamped / 100) * circumference;
  const arc = "M 16 58 A 44 44 0 0 1 104 58";
  return (
    <svg
      viewBox="0 0 120 64"
      className="h-28 w-full sm:h-32"
      aria-hidden="true"
    >
      <path
        d={arc}
        fill="none"
        stroke="hsl(var(--muted))"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d={arc}
        fill="none"
        stroke="#8BC34A"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${fill} ${circumference}`}
      />
      <text
        x="60"
        y="48"
        textAnchor="middle"
        fontSize="16"
        fontWeight="700"
        className="fill-foreground"
      >
        {Math.round(clamped)}%
      </text>
      <text
        x="60"
        y="62"
        textAnchor="middle"
        fontSize="8"
        className="fill-muted-foreground"
      >
        Successful call
      </text>
    </svg>
  );
};
export const CallStatsCard = ({
  title,
  stats,
}: {
  title: string;
  stats: CallStats;
}) => {
  const directionClass =
    title === "Incoming calls" ? "text-green-600" : "text-green-600";
  const rows = [
    ["Number of non responses", stats.nonResponses],
    ["Network interruptions", stats.networkInterruptions],
    ["Customer hung up", stats.customerHungUp],
    ["Conversation duration", duration(stats.avgDuration)],
  ];
  const Icon = title === "Incoming calls" ? ArrowDownLeft : ArrowUpRight;
  return (
    <section className="py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${directionClass}`} />
          <h3 className="text-base font-medium text-foreground">{title}</h3>
        </div>
        <span className="text-2xl font-light tabular-nums text-gray-900 sm:text-3xl">
          {stats.total}
        </span>
      </div>
      <div className="grid items-center gap-2 sm:grid-cols-[minmax(190px,.85fr)_minmax(270px,1.15fr)]">
        {/* Gauge */}
        <div className="flex w-full items-center justify-center">
          <Gauge pct={stats.successRate} />
        </div>

        {/* Stats */}
        <div className="w-full space-y-1.5">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="flex items-center gap-3 text-muted-foreground"
            >
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className="h-px flex-1 bg-border" />
              <span className="shrink-0 font-semibold tabular-nums text-foreground">
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
