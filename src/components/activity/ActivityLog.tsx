"use client";
import { useActivities } from "@/hooks/useActivities";
import { ActivityItem } from "./ActivityItem";
import { Skeleton } from "@/components/ui/skeleton";
export const ActivityLog = () => {
  const activities = useActivities({ days: 7, page: 0, size: 20 });
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">Recent activity</h3>
        <span className="text-xs text-muted-foreground">Live team feed</span>
      </div>
      <div className="scrollbar-thin flex gap-3 overflow-x-auto pb-2">
        {activities.isLoading ? (
          Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-20 min-w-72" />
          ))
        ) : (activities.data?.content ?? []).length > 0 ? (
          activities.data?.content.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))
        ) : (
          <p className="w-full rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground">
            No recent activity yet.
          </p>
        )}
      </div>
    </section>
  );
};
