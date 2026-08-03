import { Clock3, Target, TrendingUp } from "lucide-react";
import type { DashboardOverview } from "@/types/dashboard.types";
import type { User } from "@/types/user.types";
import { formatCurrency } from "@/lib/utils";
import { UserAvatar } from "@/components/shared/UserAvatar";
export const AgentRankCard = ({
  user,
  rank,
}: {
  user: User | null;
  rank: DashboardOverview["agentRank"];
}) => {
  const name = user ? `${user.firstName} ${user.lastName}` : "Current user";
  const items = [
    { icon: Clock3, label: "Screen time", value: `${rank.screenTime} hrs` },
    {
      icon: Target,
      label: "Target achievement",
      value: `${rank.targetAchievement.toFixed(1)}%`,
    },
    {
      icon: TrendingUp,
      label: "Sales revenue",
      value: formatCurrency(rank.salesRevenue),
    },
  ];
  return (
    <section className="surface p-5">
      <div className="flex items-center gap-3">
        <UserAvatar
          name={name}
          src={user?.profilePhotoUrl ?? undefined}
          className="h-12 w-12"
        />
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-xs text-muted-foreground">
            {user?.role ?? "CRM user"}
          </p>
        </div>
      </div>
      <div className="my-5 rounded-xl bg-green-50 p-4">
        <p className="text-2xl font-semibold">
          {rank.rank}
          {rank.rank === 1
            ? "st"
            : rank.rank === 2
              ? "nd"
              : rank.rank === 3
                ? "rd"
                : "th"}{" "}
          Rank{" "}
          <span className="text-xs font-normal text-muted-foreground">
            out of {rank.totalAgents} people
          </span>
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Based on your performance in the past 30 days.
        </p>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-xl border p-3"
          >
            <item.icon className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="font-semibold">{item.value}</p>
            </div>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
        ))}
      </div>
    </section>
  );
};
