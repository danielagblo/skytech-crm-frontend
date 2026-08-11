import {
  CalendarClock,
  ChevronDown,
  MessageSquare,
  Phone,
  UserRound,
} from "lucide-react";
import type { Deal, DealLog } from "@/types/deal.types";
import type { Lead } from "@/types/lead.types";
import type { User, UserSummary } from "@/types/user.types";
import type { DealStage } from "@/types/api.types";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { AssigneeStack } from "@/components/shared/AssigneeStack";
import { formatCurrency, formatDate } from "@/lib/utils";

const progression: DealStage[] = [
  "NEGOTIATION",
  "SETTLEMENT",
  "PAYMENT",
  "CLIENT_RETENTION",
];

const rowLabel: Record<DealStage, string> = {
  PROSPECTING: "Prospecting",
  NEGOTIATION: "Contact info",
  SETTLEMENT: "Settlement",
  PAYMENT: "Payment",
  CLIENT_RETENTION: "Client retention",
};

export const DealCard = ({
  deal,
  lead,
  assignee,
  logs,
  onClick,
}: {
  deal: Deal;
  lead?: Lead;
  assignee?: User;
  logs: DealLog[];
  onClick: () => void;
}) => {
  const followUp = logs
    .map((log) => log.followUpAt || log.settlementFollowUp)
    .filter((date): date is string => Boolean(date))
    .sort()[0];
  const reachedIndex = progression.indexOf(deal.stage);
  const reached = progression.slice(0, Math.max(1, reachedIndex + 1));
  const services = [
    ["Hosting", deal.hostingExpiry, deal.hostingCost],
    ["Domain", deal.domainExpiry, deal.domainCost],
    ["Maintenance", deal.maintenanceExpiry, deal.maintenanceCost],
  ] as const;

  return (
    <button
      onClick={onClick}
      className="w-full border bg-card text-left shadow-[0_1px_2px_rgba(15,23,42,.03)] transition hover:border-primary hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2 px-2 py-2">
        <div className="min-w-0">
          <h4 className="truncate text-sm font-medium">{deal.title}</h4>
          <p className="mt-0.5 truncate text-[9px] text-muted-foreground">
            {lead?.role || "Chief executive officer"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span className="text-[10px] font-medium">
            {formatCurrency(deal.contractValue)}
          </span>
          {deal.priority && <PriorityBadge priority={deal.priority} />}
        </div>
      </div>

      {deal.stage === "PROSPECTING" ? (
        <div className="space-y-1.5 border-t px-2 py-2 text-xs text-muted-foreground">
          <p className="flex items-center gap-2">
            <UserRound className="h-3.5 w-3.5" />
            Manager{" "}
            <span className="ml-auto text-foreground">
              {assignee
                ? `${assignee.firstName} ${assignee.lastName}`
                : "Unassigned"}
            </span>
          </p>
          <p className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5" />
            Phone{" "}
            <span className="ml-auto text-foreground">
              {lead?.phone1 || "No number"}
            </span>
          </p>
          <p className="flex items-center gap-2">
            <CalendarClock className="h-3.5 w-3.5" />
            Company{" "}
            <span className="ml-auto truncate text-foreground">
              {lead?.companyName || "No company"}
            </span>
          </p>
        </div>
      ) : (
        <div className="border-t text-xs">
          {reached.map((stage) => (
            <div
              key={stage}
              className="flex items-center justify-between border-b px-2 py-1.5"
            >
              <span>{rowLabel[stage]}</span>
              <ChevronDown className="h-3 w-3" />
            </div>
          ))}
          <div className="px-2 py-1.5 text-[10px]">
            <span className="font-semibold">● Follow-up:</span>{" "}
            {followUp ? formatDate(followUp) : "Today, 11:23 PM"}
          </div>
        </div>
      )}

      {deal.stage === "PAYMENT" && (
        <p
          className={`border-t px-2 py-1.5 text-[10px] font-semibold ${deal.paidInFull ? "text-green-700" : "text-red-700"}`}
        >
          {deal.paidInFull
            ? "● Arrears: Paid in full"
            : `● Arrears: ${formatCurrency(deal.arrears)}`}
        </p>
      )}
      {deal.stage === "CLIENT_RETENTION" && (
        <div className="grid grid-cols-3 gap-1 border-t px-2 py-2 text-[9px] text-muted-foreground">
          {services.map(
            ([type, expiry, cost]) =>
              expiry && (
                <p key={type}>
                  <span className="font-medium text-foreground">{type}</span>
                  <br />
                  {formatDate(expiry)}
                  <br />
                  {formatCurrency(cost)}
                </p>
              ),
          )}
        </div>
      )}
      <div className="flex items-center justify-between border-t px-2 py-1.5">
        {assignee ? (
          <AssigneeStack users={[assignee as UserSummary]} />
        ) : (
          <span className="text-[10px] text-muted-foreground">Unassigned</span>
        )}
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <MessageSquare className="h-3 w-3" />
          {deal.notes ? 1 : 0}
        </span>
      </div>
    </button>
  );
};
