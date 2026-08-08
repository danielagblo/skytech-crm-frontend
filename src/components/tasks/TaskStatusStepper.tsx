"use client";
import { AlertTriangle, ArrowLeft, ArrowRight } from "lucide-react";
import type { TaskStatus } from "@/types/api.types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FLOW: TaskStatus[] = ["TODO", "DOING", "DONE"];
const meta: Record<TaskStatus, { label: string; dot: string }> = {
  TODO: { label: "To do", dot: "bg-green-500" },
  DOING: { label: "Doing", dot: "bg-blue-500" },
  DONE: { label: "Done", dot: "bg-emerald-500" },
  OVERDUE: { label: "Overdue", dot: "bg-red-500" },
};

export const TaskStatusStepper = ({
  status,
  pending,
  onStatusChange,
}: {
  status: TaskStatus;
  pending?: boolean;
  onStatusChange: (status: TaskStatus) => void;
}) => {
  if (status === "OVERDUE") {
    return (
      <section className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-red-100 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/40">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300">
            <AlertTriangle className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">
              Overdue task
            </p>
            <p className="text-xs text-red-600/80 dark:text-red-300/80">
              Reopen it or close it with a completion note.
            </p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => onStatusChange("DOING")}
          >
            <ArrowLeft className="size-3.5" />
            Reopen
          </Button>
          <Button
            size="sm"
            disabled={pending}
            onClick={() => onStatusChange("DONE")}
          >
            Mark done
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </section>
    );
  }
  const index = FLOW.indexOf(status);
  const previous = index > 0 ? FLOW[index - 1] : null;
  const next = index < FLOW.length - 1 ? FLOW[index + 1] : null;
  return (
    <section className="rounded-2xl border bg-muted/40 p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="eyebrow">Task status</p>
        <div className="flex gap-1.5">
          <Button
            size="sm"
            variant="outline"
            disabled={!previous || pending}
            onClick={() => previous && onStatusChange(previous)}
          >
            <ArrowLeft className="size-3.5" />
            Previous
          </Button>
          <Button
            size="sm"
            disabled={!next || pending}
            onClick={() => next && onStatusChange(next)}
          >
            Next status
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </div>
      <div className="flex items-start">
        {FLOW.map((item, itemIndex) => {
          const reached = itemIndex <= index;
          return (
            <div
              key={item}
              className={cn(
                "flex items-start",
                itemIndex < FLOW.length - 1 && "flex-1",
              )}
            >
              <button
                type="button"
                className="flex flex-col items-center gap-1.5"
                disabled={pending}
                onClick={() => onStatusChange(item)}
              >
                <span
                  className={cn(
                    "h-2.5 w-2.5 rounded-full transition",
                    item === status
                      ? meta[item].dot
                      : reached
                        ? "bg-foreground/40"
                        : "bg-border",
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    item === status
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {meta[item].label}
                </span>
              </button>
              {itemIndex < FLOW.length - 1 && (
                <span
                  className={cn(
                    "mx-1 mt-[4px] h-0.5 flex-1 rounded-full",
                    reached ? "bg-foreground/30" : "bg-border",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
