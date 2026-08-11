"use client";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import type { Deal, DealLog } from "@/types/deal.types";
import type { Lead } from "@/types/lead.types";
import type { User } from "@/types/user.types";
import type { DealStage } from "@/types/api.types";
import { DealCard } from "./DealCard";
import { formatCurrency } from "@/lib/utils";
const labels: Record<DealStage, string> = {
  PROSPECTING: "Prospecting",
  NEGOTIATION: "Negotiation",
  SETTLEMENT: "Settlement",
  PAYMENT: "Payment",
  CLIENT_RETENTION: "Client Retention",
};
const bars: Record<DealStage, string> = {
  PROSPECTING: "bg-violet-500",
  NEGOTIATION: "bg-blue-500",
  SETTLEMENT: "bg-amber-500",
  PAYMENT: "bg-green-500",
  CLIENT_RETENTION: "bg-pink-500",
};

export const PipelineColumn = ({
  stage,
  deals,
  leads,
  users,
  logs,
  onOpen,
}: {
  stage: DealStage;
  deals: Deal[];
  leads: Lead[];
  users: User[];
  logs: Record<string, DealLog[]>;
  onOpen: (deal: Deal) => void;
}) => (
  <section className="min-w-[250px] flex-1 2xl:min-w-[265px] min-[2200px]:min-w-0">
    <div className="mb-2 border-b bg-card px-2 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${bars[stage]}`} />
          <h3 className="text-sm font-semibold">{labels[stage]}</h3>
          <span className="rounded-full bg-muted px-2 text-xs">
            {deals.length}
          </span>
        </div>
        <strong className="text-xs">
          {formatCurrency(
            deals.reduce((total, deal) => total + deal.contractValue, 0),
          )}
        </strong>
      </div>
    </div>
    <Droppable droppableId={stage}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`min-h-[520px] space-y-2 p-1.5 transition ${snapshot.isDraggingOver ? "bg-primary/15" : "bg-card/35"}`}
        >
          {deals.map((deal, index) => (
            <Draggable
              key={deal.id}
              draggableId={deal.id}
              index={index}
              disableInteractiveElementBlocking
            >
              {(drag) => (
                <div
                  ref={drag.innerRef}
                  {...drag.draggableProps}
                  {...drag.dragHandleProps}
                >
                  <DealCard
                    deal={deal}
                    lead={leads.find((lead) => lead.id === deal.leadId)}
                    assignee={users.find(
                      (user) => user.id === deal.assignedToId,
                    )}
                    logs={logs[deal.id] ?? []}
                    onClick={() => onOpen(deal)}
                  />
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
          {deals.length === 0 && (
            <p className="rounded-xl border border-dashed bg-white/70 p-6 text-center text-xs text-muted-foreground">
              Drop a deal here
            </p>
          )}
        </div>
      )}
    </Droppable>
  </section>
);
