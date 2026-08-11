import {
  ArrowDown,
  CheckCircle2,
  CreditCard,
  Mail,
  MessageSquare,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";
import type { Automation, AutomationStep } from "@/types/automation.types";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/shared/EmptyState";

const labelFor = (step: AutomationStep, index: number) =>
  step.label || step.action || `Delivery step ${index + 1}`;

export const PaymentAutomation = ({
  items,
  onToggle,
  pending,
  onEdit,
}: {
  items: Automation[];
  onToggle: (id: string) => void;
  pending: boolean;
  onEdit: (automation: Automation) => void;
}) => (
  <section className="space-y-5">
    <div>
      <h2 className="text-lg font-semibold">Payment automations</h2>
      <p className="text-sm text-muted-foreground">
        Event-driven acknowledgements sent after a positive payment is recorded.
      </p>
    </div>
    {items.length === 0 ? (
      <EmptyState
        icon={CreditCard}
        title="No payment workflows"
        message="Create a payment automation to acknowledge recorded payments."
      />
    ) : (
      items.map((item) => (
        <article key={item.id} className="surface overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/35 p-4">
            <div>
              <p className="eyebrow">Payment workflow</p>
              <h3 className="font-semibold">{item.name}</h3>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={item.active}
                disabled={pending}
                onCheckedChange={() => onToggle(item.id)}
              />
              <button
                type="button"
                className="rounded-md border bg-background px-3 py-1.5 text-xs hover:bg-muted"
                onClick={() => onEdit(item)}
              >
                Edit workflow
              </button>
            </div>
          </div>

          <div className="grid gap-6 p-5 lg:grid-cols-[minmax(230px,.75fr)_minmax(0,1.6fr)]">
            <div className="space-y-3">
              <FlowNode
                icon={ReceiptText}
                eyebrow="Trigger"
                title="Positive payment recorded"
                body="Runs for invoice payments and positive payment deal logs."
              />
              <ArrowDown className="mx-auto h-5 w-5 text-muted-foreground" />
              <FlowNode
                icon={ShieldCheck}
                eyebrow="Eligibility"
                title="Consent and contact checked"
                body="SMS/email is skipped when the lead has not opted in or has no reachable address."
              />
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold">Sequential delivery</p>
                <span className="text-xs text-muted-foreground">
                  {item.steps.length} step{item.steps.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="space-y-2">
                {item.steps.map((step, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    className="grid gap-3 rounded-xl border bg-background p-3 sm:grid-cols-[36px_1fr_auto] sm:items-center"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 font-semibold">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium">{labelFor(step, index)}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {step.message}
                      </p>
                    </div>
                    <span className="inline-flex w-fit items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium">
                      {step.channel === "EMAIL" ? (
                        <Mail className="h-3.5 w-3.5" />
                      ) : (
                        <MessageSquare className="h-3.5 w-3.5" />
                      )}
                      {step.channel}
                    </span>
                  </div>
                ))}
                <div className="flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 p-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  Workflow finishes after all configured messages are attempted.
                </div>
              </div>
            </div>
          </div>
        </article>
      ))
    )}
  </section>
);

const FlowNode = ({
  icon: Icon,
  eyebrow,
  title,
  body,
}: {
  icon: typeof ReceiptText;
  eyebrow: string;
  title: string;
  body: string;
}) => (
  <div className="rounded-xl border bg-background p-4">
    <div className="flex gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/15">
        <Icon className="h-4 w-4 text-success" />
      </span>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{body}</p>
      </div>
    </div>
  </div>
);
