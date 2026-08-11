"use client";
import { AlertCircle } from "lucide-react";
import { useDeal, useDealLogs, useUpdateDealStage } from "@/hooks/useDeals";
import { useLead } from "@/hooks/useLeads";
import { useUsers } from "@/hooks/useUsers";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DealStageStepper } from "./DealStageStepper";
import { NegotiationLog } from "./logs/NegotiationLog";
import { SettlementLog } from "./logs/SettlementLog";
import { PaymentLog } from "./logs/PaymentLog";
import { ClientRetentionLog } from "./logs/ClientRetentionLog";
export const DealDetailPage = ({ dealId }: { dealId: string }) => {
  const deal = useDeal(dealId);
  const logs = useDealLogs(dealId);
  const users = useUsers({ page: 0, size: 100 });
  const lead = useLead(deal.data?.leadId ?? "");
  const updateStage = useUpdateDealStage();
  if (deal.isLoading) return <Skeleton className="h-96 max-w-3xl" />;
  if (deal.isError || !deal.data)
    return (
      <EmptyState
        icon={AlertCircle}
        title="Deal could not be loaded"
        message="It may have been deleted or you may not have permission to view it."
      />
    );
  const item = deal.data;
  const team = users.data?.content ?? [];
  const allLogs = logs.data ?? [];
  return (
    <div className="space-y-5">
      <PageHeader
        title={item.title}
        description={`${lead.data?.companyName || "No linked company"} · ${lead.data?.firstName || "No linked contact"}`}
      />
      <DealStageStepper
        stage={item.stage}
        pending={updateStage.isPending}
        paidInFull={item.paidInFull}
        onChange={(stage) => updateStage.mutate({ id: item.id, stage })}
      />
      <Tabs defaultValue="negotiation">
        <TabsList>
          <TabsTrigger value="negotiation">Negotiation</TabsTrigger>
          <TabsTrigger value="settlement">Settlement</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
        </TabsList>
        <div className="surface mt-4 max-w-3xl p-6">
          <TabsContent value="negotiation">
            <NegotiationLog
              deal={item}
              logs={allLogs.filter((log) => log.logType === "NEGOTIATION")}
              users={team}
            />
          </TabsContent>
          <TabsContent value="settlement">
            <SettlementLog
              deal={item}
              logs={allLogs.filter((log) => log.logType === "SETTLEMENT")}
              users={team}
            />
          </TabsContent>
          <TabsContent value="payment">
            <PaymentLog
              deal={item}
              logs={allLogs.filter((log) => log.logType === "PAYMENT")}
              users={team}
            />
          </TabsContent>
          <TabsContent value="retention">
            <ClientRetentionLog
              deal={item}
              logs={allLogs.filter((log) => log.logType === "CLIENT_RETENTION")}
              users={team}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
