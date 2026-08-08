"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  Clock3,
  MessageSquare,
  Target,
  User,
} from "lucide-react";
import { useCalendar } from "@/hooks/useCalendar";
import { useTasks, useUpdateTaskStatus } from "@/hooks/useTasks";
import { useUsers } from "@/hooks/useUsers";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import type { DashboardOverview } from "@/types/dashboard.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

type RangeKey = "next_7_days" | "next_30_days" | "all";
type RowStatus = "done" | "open" | "overdue";

interface ActivityRow {
  key: string;
  type: "task" | "meeting" | "followup";
  title: string;
  note: string | null;
  dueAt: string | null;
  assignees: string[];
  status: RowStatus;
  href?: string;
  toggleable: boolean;
  onToggle?: () => void;
  reason: string | null;
}

const RANGES: { value: RangeKey; label: string }[] = [
  { value: "next_7_days", label: "Next 7 days" },
  { value: "next_30_days", label: "Next 30 days" },
  { value: "all", label: "All" },
];

const DAY_MS = 86_400000;

const dueLabel = (dueAt: string | null) => {
  if (!dueAt) return "No due date";
  const due = new Date(dueAt);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const diffDays = Math.round((day.getTime() - today.getTime()) / DAY_MS);
  const time = due.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
  if (diffDays === 0) return `Today, ${time}`;
  if (diffDays === 1) return `Tomorrow, ${time}`;
  if (diffDays < 0)
    return `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? "" : "s"} ago`;
  return `${due.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  })}, ${time}`;
};

