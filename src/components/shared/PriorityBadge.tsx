import { Flag } from "lucide-react";
import type { Priority } from "@/types/api.types";
import { cn } from "@/lib/utils";
const styles: Record<Priority, string> = {
  LOW: "bg-green-50 text-green-700",
  MEDIUM: "bg-amber-50 text-amber-700",
  HIGH: "bg-red-50 text-red-700",
};
export const PriorityBadge = ({
  priority,
  className,
}: {
  priority: Priority;
  className?: string;
}) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium",
      styles[priority],
      className,
    )}
  >
    <Flag className="h-3 w-3 fill-current" />
    {priority[0] + priority.slice(1).toLowerCase()}
  </span>
);
