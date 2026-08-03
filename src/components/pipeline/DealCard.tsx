import { CalendarClock, MessageSquare, Phone, UserRound } from "lucide-react";
import type { Deal, DealLog } from "@/types/deal.types";
import type { Lead } from "@/types/lead.types";
import type { User, UserSummary } from "@/types/user.types";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { AssigneeStack } from "@/components/shared/AssigneeStack";
import { formatCurrency, formatDate } from "@/lib/utils";

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
  const services = [
    ["DOMAIN", deal.domainExpiry, deal.domainCost],
    ["HOSTING", deal.hostingExpiry, deal.hostingCost],
    ["MAINTENANCE", deal.maintenanceExpiry, deal.maintenanceCost],
  ] as const;
  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl border bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="line-clamp-2 text-sm font-semibold">{deal.title}</h4>
        {deal.priority && <PriorityBadge priority={deal.priority} />}
      </div>
      <p className="mt-1 text-xs font-semibold text-green-700">
        {formatCurrency(deal.contractValue)}
      </p>
      <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
        <p className="flex items-center gap-2">
          <UserRound className="h-3.5 w-3.5" />
          {lead
            ? `${lead.firstName || "Unnamed"} · ${lead.role || "Contact"}`
            : "No linked lead"}
        </p>
        <p className="flex items-center gap-2">
          <Phone className="h-3.5 w-3.5" />
          {lead?.phone1 || "No phone number"}
        </p>
        <p className="flex items-center gap-2">
          <CalendarClock className="h-3.5 w-3.5" />
          {followUp
            ? `Follow-up ${formatDate(followUp)}`
            : `Updated ${formatDate(deal.updatedAt)}`}
        </p>
      </div>
      {deal.stage === "PAYMENT" && (
        <p
          className={`mt-3 rounded-md px-2 py-1 text-xs font-semibold ${deal.paidInFull ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
        >
          {deal.paidInFull
            ? "Paid in full"
            : `${formatCurrency(deal.arrears)} in arrears`}
        </p>
      )}
      {deal.stage === "CLIENT_RETENTION" && (
        <div className="mt-3 space-y-1 border-t pt-2 text-[10px] text-muted-foreground">
          {services.map(
            ([type, expiry, cost]) =>
              expiry && (
                <p key={type}>
                  {type}: {formatDate(expiry)} · {formatCurrency(cost)}
                </p>
              ),
          )}
        </div>
      )}
      <div className="mt-3 flex items-center justify-between border-t pt-2">
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
