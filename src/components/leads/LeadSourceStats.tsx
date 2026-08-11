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
  <div className="surface grid grid-cols-3 content-center gap-2 p-3 sm:grid-cols-6 xl:grid-cols-3 min-[2200px]:grid-cols-6">
    <p className="eyebrow col-span-full">Lead source</p>
    {Object.entries(labels).map(([source, label]) => {
      const count = breakdown[source as LeadSource] ?? 0;
      const percentage = total > 0 ? Math.round((count * 100) / total) : 0;
      return (
        <span
          key={source}
          className="rounded-md border bg-card px-2.5 py-2 text-xs"
        >
          <strong>{label}</strong>{" "}
          <span className="text-green-700">{percentage}%</span>
        </span>
      );
    })}
  </div>
);
