"use client";
import { useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfDay,
  endOfWeek,
  format,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { AlertCircle, ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import type { CalendarEvent } from "@/types/calendar.types";
import { useCalendar } from "@/hooks/useCalendar";
import { useUsers } from "@/hooks/useUsers";
import { useTasks } from "@/hooks/useTasks";
import { useDashboard } from "@/hooks/useDashboard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { CalendarEventCard } from "./CalendarEventCard";
import { EventDetailModal } from "./EventDetailModal";
import { START_HOUR, HOUR_HEIGHT, WEEK_HOURS } from "./calendar.constants";
const hours = Array.from(
  { length: WEEK_HOURS },
  (_, index) => index + START_HOUR,
);
export const CalendarView = () => {
  const [anchor, setAnchor] = useState(new Date());
  const [event, setEvent] = useState<CalendarEvent | null>(null);
  const start = startOfWeek(anchor, { weekStartsOn: 1 });
  const end = endOfWeek(anchor, { weekStartsOn: 1 });
  const calendar = useCalendar({
    from: start.toISOString(),
    to: endOfDay(end).toISOString(),
    page: 0,
    size: 100,
  });
  const users = useUsers({ page: 0, size: 100 });
  const tasks = useTasks({ page: 0, size: 100 });
  const overview = useDashboard("three_months");
  const days = Array.from({ length: 7 }, (_, index) => addDays(start, index));
  const monthDays = Array.from({ length: 35 }, (_, index) =>
    addDays(
      startOfWeek(new Date(anchor.getFullYear(), anchor.getMonth(), 1), {
        weekStartsOn: 1,
      }),
      index,
    ),
  );
  const events = useMemo(() => calendar.data?.content ?? [], [calendar.data]);
  const taskEvents = useMemo<CalendarEvent[]>(
    () =>
      (tasks.data?.content ?? [])
        .filter((task) => task.dueDate)
        .map(
          (task): CalendarEvent => ({
            id: `task-${task.id}`,
            title: task.title,
            description: task.description ?? null,
            ownerId: task.createdById,
            linkedLeadId: task.linkedLeadId,
            linkedDealId: task.linkedDealId,
            startTime: task.dueDate as string,
            endTime: task.dueDate as string,
            eventType: "TASK_DUE",
            assignees: task.assigneeIds,
            createdAt: task.createdAt,
          }),
        ),
    [tasks.data],
  );
  const followUps = useMemo<CalendarEvent[]>(
    () =>
      (overview.data?.followUpReminders ?? []).map(
        (row): CalendarEvent => ({
          id: `follow-${row.dealId}-${new Date(row.followUpAt).getTime()}`,
          title: `${row.type === "SETTLEMENT" ? "Settlement" : "Negotiation"} follow-up · ${row.dealTitle}`,
          description: null,
          ownerId: "",
          linkedLeadId: null,
          linkedDealId: row.dealId,
          startTime: row.followUpAt,
          endTime: row.followUpAt,
          eventType: "CALL_LOG_FOLLOWUP",
          assignees: [],
          createdAt: row.followUpAt,
        }),
      ),
    [overview.data],
  );
  const mergedEvents = useMemo<CalendarEvent[]>(() => {
    const seen = new Set(
      events.map((item) => `${item.eventType}|${item.startTime}|${item.title}`),
    );
    const extra = [...taskEvents, ...followUps].filter(
      (item) => !seen.has(`${item.eventType}|${item.startTime}|${item.title}`),
    );
    return [...events, ...extra];
  }, [events, taskEvents, followUps]);
  const eventMap = useMemo(
    () =>
      new Map(
        days.map((day) => [
          format(day, "yyyy-MM-dd"),
          mergedEvents.filter(
            (item) =>
              format(new Date(item.startTime), "yyyy-MM-dd") ===
              format(day, "yyyy-MM-dd"),
          ),
        ]),
      ),
    [days, mergedEvents],
  );
  const next = mergedEvents
    .filter((item) => new Date(item.startTime) > new Date())
    .sort((a, b) => a.startTime.localeCompare(b.startTime))[0];
  if (calendar.isLoading || users.isLoading)
    return (
      <div className="grid gap-4 xl:grid-cols-[230px_1fr]">
        <Skeleton className="h-96" />
        <Skeleton className="h-[640px]" />
      </div>
    );
  if (calendar.isError)
    return (
      <EmptyState
        icon={AlertCircle}
        title="Calendar could not be loaded"
        message="Check your connection and refresh this page to try again."
      />
    );
  const team = users.data?.content ?? [];
  return (
    <>
      <div className="grid gap-4 xl:grid-cols-[230px_1fr]">
        <aside className="space-y-4">
          <div className="surface p-4">
            <div className="mb-4 flex items-center justify-between">
              <strong>{format(anchor, "MMMM yyyy")}</strong>
              <div className="flex">
                <button
                  onClick={() => setAnchor(subMonths(anchor, 1))}
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setAnchor(addMonths(anchor, 1))}
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 text-center text-[10px] text-muted-foreground">
              {"MTWTFSS".split("").map((day, index) => (
                <span key={`${day}${index}`}>{day}</span>
              ))}
              {monthDays.map((day) => (
                <button
                  key={day.toISOString()}
                  onClick={() => setAnchor(day)}
                  className={`mt-2 aspect-square rounded-full text-xs ${format(day, "yyyy-MM-dd") === format(anchor, "yyyy-MM-dd") ? "bg-primary font-semibold text-black" : day.getMonth() !== anchor.getMonth() ? "text-gray-300" : "hover:bg-muted"}`}
                >
                  {format(day, "d")}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-gray-900 p-4 text-white">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Clock3 className="h-4 w-4 text-primary" />
              Next due
            </p>
            <p className="mt-2 text-xs text-gray-400">
              {next
                ? `${next.title} · ${format(new Date(next.startTime), "do MMM, h:mm a")}`
                : "No upcoming events this week"}
            </p>
          </div>
        </aside>
        <section className="surface overflow-hidden">
          <div className="flex items-center justify-between border-b p-4">
            <div>
              <h2 className="font-semibold">{format(start, "MMMM yyyy")}</h2>
              <p className="text-xs text-muted-foreground">
                Week of {format(start, "do MMMM")}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={() => setAnchor(subWeeks(anchor, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setAnchor(new Date())}>
                Today
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setAnchor(addWeeks(anchor, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-[70px_repeat(7,1fr)] border-b">
                <div />
                {days.map((day) => (
                  <div
                    key={day.toISOString()}
                    className="border-l p-3 text-center"
                  >
                    <p className="text-xs text-muted-foreground">
                      {format(day, "EEE")}
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                      {format(day, "d")}
                    </p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-[70px_repeat(7,1fr)]">
                <div>
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="border-b pr-2 pt-1 text-right text-[10px] text-muted-foreground"
                      style={{ height: HOUR_HEIGHT }}
                    >
                      {format(new Date(2026, 0, 1, hour), "ha")}
                    </div>
                  ))}
                </div>
                {days.map((day) => (
                  <div
                    key={day.toISOString()}
                    className="relative border-l"
                    style={{ height: hours.length * HOUR_HEIGHT }}
                  >
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        className="border-b"
                        style={{ height: HOUR_HEIGHT }}
                      />
                    ))}
                    {eventMap.get(format(day, "yyyy-MM-dd"))?.map((item) => (
                      <CalendarEventCard
                        key={item.id}
                        event={item}
                        users={team}
                        onClick={() => setEvent(item)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
      <EventDetailModal
        event={event}
        users={team}
        open={Boolean(event)}
        onOpenChange={(value) => !value && setEvent(null)}
      />
    </>
  );
};
