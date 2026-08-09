import { format } from "date-fns";
import type { CalendarEvent } from "@/types/calendar.types";
import type { User, UserSummary } from "@/types/user.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AssigneeStack } from "@/components/shared/AssigneeStack";
export const EventDetailModal = ({
  event,
  users,
  open,
  onOpenChange,
}: {
  event: CalendarEvent | null;
  users: User[];
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) => {
  if (!event) return null;
  const assignees = (event.assignees ?? [])
    .map((id) => users.find((user) => user.id === id))
    .filter((user): user is User => Boolean(user)) as UserSummary[];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
            {event.eventType?.replaceAll("_", " ")}
          </span>
          <div>
            <p className="eyebrow">Time</p>
            <p className="mt-1 text-sm">
              {format(new Date(event.startTime), "do MMMM yyyy, h:mm a")} –{" "}
              {format(new Date(event.endTime), "h:mm a")}
            </p>
          </div>
          <div>
            <p className="eyebrow">Linked CRM record</p>
            <p className="mt-1 text-sm">
              {event.linkedLeadId
                ? `Lead ${event.linkedLeadId}`
                : event.linkedDealId
                  ? `Deal ${event.linkedDealId}`
                  : "No linked record"}
            </p>
          </div>
          <div>
            <p className="eyebrow">Assignees</p>
            <div className="mt-2">
              {assignees.length ? (
                <AssigneeStack users={assignees} />
              ) : (
                <span className="text-sm text-muted-foreground">
                  No assignees
                </span>
              )}
            </div>
          </div>
          {event.description && (
            <div>
              <p className="eyebrow">Description</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {event.eventType === "TASK_DUE"
                  ? event.description.replace(/\n\[TASK_ID=[^\]]+\]$/, "")
                  : event.description}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
