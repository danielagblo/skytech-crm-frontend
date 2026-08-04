"use client";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useContactSegments } from "@/hooks/useBroadcast";
import { useLeads } from "@/hooks/useLeads";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DEAL_STAGE_LABELS } from "@/lib/crm-options";
const options = [
  ["all", "All leads"],
  ["NEGOTIATION", "Negotiations"],
  ["SETTLEMENT", "Settlement"],
  ["PAYMENT", "Payment"],
] as const;
export const ContactSegmentSelector = ({
  selectedLeadIds,
  selectedStages,
  onLeadIdsChange,
  onStagesChange,
}: {
  selectedLeadIds: string[];
  selectedStages: string[];
  onLeadIdsChange: (ids: string[]) => void;
  onStagesChange: (stages: string[]) => void;
}) => {
  const segments = useContactSegments();
  const leads = useLeads({ page: 0, size: 100 });
  const [search, setSearch] = useState("");
  const leadItems = useMemo(
    () =>
      (leads.data?.content ?? []).filter((lead) => {
        const haystack = `${lead.firstName ?? ""} ${lead.lastName ?? ""} ${lead.companyName ?? ""}`.toLowerCase();
        return haystack.includes(search.toLowerCase());
      }),
    [leads.data?.content, search],
  );
  return (
    <aside className="surface h-fit overflow-hidden">
      <div className="border-b p-4">
        <h3 className="font-semibold">Broadcast audience</h3>
        <p className="text-xs text-muted-foreground">
          Pick one or more contact groups and specific leads.
        </p>
      </div>
      {segments.isLoading ? (
        <div className="space-y-2 p-4">
          {options.map(([id]) => (
            <Skeleton key={id} className="h-10" />
          ))}
        </div>
      ) : (
        <div className="space-y-4 p-4">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Pipeline stages
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {options.slice(1).map(([id, name]) => {
                const count = id === "all" ? 0 : segments.data?.byStage[id] ?? 0;
                return (
                  <label
                    key={id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={selectedStages.includes(id)}
                      onCheckedChange={(checked) => {
                        const next = checked
                          ? [...selectedStages, id]
                          : selectedStages.filter((stage) => stage !== id);
                        onStagesChange(next);
                      }}
                    />
                    <span className="flex-1 text-sm font-medium">
                      {name}
                    </span>
                    <span className="rounded-full bg-muted px-2 py-1 text-xs">
                      {count.toLocaleString()}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Specific contacts
            </p>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search contacts"
              />
            </div>
            <div className="max-h-72 divide-y overflow-y-auto rounded-lg border">
              {leadItems.map((lead) => {
                const label = `${lead.firstName ?? ""} ${lead.lastName ?? ""}`.trim() || lead.companyName || lead.email || lead.id;
                return (
                  <label
                    key={lead.id}
                    className="flex cursor-pointer items-center gap-3 p-3 hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={selectedLeadIds.includes(lead.id)}
                      onCheckedChange={(checked) => {
                        const next = checked
                          ? [...selectedLeadIds, lead.id]
                          : selectedLeadIds.filter((id) => id !== lead.id);
                        onLeadIdsChange(next);
                      }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {label}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {lead.companyName || lead.category || "No company"}
                      </span>
                    </span>
                  </label>
                );
              })}
              {!leadItems.length && (
                <div className="p-4 text-sm text-muted-foreground">
                  No contacts match this search.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
