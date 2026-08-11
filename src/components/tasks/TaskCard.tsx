import {
  Calendar,
  Flag,
  MessageSquare,
  Network,
  UsersRound,
} from "lucide-react";
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
      className="w-full border bg-card text-left shadow-[0_1px_2px_rgba(15,23,42,.04)] transition hover:border-primary hover:shadow-md"
    >
      <h4 className="line-clamp-1 border-b px-2 py-2 text-sm font-medium">
        {task.title}
      </h4>
      <div className="space-y-2 px-2 py-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Flag className="h-3.5 w-3.5" />
            Priority
          </span>
          {task.priority ? (
            <PriorityBadge priority={task.priority} />
          ) : (
            <span />
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <UsersRound className="h-3.5 w-3.5" />
            Assignee
          </span>
          {assignees.length ? (
            <AssigneeStack users={assignees} />
          ) : (
            <span className="text-[10px] text-muted-foreground">
              Unassigned
            </span>
          )}
        </div>
        <p className="flex items-center justify-between text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Due date
          </span>
          <span className="text-foreground">
            {task.dueDate ? formatDate(task.dueDate) : "—"}
          </span>
        </p>
      </div>
      <div className="flex justify-between gap-3 border-t px-2 py-2 text-xs text-muted-foreground">
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
