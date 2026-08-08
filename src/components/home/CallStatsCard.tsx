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
  const arc =
    "M 16 58 A 44 44 0 0 1 104 58";
  return (
    <svg
      viewBox="0 0 120 64"
      className="h-38 -mt-7 w-full"
      aria-hidden="true"
    >
      <path
        d={arc}
        fill="none"
        stroke="#E0E0E0"
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
        fill="#212121"
      >
        {Math.round(clamped)}%
      </text>
      <text x="60" y="62" textAnchor="middle" fontSize="8" fill="#9E9E9E">
        Successful Calls
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
  const directionClass = title === "Incoming calls" ? "text-green-600" : "text-green-600";
  const rows = [
    ["Number of non responses", stats.nonResponses],
    ["Network interruptions", stats.networkInterruptions],
    ["Customer hung up", stats.customerHungUp],
    ["Conversation duration", duration(stats.avgDuration)],
  ];
  const Icon = title === "Incoming calls" ? ArrowDownLeft : ArrowUpRight;
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${directionClass}`} />
          <h3 className="font-medium text-gray-800">{title}</h3>
        </div>
        <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
      </div>
      <div className="flex flex-col gap-6 md:grid md:grid-cols-2 items-center md:gap-0">
  {/* Gauge */}
  <div className="flex w-full items-center justify-center md:w-auto">
    <Gauge pct={stats.successRate} />
  </div>

  {/* Stats */}
  <div className="w-full space-y-3 md:w-auto">
    {rows.map(([label, value]) => (
      <div
        key={label}
        className="flex items-center justify-between gap-4"
      >
        <span className="text-sm">{label}</span>
        <span className="shrink-0 font-medium">{value}</span>
      </div>
    ))}
  </div>
</div>
    </section>
  );
};
