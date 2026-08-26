import {
  CalendarClock,
  CircleCheck,
  CircleX,
  UsersRound,
  UserCog,
} from "lucide-react";
import type { Automation } from "@/types/automation.types";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/shared/EmptyState";
export const PersonalAutomation = ({
  items,
  onToggle,
  pending,
  onEdit,
}: {
  items: Automation[];
  onToggle: (id: string) => void;
  pending: boolean;
  onEdit: (automation: Automation) => void;
}) => (
  <section className="space-y-4">
    <div>
      <h2 className="text-lg font-semibold">Personal automations</h2>
      <p className="text-sm text-muted-foreground">
        Agent-owned follow-up sequences and reminders.
      </p>
    </div>
    {items.length === 0 ? (
      <EmptyState
        icon={UserCog}
        title="No personal automations"
        message="Agent-owned workflows will appear here after they are created."
      />
    ) : (
      items.map((item) => (
        <div
          key={item.id}
          className="surface flex flex-wrap items-center gap-4 p-4"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 font-semibold">
            {item.name.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-48 flex-1">
            <p className="font-semibold">{item.name}</p>
            <p className="text-xs text-muted-foreground">
              Personal automation · {item.steps.length} delivery step
              {item.steps.length === 1 ? "" : "s"}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <UsersRound className="h-3.5 w-3.5" />
                {item.recipientCount ?? item.contactIds?.length ?? 0} contacts
              </span>
              <span className="flex items-center gap-1">
                <CalendarClock className="h-3.5 w-3.5" />
                {item.triggerConfig.date ?? "No trigger date"}
              </span>
              <span className="flex items-center gap-1">
                {item.executionState === "FAILED" ? (
                  <CircleX className="h-3.5 w-3.5 text-danger" />
                ) : (
                  <CircleCheck className="h-3.5 w-3.5 text-success" />
                )}
                {item.executionState ?? (item.active ? "WAITING" : "PAUSED")}
              </span>
            </div>
            {item.failureReason && (
              <p className="mt-2 text-xs text-danger">{item.failureReason}</p>
            )}
          </div>
          <Switch
            checked={item.active}
            disabled={pending}
            onCheckedChange={() => onToggle(item.id)}
          />
          <button
            type="button"
            className="rounded-md border px-2 py-1 text-xs hover:bg-muted"
            onClick={() => onEdit(item)}
          >
            Edit
          </button>
        </div>
      ))
    )}
  </section>
);
