"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bell, Plus, UserRound } from "lucide-react";
import type { Priority } from "@/types/api.types";
import type { Task } from "@/types/task.types";
import type { User } from "@/types/user.types";
import {
  useAddTaskComment,
  useCreateSubtask,
  useReplyTaskComment,
  useTaskComments,
  useTaskSubtasks,
  useUpdateTask,
} from "@/hooks/useTasks";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { SubTaskList } from "./SubTaskList";
import { CommentThread } from "@/components/shared/CommentThread";

const subtaskSchema = z.object({
  title: z.string().trim().min(2, "Enter a subtask title."),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  description: z.string().trim().min(2, "Add a short description."),
});
type SubtaskValues = z.infer<typeof subtaskSchema>;

export const TaskDetail = ({
  task,
  users,
  open,
  onOpenChange,
}: {
  task: Task | null;
  users: User[];
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) => {
  const [adding, setAdding] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const subtasks = useTaskSubtasks(task?.id ?? "");
  const comments = useTaskComments(task?.id ?? "");
  const createSubtask = useCreateSubtask();
  const addComment = useAddTaskComment();
  const replyComment = useReplyTaskComment();
  const update = useUpdateTask();
  const {
    register,
    control,
    setValue,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<SubtaskValues>({
    resolver: zodResolver(subtaskSchema),
    mode: "onBlur",
    defaultValues: { title: "", priority: "LOW", description: "" },
  });
  const values = useWatch({ control });

  if (!task) return null;
  const creator = users.find((user) => user.id === task.createdById);
  const add = handleSubmit((data) =>
    createSubtask.mutate(
      { taskId: task.id, data: { ...data, complete: false } },
      {
        onSuccess: () => {
          reset();
          setAdding(false);
        },
      },
    ),
  );
  const description = task.description || "No description provided.";
  const canCollapse = description.length > 220;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="max-w-lg">
        <SheetHeader>
          <SheetTitle>{task.title}</SheetTitle>
          <div className="flex gap-2">
            <StatusBadge status={task.status} />
            {task.priority && <PriorityBadge priority={task.priority} />}
          </div>
        </SheetHeader>
        <div className="space-y-6">
          <div className="grid gap-3 rounded-xl bg-muted p-4 text-sm">
            <p className="flex items-center gap-2">
              <UserRound className="h-4 w-4" />
              Created by{" "}
              <strong>
                {creator
                  ? `${creator.firstName} ${creator.lastName}`
                  : "CRM user"}
              </strong>
            </p>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Allow reminder
              </span>
              <Switch
                checked={task.allowReminder}
                disabled={update.isPending}
                onCheckedChange={(allowReminder) =>
                  update.mutate({
                    id: task.id,
                    data: {
                      title: task.title,
                      allowReminder,
                      version: task.version,
                    },
                  })
                }
              />
            </div>
          </div>
          <section>
            <p className="eyebrow mb-2">Description</p>
            <p
              className={`text-sm leading-relaxed text-muted-foreground ${canCollapse && !expanded ? "line-clamp-4" : ""}`}
            >
              {description}
            </p>
            {canCollapse && (
              <button
                type="button"
                className="mt-2 text-xs font-semibold text-green-700"
                onClick={() => setExpanded((value) => !value)}
              >
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </section>
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">
                Sub tasks · {subtasks.data?.length ?? 0}
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAdding((value) => !value)}
              >
                <Plus className="h-3.5 w-3.5" />
                Add subtask
              </Button>
            </div>
            {adding && (
              <form
                className="mb-3 space-y-3 rounded-xl border p-3"
                onSubmit={add}
              >
                <div>
                  <Label>Title</Label>
                  <Input {...register("title")} placeholder="Subtask title" />
                  {errors.title && (
                    <p className="text-xs text-danger">
                      {errors.title.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select
                    value={values.priority}
                    onValueChange={(value: Priority) =>
                      setValue("priority", value, { shouldValidate: true })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    {...register("description")}
                    placeholder="Describe the expected result"
                  />
                  {errors.description && (
                    <p className="text-xs text-danger">
                      {errors.description.message}
                    </p>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      reset();
                      setAdding(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createSubtask.isPending}>
                    {createSubtask.isPending ? "Adding…" : "Add subtask"}
                  </Button>
                </div>
              </form>
            )}
            {subtasks.isLoading ? (
              <Skeleton className="h-24" />
            ) : (
              <SubTaskList taskId={task.id} items={subtasks.data ?? []} />
            )}
          </section>
          <section>
            <h3 className="mb-3 font-semibold">Comments</h3>
            {comments.isLoading ? (
              <Skeleton className="h-28" />
            ) : (
              <CommentThread
                comments={comments.data ?? []}
                onAdd={(body) => addComment.mutate({ taskId: task.id, body })}
                onReply={(commentId, body) =>
                  replyComment.mutate({ taskId: task.id, commentId, body })
                }
                pending={addComment.isPending || replyComment.isPending}
              />
            )}
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
};
