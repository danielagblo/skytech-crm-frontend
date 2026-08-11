import type { LeadSource } from "@/types/api.types";
const labels: Record<LeadSource, string> = {
  SMS: "SMS",
  EMAIL: "Email",
  FACEBOOK: "Facebook",
  GOOGLE: "Google",
  BANNER: "Banner",
  META_ADS: "Meta Ads",
};
export const LeadSourceStats = ({
  breakdown,
  total,
}: {
  breakdown: Partial<Record<LeadSource, number>>;
  total: number;
}) => (
  <div className="grid grid-cols-3 content-center border-l px-3 py-2 sm:grid-cols-6 xl:grid-cols-3 min-[2200px]:grid-cols-6">
    <p className="col-span-full mb-1 text-[10px] text-muted-foreground">
      Lead source
    </p>
    {Object.entries(labels).map(([source, label]) => {
      const count = breakdown[source as LeadSource] ?? 0;
      const percentage = total > 0 ? Math.round((count * 100) / total) : 0;
      return (
        <span key={source} className="px-2 py-1 text-xs">
          <strong className="block font-medium">{label}</strong>
          <span className="font-semibold">{count}</span>{" "}
          <span className="text-[10px] text-green-700">↑ {percentage}%</span>
        </span>
      );
    })}
  </div>
);
