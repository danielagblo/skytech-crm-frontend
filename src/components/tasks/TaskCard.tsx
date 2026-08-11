import { Calendar, MessageSquare, Network } from "lucide-react";
import type { Task } from "@/types/task.types";
import type { User, UserSummary } from "@/types/user.types";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { AssigneeStack } from "@/components/shared/AssigneeStack";
import { formatDate } from "@/lib/utils";
export const TaskCard = ({
  task,
  users,
  subtaskCount,
  commentCount,
  onClick,
}: {
  task: Task;
  users: User[];
  subtaskCount: number;
  commentCount: number;
  onClick: () => void;
}) => {
  const assignees = task.assigneeIds
    .map((id) => users.find((user) => user.id === id))
    .filter((user): user is User => Boolean(user)) as UserSummary[];
  return (
    <button
      onClick={onClick}
      className="w-full rounded-md border bg-card p-3 text-left shadow-[0_1px_2px_rgba(15,23,42,.04)] transition hover:border-primary/60 hover:shadow-md"
    >
      <h4 className="line-clamp-2 text-sm font-semibold">{task.title}</h4>
      <div className="mt-3 flex items-center justify-between">
        {task.priority ? <PriorityBadge priority={task.priority} /> : <span />}
        {assignees.length ? (
          <AssigneeStack users={assignees} />
        ) : (
          <span className="text-[10px] text-muted-foreground">Unassigned</span>
        )}
      </div>
      <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
        <Calendar className="h-3.5 w-3.5" />
        {task.dueDate ? `Due ${formatDate(task.dueDate)}` : "No due date"}
      </p>
      <div className="mt-3 flex gap-3 border-t pt-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Network className="h-3 w-3" />
          {subtaskCount} subtasks
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          {commentCount} comments
        </span>
      </div>
    </button>
  );
};
