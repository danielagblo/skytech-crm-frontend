"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { AlertCircle, Plus, Search, TrendingUp } from "lucide-react";
import type { Task } from "@/types/task.types";
import type { Priority, TaskStatus } from "@/types/api.types";
import { tasksService } from "@/services/tasks.service";
import { useTasks, useTaskStats, useUpdateTaskStatus } from "@/hooks/useTasks";
import { useUsers } from "@/hooks/useUsers";
import { useCreateActivity } from "@/hooks/useActivities";
import { TaskColumn } from "./TaskColumn";
import { TaskDetail } from "./TaskDetail";
import { CreateTaskModal } from "./CreateTaskModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { OverdueResolutionModal } from "./OverdueResolutionModal";

const statuses: TaskStatus[] = ["TODO", "DOING", "DONE", "OVERDUE"];
export const TaskBoard = () => {
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, TaskStatus>
  >({});
  const [selected, setSelected] = useState<Task | null>(null);
  const [overdueResolution, setOverdueResolution] = useState<Task | null>(null);
  const [create, setCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<Priority>();
  const [assignee, setAssignee] = useState<string>();
  const searchParams = useSearchParams();
  const openedRef = useRef<string | null>(null);
  const tasks = useTasks({
    search: search || undefined,
    priority,
    assigneeId: assignee,
    page: 0,
    size: 100,
  });
  const stats = useTaskStats();
  const users = useUsers({ page: 0, size: 100 });
  const updateStatus = useUpdateTaskStatus();
  const createActivity = useCreateActivity();
  const source = useMemo(() => tasks.data?.content ?? [], [tasks.data]);
  const items = useMemo(
    () =>
      source.map((task) =>
        statusOverrides[task.id]
          ? { ...task, status: statusOverrides[task.id] }
          : task,
      ),
    [source, statusOverrides],
  );
  useEffect(() => {
    if (typeof window === "undefined") return;
    const openId =
      searchParams?.get("open") ??
      new URLSearchParams(window.location.search).get("open");
    if (!openId || openedRef.current === openId || items.length === 0) return;
    const target = items.find((task) => task.id === openId);
    if (!target) return;
    openedRef.current = openId;
    const timer = window.setTimeout(() => setSelected(target), 0);
    return () => window.clearTimeout(timer);
  }, [searchParams, items]);
  const detailQueries = useQueries({
    queries: items.flatMap((task) => [
      {
        queryKey: ["task-subtasks", task.id],
        queryFn: () => tasksService.getSubtasks(task.id),
        select: (
          response: Awaited<ReturnType<typeof tasksService.getSubtasks>>,
        ) => response.data.data.totalElements,
      },
      {
        queryKey: ["task-comments", task.id],
        queryFn: () => tasksService.getComments(task.id),
        select: (
          response: Awaited<ReturnType<typeof tasksService.getComments>>,
        ) => response.data.data.totalElements,
      },
    ]),
  });
  const counts = Object.fromEntries(
    items.map((task, index) => [
      task.id,
      {
        subtasks: detailQueries[index * 2]?.data ?? 0,
        comments: detailQueries[index * 2 + 1]?.data ?? 0,
      },
    ]),
  );
  const commitStatus = (id: string, status: TaskStatus) => {
    const previous = statusOverrides[id];
    setStatusOverrides((current) => ({
      ...current,
      [id]: status,
    }));
    setSelected((current) =>
      current && current.id === id ? { ...current, status } : current,
    );
    updateStatus.mutate(
      { id, status },
      {
        onError: () => {
          const original =
            previous ?? source.find((task) => task.id === id)?.status;
          setStatusOverrides((current) => {
            const next = { ...current };
            if (previous) next[id] = previous;
            else delete next[id];
            return next;
          });
          setSelected((current) =>
            current && current.id === id
              ? { ...current, status: original ?? status }
              : current,
          );
        },
      },
    );
  };
  const moveStatus = (task: Task, status: TaskStatus) => {
    if (task.status === "OVERDUE" && status === "DONE") {
      setOverdueResolution(task);
      return;
    }
    commitStatus(task.id, status);
  };
  const drop = (result: DropResult) => {
    if (!result.destination) return;
    const status = result.destination.droppableId as TaskStatus;
    if (
      result.source.droppableId === status &&
      result.source.index === result.destination.index
    )
      return;
    const task = items.find((item) => item.id === result.draggableId);
    if (!task) return;
    moveStatus(task, status);
  };
  if (tasks.isLoading || users.isLoading)
    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-[600px]" />
      </div>
    );
  if (tasks.isError)
    return (
      <EmptyState
        icon={AlertCircle}
        title="Tasks could not be loaded"
        message="Check your connection and refresh this page to try again."
      />
    );
  const statsData = stats.data ?? {
    total: items.length,
    done: items.filter((task) => task.status === "DONE").length,
    overdue: items.filter((task) => task.status === "OVERDUE").length,
  };
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Total Tasks", statsData.total],
          ["Total Task Done", statsData.done],
          ["Overdue", statsData.overdue],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="surface flex items-center justify-between p-4"
          >
            <div>
              <p className="eyebrow">{label}</p>
              <p className="mt-1 text-2xl font-semibold">{value}</p>
            </div>
            <span className="flex items-center gap-1 text-xs text-green-700">
              <TrendingUp className="h-4 w-4" />
              Live
            </span>
          </div>
        ))}
      </div>
      <div className="surface flex flex-wrap items-center gap-2 rounded-xl p-3">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tasks"
            className="pl-9"
          />
        </div>
        <Select
          onValueChange={(value) =>
            setAssignee(value === "ALL" ? undefined : value)
          }
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All assignees</SelectItem>
            {(users.data?.content ?? []).map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.firstName} {user.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          onValueChange={(value) =>
            setPriority(value === "ALL" ? undefined : (value as Priority))
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All priorities</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setCreate(true)}>
          <Plus className="h-4 w-4" />
          Create task
        </Button>
      </div>
      <DragDropContext onDragEnd={drop}>
        <div className="dot-grid flex min-h-[600px] gap-4 overflow-x-auto rounded-2xl border p-4">
          {statuses.map((status) => (
            <TaskColumn
              key={status}
              status={status}
              tasks={items.filter((task) => task.status === status)}
              users={users.data?.content ?? []}
              counts={counts}
              onOpen={setSelected}
            />
          ))}
        </div>
      </DragDropContext>
      <TaskDetail
        task={selected}
        users={users.data?.content ?? []}
        open={Boolean(selected)}
        pending={updateStatus.isPending}
        onOpenChange={(value) => !value && setSelected(null)}
        onStatusChange={(status) => selected && moveStatus(selected, status)}
      />
      <CreateTaskModal open={create} onOpenChange={setCreate} />
      <OverdueResolutionModal
        task={overdueResolution}
        open={Boolean(overdueResolution)}
        pending={updateStatus.isPending || createActivity.isPending}
        onOpenChange={(open) => !open && setOverdueResolution(null)}
        onConfirm={async (reason) => {
          if (!overdueResolution) return;
          await updateStatus.mutateAsync({
            id: overdueResolution.id,
            status: "DONE",
            reason,
          });
          setStatusOverrides((current) => ({
            ...current,
            [overdueResolution.id]: "DONE",
          }));
          setSelected((current) =>
            current && current.id === overdueResolution.id
              ? { ...current, status: "DONE" }
              : current,
          );
          try {
            await createActivity.mutateAsync({
              eventType: "TASK_STATUS_CHANGED",
              entityType: "TASK",
              entityId: overdueResolution.id,
              description: reason,
              metadata: {
                previousStatus: "OVERDUE",
                status: "DONE",
                completionReason: reason,
              },
            });
          } catch {
            // Status remains updated; the activity hook already explains the note failure.
          }
          setOverdueResolution(null);
        }}
      />
    </div>
  );
};
