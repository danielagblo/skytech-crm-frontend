"use client";
import { useState } from "react";
import { useQueries } from "@tanstack/react-query";
import type { User } from "@/types/user.types";
import { AlertCircle, ArrowRight, Plus } from "lucide-react";
import { usersService } from "@/services/users.service";
import { useUsers } from "@/hooks/useUsers";
import { useLeads } from "@/hooks/useLeads";
import {
  useLeadAssignmentSettings,
  useUpdateLeadAssignmentSettings,
} from "@/hooks/useSettings";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AgentTable } from "@/components/settings/agents/AgentTable";
import { AddAgentModal } from "@/components/settings/agents/AddAgentModal";
import { AgentPerformanceTable } from "@/components/settings/agents/AgentPerformanceTable";
export default function AgentsPage() {
  const [agent, setAgent] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const users = useUsers({ page: page - 1, size: 20 });
  const leads = useLeads({ page: 0, size: 5 });
  const assignment = useLeadAssignmentSettings();
  const updateAssignment = useUpdateLeadAssignmentSettings();
  const agents = users.data?.content ?? [];
  const performanceQueries = useQueries({
    queries: agents.map((item) => ({
      queryKey: ["user-performance", item.id],
      queryFn: () => usersService.getPerformance(item.id),
      select: (
        response: Awaited<ReturnType<typeof usersService.getPerformance>>,
      ) => response.data.data,
    })),
  });
  const performance = Object.fromEntries(
    agents.map((item, index) => [item.id, performanceQueries[index]?.data]),
  );
  return (
    <div className="space-y-5">
      <PageHeader
        title="Agents"
        description="Manage access, assignment and team performance"
        actions={
          <Button
            onClick={() => {
              setAgent(null);
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add agent
          </Button>
        }
      />
      {users.isLoading ? (
        <Skeleton className="h-72" />
      ) : users.isError ? (
        <EmptyState
          icon={AlertCircle}
          title="Agents could not be loaded"
          message="Check your connection and refresh this page."
        />
      ) : (
        <section className="surface overflow-hidden">
          <AgentTable
            agents={agents}
            performance={performance}
            onOpen={(selected) => {
              setAgent(selected);
              setOpen(true);
            }}
          />
          <Pagination
            page={page}
            totalPages={Math.max(users.data?.totalPages ?? 1, 1)}
            onPageChange={setPage}
          />
        </section>
      )}
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <AgentPerformanceTable userId={agent?.id ?? agents[0]?.id} />
        <section className="surface p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Lead Assignment</h3>
              <p className="text-xs text-muted-foreground">
                Auto assign new leads
              </p>
            </div>
            <Switch
              checked={Boolean(assignment.data?.enabled)}
              disabled={updateAssignment.isPending}
              onCheckedChange={(enabled) =>
                updateAssignment.mutate({
                  enabled,
                  config: assignment.data?.config ?? {},
                })
              }
            />
          </div>
          <div className="mt-4 divide-y">
            {(leads.data?.content ?? []).map((lead) => (
              <div key={lead.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    {lead.firstName} {lead.lastName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {lead.phone1 || "No number"} ·{" "}
                    {lead.companyName || "No company"} ·{" "}
                    {lead.category || "Uncategorized"}
                  </p>
                </div>
                <span className="text-xs">{lead.conversionScore}%</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            ))}
          </div>
        </section>
      </div>
      <AddAgentModal agent={agent} open={open} onOpenChange={setOpen} />
    </div>
  );
}
