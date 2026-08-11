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
  <section className="flex h-full min-w-[245px] flex-1 flex-col xl:max-w-[260px] xl:flex-none min-[2200px]:max-w-none min-[2200px]:flex-1">
    <div className="mb-1 shrink-0 bg-card px-3 py-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-slate-500">{labels[stage]}</h3>
        <span className="text-[10px] text-muted-foreground">
          {deals.length} deals
        </span>
      </div>
      <strong className="mt-1 block text-base font-semibold">
        {formatCurrency(
          deals.reduce((total, deal) => total + deal.contractValue, 0),
        )}
      </strong>
      <span className={`mt-2 block h-0.5 w-full ${bars[stage]}`} />
    </div>
    <Droppable droppableId={stage}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`scrollbar-none min-h-[580px] flex-1 space-y-2 overflow-y-auto overscroll-contain p-1 transition lg:min-h-0 ${snapshot.isDraggingOver ? "bg-primary/15" : "bg-transparent"}`}
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
            <p className="rounded-xl border border-dashed bg-card/70 p-6 text-center text-xs text-muted-foreground">
              Drop a deal here
            </p>
          )}
        </div>
      )}
    </Droppable>
  </section>
);
