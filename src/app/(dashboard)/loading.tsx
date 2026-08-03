import { Skeleton } from "@/components/ui/skeleton";
export default function DashboardLoading() {
  return (
    <div className="space-y-5" aria-label="Loading dashboard">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-28 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-[520px] rounded-2xl" />
    </div>
  );
}
