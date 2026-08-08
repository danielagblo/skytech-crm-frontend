import type { Metadata } from "next";
import { Suspense } from "react";
import { TaskBoard } from "@/components/tasks/TaskBoard";
import { PageHeader } from "@/components/shared/PageHeader";
export const metadata: Metadata = { title: "Task Bar" };
export default function TasksPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Task Bar"
        description="Plan, assign and finish work across every case"
      />
      <Suspense fallback={null}>
        <TaskBoard />
      </Suspense>
    </div>
  );
}