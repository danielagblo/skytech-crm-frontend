"use client";
import type { SubTask } from "@/types/task.types";
import { useToggleSubtask } from "@/hooks/useTasks";
import { Checkbox } from "@/components/ui/checkbox";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
export const SubTaskList = ({
  taskId,
  items,
}: {
  taskId: string;
  items: SubTask[];
}) => {
  const update = useToggleSubtask();
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="rounded-xl border p-3">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={item.complete}
              disabled={update.isPending}
              onCheckedChange={(value) =>
                update.mutate({
                  taskId,
                  subtaskId: item.id,
                  data: {
                    title: item.title,
                    description: item.description || undefined,
                    priority: item.priority || undefined,
                    complete: Boolean(value),
                  },
                })
              }
            />
            <div className="flex-1">
              <div className="flex justify-between gap-2">
                <p
                  className={`text-sm font-semibold ${item.complete ? "line-through text-muted-foreground" : ""}`}
                >
                  {item.title}
                </p>
                {item.priority && <PriorityBadge priority={item.priority} />}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.description || "No description"}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
