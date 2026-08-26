"use client";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { DealStage } from "@/types/api.types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STAGES: DealStage[] = [
  "PROSPECTING",
  "NEGOTIATION",
  "SETTLEMENT",
  "PAYMENT",
  "CLIENT_RETENTION",
];
const meta: Record<DealStage, { label: string; dot: string }> = {
  PROSPECTING: { label: "Prospecting", dot: "bg-violet-500" },
  NEGOTIATION: { label: "Negotiation", dot: "bg-blue-500" },
  SETTLEMENT: { label: "Settlement", dot: "bg-amber-500" },
  PAYMENT: { label: "Payment", dot: "bg-green-500" },
  CLIENT_RETENTION: { label: "Retention", dot: "bg-pink-500" },
};

export const DealStageStepper = ({
  stage,
  pending,
  paidInFull = false,
  onChange,
}: {
  stage: DealStage;
  pending?: boolean;
  paidInFull?: boolean;
  onChange: (stage: DealStage) => void;
}) => {
  const index = STAGES.indexOf(stage);
  const previous = index > 0 ? STAGES[index - 1] : null;
  const next = index < STAGES.length - 1 ? STAGES[index + 1] : null;
  const retentionBlocked = next === "CLIENT_RETENTION" && !paidInFull;
  return (
    <section className="rounded-2xl border bg-muted/40 p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="eyebrow">Pipeline stage</p>
        <div className="flex gap-1.5">
          <Button
            size="sm"
            variant="outline"
            disabled={!previous || pending}
            onClick={() => previous && onChange(previous)}
          >
            <ArrowLeft className="size-3.5" />
            Previous
          </Button>
          <Button
            size="sm"
            disabled={!next || pending || retentionBlocked}
            onClick={() => next && onChange(next)}
          >
            Next stage
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </div>
      <div className="flex items-start">
        {STAGES.map((item, itemIndex) => {
          const reached = itemIndex <= index;
          return (
            <div
              key={item}
              className={cn(
                "flex items-start",
                itemIndex < STAGES.length - 1 && "flex-1",
              )}
            >
              <button
                type="button"
                className="flex flex-col items-center gap-1.5"
                disabled={pending || (item === "CLIENT_RETENTION" && !paidInFull)}
                onClick={() => onChange(item)}
              >
                <span
                  className={cn(
                    "h-2.5 w-2.5 rounded-full transition",
                    item === stage
                      ? meta[item].dot
                      : reached
                        ? "bg-foreground/40"
                        : "bg-border",
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    item === stage
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {meta[item].label}
                </span>
              </button>
              {itemIndex < STAGES.length - 1 && (
                <span
                  className={cn(
                    "mx-1 mt-[4px] h-0.5 flex-1 rounded-full",
                    reached ? "bg-foreground/30" : "bg-border",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      {!paidInFull && stage !== "CLIENT_RETENTION" && (
        <p className="mt-3 text-xs text-muted-foreground">
          Retention unlocks only after the agreed contract amount has been paid in full.
        </p>
      )}
    </section>
  );
};