export const UpcomingActivity = ({
  followUps,
}: {
  followUps?: DashboardOverview["followUpReminders"];
}) => {
  const router = useRouter();
  const [range, setRange] = useState<RangeKey>("next_7_days");
  const [userFilter, setUserFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [reasonOpen, setReasonOpen] = useState<string | null>(null);
  const [now] = useState(() => Date.now());
  const me = useAuthStore((state) => state.user);
  const isStaff = me?.role === "ADMIN" || me?.role === "MANAGER";
  const users = useUsers({ page: 0, size: 100 });
  const events = useCalendar({ page: 0, size: 100 });
  const tasks = useTasks({ page: 0, size: 100 });
  const updateTask = useUpdateTaskStatus();

  const team = users.data?.content ?? [];
  const displayName = (id: string) => {
    const user = team.find((u) => u.id === id);
    return user
      ? `${user.firstName} ${user.lastName}`.trim() || user.email
      : null;
  };

  const toggleTask = (id: string, status: "TODO" | "DONE") =>
    void updateTask.mutate({ id, status });

  const rows: ActivityRow[] = [
    ...(tasks.data?.content ?? []).map((task): ActivityRow => {
      const overdue =
        task.status !== "DONE" &&
        !!task.dueDate &&
        new Date(task.dueDate).getTime() < now;
      const assigned =
        task.assigneeIds.map(displayName).filter(Boolean).join(", ") ||
        "Unassigned";
      return {
        key: `task-${task.id}`,
        type: "task",
        title: `Task assigned to ${assigned}`,
        note: task.description,
        dueAt: task.dueDate,
        assignees: task.assigneeIds,
        status: task.status === "DONE" ? "done" : overdue ? "overdue" : "open",
        href: `/tasks?open=${task.id}`,
        toggleable: true,
        onToggle: () =>
          toggleTask(task.id, task.status === "DONE" ? "TODO" : "DONE"),
        reason: task.completionReason ?? (overdue ? "No reason recorded yet." : null),
      };
    }),
    ...(events.data?.content ?? []).map((event): ActivityRow => ({
      key: `event-${event.id}`,
      type: "meeting",
      title: `Meeting: ${event.title}`,
      note: event.description,
      dueAt: event.startTime,
      assignees: event.assignees,
      status: "open",
      href: "/calendar",
      toggleable: false,
      reason: null,
    })),
    ...(followUps ?? []).map((followUp): ActivityRow => ({
      key: `follow-${followUp.dealId}-${followUp.followUpAt}`,
      type: "followup",
      title: `${followUp.type === "SETTLEMENT" ? "Settlement" : "Negotiation"} follow-up · ${followUp.dealTitle}`,
      note: null,
      dueAt: followUp.followUpAt,
      assignees: [],
      status:
        new Date(followUp.followUpAt).getTime() < now ? "overdue" : "open",
      href: `/pipeline/${followUp.dealId}`,
      toggleable: false,
      reason: null,
    })),
  ];

  const effectiveFilter = isStaff ? userFilter : me?.id ?? "all";
  const visible = rows
    .filter((row) => {
      if (
        effectiveFilter !== "all" &&
        row.assignees.length > 0 &&
        !row.assignees.includes(effectiveFilter)
      )
        return false;
      if (row.dueAt) {
        const due = new Date(row.dueAt).getTime();
        if (range === "next_7_days" && due > now + 7 * DAY_MS)
          return false;
        if (range === "next_30_days" && due > now + 30 * DAY_MS)
          return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (a.status === "overdue" && b.status !== "overdue") return -1;
      if (b.status === "overdue" && a.status !== "overdue") return 1;
      if (a.status === "done" && b.status !== "done") return 1;
      if (b.status === "done" && a.status !== "done") return -1;
      return (a.dueAt ?? "").localeCompare(b.dueAt ?? "");
    });

  const loading = tasks.isLoading || events.isLoading;
  const PAGE_SIZE = 8;
  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = visible.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <section className="surface overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 p-5 pb-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold">Upcoming activity</h3>
        </div>
        <span className="text-sm text-muted-foreground">
          {visible.length} item{visible.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 px-5 py-3">
        <Select
          value={range}
          onValueChange={(value) => {
            setRange(value as RangeKey);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-auto gap-1 px-2 text-sm">
            <Clock3 className="h-5 w-5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGES.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isStaff && (
          <Select
            value={displayName(userFilter) || userFilter}
            onValueChange={(value) => {
              setUserFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-auto gap-1 px-2 text-sm">
              <User className="h-5 w-5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All users</SelectItem>
              {team.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.firstName} {u.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-1 p-3">
        {loading ? (
          Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-14" />
          ))
        ) : visible.length === 0 ? (
          <p className="px-3 py-10 text-center text-sm text-muted-foreground">
            No activity in this range{isStaff ? " or for this user" : ""}.
          </p>
        ) : (
          pageRows.map((row) => {
            const isNoteOpen = expanded === row.key;
            const isReasonOpen = reasonOpen === row.key;
            return (
              <ActivityRowView
                key={row.key}
                row={row}
                staff={isStaff}
                noteOpen={isNoteOpen}
                reasonOpen={isReasonOpen}
                onToggleNote={() =>
                  setExpanded(isNoteOpen ? null : row.key)
                }
                onToggleReason={() =>
                  setReasonOpen(isReasonOpen ? null : row.key)
                }
                onOpen={() => row.href && router.push(row.href)}
                onMarkDone={() => row.onToggle?.()}
              />
            );
          })
        )}
      </div>

      {!loading && visible.length > PAGE_SIZE && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 px-5 py-3">
          <p className="text-xs text-muted-foreground">
            Showing{" "}
            {visible.length === 0
              ? 0
              : (currentPage - 1) * PAGE_SIZE + 1}
            –{Math.min(currentPage * PAGE_SIZE, visible.length)} of{" "}
            {visible.length}
          </p>
          <div className="flex items-center gap-1">
            <RowButton
              title="Previous page"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={currentPage === 1 ? "opacity-40" : ""}
            >
              <ChevronLeft className="h-4 w-4" />
            </RowButton>
            <span className="min-w-14 px-1 text-center text-xs text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <RowButton
              title="Next page"
              onClick={() =>
                setPage((p) => Math.min(totalPages, p + 1))
              }
              className={currentPage === totalPages ? "opacity-40" : ""}
            >
              <ChevronRight className="h-4 w-4" />
            </RowButton>
          </div>
        </div>
      )}
    </section>
  );
};

const ActivityRowView = ({
  row,
  staff,
  noteOpen,
  reasonOpen,
  onToggleNote,
  onToggleReason,
  onOpen,
  onMarkDone,
}: {
  row: ActivityRow;
  staff: boolean;
  noteOpen: boolean;
  reasonOpen: boolean;
  onToggleNote: () => void;
  onToggleReason: () => void;
  onOpen: () => void;
  onMarkDone: () => void;
}) => {
  const Icon =
    row.type === "task" ? Target : row.type === "meeting" ? CalendarDays : Clock3;
  const done = row.status === "done";
  const showReason =
    staff && row.type === "task" && !done;
  const showNote = Boolean(row.note);
  return (
    <div
      className={cn(
        "rounded-lg border p-2.5 transition hover:shadow-sm sm:p-3",
        row.status === "overdue" ? "border border-red-500" : "hover:border-gray-300",
      )}
    >
      <div className="grid items-center gap-x-1 gap-y-2 sm:grid-cols-[3fr_2fr_0.5fr]">
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMarkDone();
            }}
            disabled={!row.toggleable}
            className={cn(
              "grid h-5 w-5 shrink-0 place-items-center rounded-full cursor-pointer transition",
              !row.toggleable && "cursor-default",
              done ? "text-green-600" : "text-gray-300 hover:text-green-500",
            )}
            aria-label={done ? "Mark not done" : "Mark done"}
            title={row.toggleable ? (done ? "Mark not done" : "Mark done") : undefined}
          >
            {done ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
          </button>
          <p className="flex min-w-0 items-center gap-1.5 text-sm font-medium text-gray-800">
            <Icon className="h-5 w-5 shrink-0 text-green-600" />
            <span className="truncate text-base">{row.title}</span>
          </p>
        </div>

        <div className="flex items-center gap-1.5 pl-7 text-sm text-muted-foreground sm:pl-0">
          <CalendarDays className="h-5 w-5 shrink-0 text-green-600" />
          <span className="whitespace-nowrap">
            Due date: {dueLabel(row.dueAt)}
          </span>
          {row.status === "overdue" && (
            <span className="rounded-full bg-red-500 px-2 py-1 text-xs font-medium text-white">
              Overdue
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-0.5 sm:justify-end">
          {showReason && (
            <RowButton
              title={reasonOpen ? "Hide reason" : "Why wasn't it completed?"}
              onClick={onToggleReason}
              className="text-red-500 hover:bg-red-50 hover:text-red-600"
            >
              <MessageSquare
                className={cn("h-5 w-5", reasonOpen && "fill-red-500 text-white")}
              />
            </RowButton>
          )}
          {showNote && (
            <RowButton
              title={noteOpen ? "Close details" : "Open details"}
              onClick={onToggleNote}
            >
              {noteOpen ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </RowButton>
          )}
          {row.href && (
            <RowButton title="Open task" onClick={onOpen}>
              <ArrowRight className="h-5 w-5" />
            </RowButton>
          )}
        </div>
      </div>

      {reasonOpen && (
        <div className="mt-2 ml-8 rounded-lg border border-red-200 bg-red-50/60 p-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-red-500">
            Completion note
          </p>
          <p className="mt-1 leading-relaxed text-gray-700">
            {row.reason ?? "No completion note has been provided yet."}
          </p>
        </div>
      )}
      {noteOpen && row.note && (
        <div className="mt-2 ml-8 rounded-lg border border-green-300 bg-gray-50 p-3">
          <p className="leading-relaxed text-gray-600">{row.note}</p>
        </div>
      )}
    </div>
  );
};

const RowButton = ({
  children,
  onClick,
  title,
  className,
}: {
  children: ReactNode;
  onClick: () => void;
  title: string;
  className?: string;
}) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className={cn(
      "grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition hover:text-gray-900",
      className,
    )}
  >
    {children}
  </button>
);