import type { Metadata } from "next";
import { Suspense } from "react";
import { TaskBoard } from "@/components/tasks/TaskBoard";
export const metadata: Metadata = { title: "Task Bar" };
export default function TasksPage() {
  return (
    <div>
      <Suspense fallback={null}>
        <TaskBoard />
      </Suspense>
    </div>
  );
}
