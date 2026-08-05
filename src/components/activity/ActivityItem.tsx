import {
  Activity as ActivityIcon,
  MessageSquare,
  PhoneCall,
  Target,
  UserPlus,
} from "lucide-react";
import type { Activity, ActivityType } from "@/types/activity.types";
import { formatRelative } from "@/lib/utils";
const humanizeActivityType = (type: ActivityType) =>
  type
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/(^|\s)([a-z])/g, (_, prefix, letter: string) =>
      `${prefix}${letter.toUpperCase()}`,
    );
const ActivityGlyph = ({ type }: { type: ActivityType }) => {
  const className = "h-4 w-4 text-green-700";
  if (type.includes("COMMENT")) return <MessageSquare className={className} />;
  if (type.includes("TASK") || type === "SUBTASK_CREATED")
    return <Target className={className} />;
  if (type === "LEAD_LOG_CALL") return <PhoneCall className={className} />;
  if (type.includes("LEAD")) return <UserPlus className={className} />;
  return <ActivityIcon className={className} />;
};
export const ActivityItem = ({ activity }: { activity: Activity }) => (
  <div className="flex min-w-72 items-center gap-3 rounded-xl border bg-white p-3">
    <span className="rounded-full bg-green-50 p-2">
      <ActivityGlyph type={activity.eventType} />
    </span>
    <div className="min-w-0">
      <p className="truncate text-sm font-medium">
        {activity.description.trim() || humanizeActivityType(activity.eventType)}
      </p>
      <p className="truncate text-xs text-muted-foreground">
        {humanizeActivityType(activity.eventType)}
      </p>
      <p className="mt-1 text-[10px] text-gray-400">
        {formatRelative(activity.createdAt)}
      </p>
    </div>
  </div>
);
