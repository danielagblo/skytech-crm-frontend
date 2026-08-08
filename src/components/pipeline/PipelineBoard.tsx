"use client";
import { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { AlertCircle } from "lucide-react";
import type { Deal } from "@/types/deal.types";
import type { DealStage } from "@/types/api.types";
import { dealsService } from "@/services/deals.service";
import { usePipeline, useUpdateDealStage } from "@/hooks/useDeals";
import { useLeads } from "@/hooks/useLeads";
import { useUsers } from "@/hooks/useUsers";
import { PipelineColumn } from "./PipelineColumn";
import { DealDetail } from "./DealDetail";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";

const stages: DealStage[] = [
  "PROSPECTING",
  "NEGOTIATION",
  "SETTLEMENT",
  "PAYMENT",
  "CLIENT_RETENTION",
];
export const PipelineBoard = () => {
  const pipeline = usePipeline();
  const leads = useLeads({ page: 0, size: 100 });
  const users = useUsers({ page: 0, size: 100 });
  const [stageOverrides, setStageOverrides] = useState<
    Record<string, DealStage>
  >({});
  const [selected, setSelected] = useState<Deal | null>(null);
  const updateStage = useUpdateDealStage();
  const sourceDeals = useMemo(
    () => stages.flatMap((stage) => pipeline.data?.[stage] ?? []),
    [pipeline.data],
  );
  const items = useMemo(
    () =>
      sourceDeals.map((deal) =>
        stageOverrides[deal.id]
          ? { ...deal, stage: stageOverrides[deal.id] }
          : deal,
      ),
    [sourceDeals, stageOverrides],
  );
  const logQueries = useQueries({
    queries: items.map((deal) => ({
      queryKey: ["deal-logs", deal.id],
      queryFn: () => dealsService.getLogs(deal.id),
      select: (response: Awaited<ReturnType<typeof dealsService.getLogs>>) =>
        response.data.data.content,
      staleTime: 60_000,
    })),
  });
  const logs = Object.fromEntries(
    items.map((deal, index) => [deal.id, logQueries[index]?.data ?? []]),
  );

  const commitStage = (id: string, stage: DealStage) => {
    const previous = stageOverrides[id];
    setStageOverrides((current) => ({
      ...current,
      [id]: stage,
    }));
    setSelected((current) =>
      current && current.id === id ? { ...current, stage } : current,
    );
    updateStage.mutate(
      { id, stage },
      {
        onError: () => {
          const original =
            previous ?? sourceDeals.find((deal) => deal.id === id)?.stage;
          setStageOverrides((current) => {
            const next = { ...current };
            if (previous) next[id] = previous;
            else delete next[id];
            return next;
          });
          setSelected((current) =>
            current && current.id === id
              ? { ...current, stage: original ?? stage }
              : current,
          );
        },
      },
    );
  };
  const drop = (result: DropResult) => {
    if (!result.destination) return;
    const stage = result.destination.droppableId as DealStage;
    if (
      result.source.droppableId === stage &&
      result.source.index === result.destination.index
    )
      return;
    commitStage(result.draggableId, stage);
  };
  if (pipeline.isLoading || leads.isLoading || users.isLoading)
    return (
      <div className="flex gap-4 overflow-hidden">
        {stages.map((stage) => (
          <Skeleton key={stage} className="h-[600px] min-w-[285px] flex-1" />
        ))}
      </div>
    );
  if (pipeline.isError)
    return (
      <EmptyState
        icon={AlertCircle}
        title="Pipeline could not be loaded"
        message="Check your connection and refresh this page to try again."
      />
    );
  return (
    <>
      <DragDropContext onDragEnd={drop}>
        <div className="dot-grid scrollbar-thin flex min-h-[620px] gap-4 overflow-x-auto rounded-2xl border p-4">
          {stages.map((stage) => (
            <PipelineColumn
              key={stage}
              stage={stage}
              deals={items.filter((deal) => deal.stage === stage)}
              leads={leads.data?.content ?? []}
              users={users.data?.content ?? []}
              logs={logs}
              onOpen={setSelected}
            />
          ))}
        </div>
      </DragDropContext>
      <DealDetail
        deal={selected}
        lead={(leads.data?.content ?? []).find(
          (lead) => lead.id === selected?.leadId,
        )}
        users={users.data?.content ?? []}
        open={Boolean(selected)}
        pending={updateStage.isPending}
        onOpenChange={(value) => !value && setSelected(null)}
        onStageChange={(stage) => selected && commitStage(selected.id, stage)}
      />
    </>
  );
};
