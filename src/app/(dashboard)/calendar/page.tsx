import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { CalendarView } from "@/components/calendar/CalendarView";
export const metadata: Metadata = { title: "Calendar" };
export default function CalendarPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Calendar"
        description="A weekly view of calls, meetings, payments and tasks"
      />
      <CalendarView />
    </div>
  );
}
