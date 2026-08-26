import type { Metadata } from "next";
import { LeadsOverview } from "@/components/leads/LeadsOverview";
import { LeadsTable } from "@/components/leads/LeadsTable";
export const metadata: Metadata = { title: "Leads" };
export default function LeadsPage() {
  return (
    <div className="space-y-5">
      <LeadsOverview />
      <LeadsTable />
    </div>
  );
}
