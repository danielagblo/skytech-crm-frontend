"use client";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import type { Task } from "@/types/task.types";
import type { User } from "@/types/user.types";
import type { TaskStatus } from "@/types/api.types";
import { TaskCard } from "./TaskCard";
const labels: Record<TaskStatus, string> = {
  TODO: "To do",
  DOING: "Doing",
  DONE: "Done",
  OVERDUE: "Overdue",
};
const style: Record<TaskStatus, string> = {
  TODO: "bg-emerald-50 text-slate-700 border-emerald-400",
  DOING: "bg-orange-50 text-slate-700 border-orange-300",
  DONE: "bg-green-100 text-slate-700 border-green-500",
  OVERDUE: "bg-red-50 text-slate-700 border-red-400",
};
export const TaskColumn = ({
  status,
  tasks,
  users,
  counts,
  onOpen,
}: {
  status: TaskStatus;
  tasks: Task[];
  users: User[];
  counts: Record<string, { subtasks: number; comments: number }>;
  onOpen: (task: Task) => void;
}) => (
  <section className="min-w-[250px] flex-1 xl:max-w-[270px] xl:flex-none min-[2200px]:max-w-none min-[2200px]:flex-1">
    <div
      className={`mb-2 flex items-center justify-between border-l-2 px-3 py-2 ${style[status]}`}
    >
      <h3 className="text-sm font-semibold">{labels[status]}</h3>
      <span className="text-base font-medium">{tasks.length}</span>
    </div>
    <Droppable droppableId={status}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`min-h-[540px] space-y-2 ${snapshot.isDraggingOver ? "bg-primary/15" : "bg-transparent"}`}
        >
          {tasks.map((task, index) => (
            <Draggable
              key={task.id}
              draggableId={task.id}
              index={index}
              disableInteractiveElementBlocking
            >
              {(drag) => (
                <div
                  ref={drag.innerRef}
                  {...drag.draggableProps}
                  {...drag.dragHandleProps}
                >
                  <TaskCard
                    task={task}
                    users={users}
                    subtaskCount={counts[task.id]?.subtasks ?? 0}
                    commentCount={counts[task.id]?.comments ?? 0}
                    onClick={() => onOpen(task)}
                  />
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
          {tasks.length === 0 && (
            <p className="rounded-xl border border-dashed bg-white/70 p-6 text-center text-xs text-muted-foreground">
              Drop a task here
            </p>
          )}
        </div>
      )}
    </Droppable>
  </section>
);
