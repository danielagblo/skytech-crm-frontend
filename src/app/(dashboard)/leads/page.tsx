import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { LeadsOverview } from "@/components/leads/LeadsOverview";
import { LeadsTable } from "@/components/leads/LeadsTable";
export const metadata: Metadata = { title: "Leads" };
export default function LeadsPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Leads"
        description="Qualify prospects and coordinate every hand-off"
      />
      <LeadsOverview />
      <LeadsTable />
    </div>
  );
}
