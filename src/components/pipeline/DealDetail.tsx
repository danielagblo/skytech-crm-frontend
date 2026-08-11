"use client";
import { useState } from "react";
import { Calendar, Mail, MapPin, Phone, UserRound } from "lucide-react";
import type { Deal } from "@/types/deal.types";
import type { Lead } from "@/types/lead.types";
import type { User, UserSummary } from "@/types/user.types";
import type { DealStage } from "@/types/api.types";
import { useDealLogs } from "@/hooks/useDeals";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { AssigneeStack } from "@/components/shared/AssigneeStack";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { StageBadge } from "@/components/shared/StageBadge";
import { formatDate } from "@/lib/utils";
import { DealStageStepper } from "./DealStageStepper";
import { NegotiationLog } from "./logs/NegotiationLog";
import { SettlementLog } from "./logs/SettlementLog";
import { PaymentLog } from "./logs/PaymentLog";
import { ClientRetentionLog } from "./logs/ClientRetentionLog";
const order: DealStage[] = [
  "PROSPECTING",
  "NEGOTIATION",
  "SETTLEMENT",
  "PAYMENT",
  "CLIENT_RETENTION",
];

export const DealDetail = ({
  deal,
  lead,
  users,
  open,
  pending,
  onOpenChange,
  onStageChange,
}: {
  deal: Deal | null;
  lead?: Lead;
  users: User[];
  open: boolean;
  pending?: boolean;
  onOpenChange: (value: boolean) => void;
  onStageChange: (stage: DealStage) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const logs = useDealLogs(deal?.id ?? "");
  if (!deal) return null;
  const reached = (stage: DealStage) =>
    order.indexOf(stage) <= order.indexOf(deal.stage) &&
    stage !== "PROSPECTING";
  const assignee = users.find((user) => user.id === deal.assignedToId);
  const creator = users.find((user) => user.id === deal.createdById);
  const latestFollowUp = (logs.data ?? [])
    .map((log) => log.followUpAt || log.settlementFollowUp)
    .filter((date): date is string => Boolean(date))
    .sort()[0];
  const stageLogs = (
    type: "NEGOTIATION" | "SETTLEMENT" | "PAYMENT" | "CLIENT_RETENTION",
  ) => (logs.data ?? []).filter((log) => log.logType === type);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="max-w-xl p-0 sm:max-w-[min(56rem,50vw)]">
        <div className="p-6">
          <SheetHeader>
            <div className="flex items-center gap-2">
              <StageBadge stage={deal.stage} />
              {deal.priority && <PriorityBadge priority={deal.priority} />}
            </div>
            <SheetTitle className="mt-2 text-xl">{deal.title}</SheetTitle>
          </SheetHeader>
          <DealStageStepper
            stage={deal.stage}
            pending={pending}
            paidInFull={deal.paidInFull}
            onChange={onStageChange}
          />
          <div className="rounded-2xl bg-muted/60 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow">Assignee</p>
                <div className="mt-2">
                  {assignee ? (
                    <AssigneeStack users={[assignee as UserSummary]} />
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Unassigned
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="eyebrow">Created by</p>
                <p className="mt-2 text-sm font-medium">
                  {creator
                    ? `${creator.firstName} ${creator.lastName}`
                    : "CRM user"}
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <p className="flex items-center gap-2">
                <UserRound className="h-4 w-4 text-muted-foreground" />
                {lead
                  ? `${lead.firstName || "Unnamed"} · ${lead.role || "Contact"}`
                  : "No linked lead"}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {lead?.phone1 || "Not provided"}
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {lead?.email || "Not provided"}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {lead?.address || "Not provided"}
              </p>
              <p className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {latestFollowUp
                  ? `Follow-up ${formatDate(latestFollowUp)}`
                  : "No follow-up scheduled"}
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-4 text-xs sm:grid-cols-4">
              <div>
                <p className="eyebrow">Industry</p>
                <p className="mt-1">{lead?.industry || "—"}</p>
              </div>
              <div>
                <p className="eyebrow">Launch date</p>
                <p className="mt-1">
                  {lead?.launchTimeline?.replaceAll("_", " ") || "—"}
                </p>
              </div>
              <div>
                <p className="eyebrow">Public office</p>
                <p className="mt-1">{lead?.hasPublicOffice ? "Yes" : "No"}</p>
              </div>
              <div>
                <p className="eyebrow">Meeting</p>
                <p className="mt-1">
                  {lead?.meetingArranged ? "Confirmed" : "Not arranged"}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-xs">
              <label className="flex items-center gap-2">
                <Checkbox checked={Boolean(lead?.smsOptIn)} disabled />
                SMS reminder
              </label>
              <label className="flex items-center gap-2">
                <Checkbox checked={Boolean(lead?.emailOptIn)} disabled />
                Email reminder
              </label>
              <label className="flex items-center gap-2">
                <Checkbox checked={Boolean(lead?.newsletterOptIn)} disabled />
                Newsletter
              </label>
            </div>
            <p
              className={`mt-4 text-sm text-muted-foreground ${expanded ? "" : "line-clamp-3"}`}
            >
              {lead?.description || deal.notes || "No description provided."}
            </p>
            <button
              onClick={() => setExpanded((value) => !value)}
              className="mt-1 text-xs font-semibold text-green-700"
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          </div>
        </div>
        {deal.stage === "PROSPECTING" ? (
          <div className="mx-6 rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Move this deal to Negotiation to begin logging client interactions.
          </div>
        ) : logs.isLoading ? (
          <div className="space-y-3 px-6">
            <Skeleton className="h-10" />
            <Skeleton className="h-56" />
          </div>
        ) : (
          <Tabs defaultValue="negotiation" className="px-6 pb-8">
            <TabsList className="w-full justify-start overflow-x-auto">
              {reached("NEGOTIATION") && (
                <TabsTrigger value="negotiation">Negotiation</TabsTrigger>
              )}
              {reached("SETTLEMENT") && (
                <TabsTrigger value="settlement">Settlement</TabsTrigger>
              )}
              {reached("PAYMENT") && (
                <TabsTrigger value="payment">Payment</TabsTrigger>
              )}
              {reached("CLIENT_RETENTION") && (
                <TabsTrigger value="retention">Retention</TabsTrigger>
              )}
            </TabsList>
            {reached("NEGOTIATION") && (
              <TabsContent value="negotiation">
                <NegotiationLog
                  deal={deal}
                  logs={stageLogs("NEGOTIATION")}
                  users={users}
                />
              </TabsContent>
            )}
            {reached("SETTLEMENT") && (
              <TabsContent value="settlement">
                <SettlementLog
                  deal={deal}
                  logs={stageLogs("SETTLEMENT")}
                  users={users}
                />
              </TabsContent>
            )}
            {reached("PAYMENT") && (
              <TabsContent value="payment">
                <PaymentLog
                  deal={deal}
                  logs={stageLogs("PAYMENT")}
                  users={users}
                />
              </TabsContent>
            )}
            {reached("CLIENT_RETENTION") && (
              <TabsContent value="retention">
                <ClientRetentionLog
                  deal={deal}
                  logs={stageLogs("CLIENT_RETENTION")}
                  users={users}
                />
              </TabsContent>
            )}
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
};
