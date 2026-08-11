"use client";

import { useState } from "react";
import { AlertCircle, Users } from "lucide-react";
import type { Lead } from "@/types/lead.types";
import type { Priority } from "@/types/api.types";
import { useLeads } from "@/hooks/useLeads";
import { useUsers } from "@/hooks/useUsers";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { LeadRow } from "./LeadRow";
import { LeadFilters } from "./LeadFilters";
import { LeadDetail } from "./LeadDetail";
import { CreateLeadModal } from "./CreateLeadModal";
import { Pagination } from "@/components/shared/Pagination";
import { EmptyState } from "@/components/shared/EmptyState";

export const LeadsTable = () => {
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<Priority>();
  const [assignee, setAssignee] = useState<string>();
  const [selected, setSelected] = useState<Lead | null>(null);
  const [create, setCreate] = useState(false);
  const [page, setPage] = useState(1);
  const leadsQuery = useLeads({
    search: search || undefined,
    priority,
    assigneeId: assignee,
    page: page - 1,
    size: 20,
  });
  const usersQuery = useUsers({ page: 0, size: 100 });
  const users = usersQuery.data?.content ?? [];
  const leads = leadsQuery.data?.content ?? [];
  return (
    <div className="space-y-4">
      <LeadFilters
        search={search}
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        priority={priority}
        onPriority={(value) => {
          setPriority(value);
          setPage(1);
        }}
        assignee={assignee}
        onAssignee={(value) => {
          setAssignee(value);
          setPage(1);
        }}
        users={users}
        onCreate={() => setCreate(true)}
      />
      <section className="overflow-hidden border bg-card">
        {leadsQuery.isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : leadsQuery.isError ? (
          <EmptyState
            icon={AlertCircle}
            title="Leads could not be loaded"
            message="Check your connection and use the browser refresh button to try again."
          />
        ) : leads.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No leads found"
            message="Clear a filter or create your first lead to continue."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Number</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Conversion</TableHead>
                    <TableHead>Lead source</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <LeadRow
                      key={lead.id}
                      lead={lead}
                      users={users}
                      onOpen={setSelected}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
            <Pagination
              page={page}
              totalPages={Math.max(leadsQuery.data?.totalPages ?? 1, 1)}
              onPageChange={setPage}
            />
          </>
        )}
      </section>
      <LeadDetail
        lead={selected}
        users={users}
        open={Boolean(selected)}
        onOpenChange={(value) => !value && setSelected(null)}
      />
      <CreateLeadModal open={create} onOpenChange={setCreate} users={users} />
    </div>
  );
};
