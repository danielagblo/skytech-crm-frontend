import { format } from "date-fns";
import type { CalendarEvent } from "@/types/calendar.types";
import type { User, UserSummary } from "@/types/user.types";
import type { CalendarEventType } from "@/types/api.types";
import { AssigneeStack } from "@/components/shared/AssigneeStack";
const colors: Record<CalendarEventType, string> = {
  CALL_LOG_FOLLOWUP: "border-blue-200 bg-blue-50 text-blue-900",
  MEETING: "border-violet-200 bg-violet-50 text-violet-900",
  PAYMENT_DUE: "border-amber-200 bg-amber-50 text-amber-900",
  REMINDER: "border-green-200 bg-green-50 text-green-900",
  TASK_DUE: "border-slate-200 bg-slate-50 text-slate-900",
};
export const CalendarEventCard = ({
  event,
  users,
  onClick,
}: {
  event: CalendarEvent;
  users: User[];
  onClick: () => void;
}) => {
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);
  const top = (start.getHours() + start.getMinutes() / 60 - 8) * 72;
  const height = Math.max(
    ((end.getTime() - start.getTime()) / 3_600_000) * 72,
    42,
  );
  const assignees = event.assignees
    .map((id) => users.find((user) => user.id === id))
    .filter((user): user is User => Boolean(user)) as UserSummary[];
  return (
    <button
      onClick={onClick}
      className={`absolute inset-x-1 z-10 overflow-hidden rounded-lg border p-2 text-left text-xs shadow-sm ${colors[event.eventType]}`}
      style={{ top, height }}
    >
      <p className="truncate font-semibold">{event.title}</p>
      <p className="mt-0.5 text-[10px] opacity-70">
        {format(start, "h:mm a")}–{format(end, "h:mm a")}
      </p>
      {assignees.length > 0 && (
        <div className="mt-2">
          <AssigneeStack users={assignees} max={2} />
        </div>
      )}
    </button>
  );
};
