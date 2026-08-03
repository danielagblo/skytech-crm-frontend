import {
  CreditCard,
  GitBranch,
  Mail,
  MessageSquare,
  Pause,
  SkipForward,
} from "lucide-react";
import type { Automation } from "@/types/automation.types";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/shared/EmptyState";
const labelFor = (step: Record<string, unknown>, index: number) =>
  typeof step.label === "string"
    ? step.label
    : typeof step.action === "string"
      ? step.action
      : `Step ${index + 1}`;
export const PaymentAutomation = ({
  items,
  onToggle,
  pending,
}: {
  items: Automation[];
  onToggle: (id: string) => void;
  pending: boolean;
}) => (
  <section className="space-y-5">
    <div>
      <h2 className="text-lg font-semibold">Payment automation</h2>
      <p className="text-sm text-muted-foreground">
        Read-only workflow preview for payment lifecycle communication.
      </p>
    </div>
    {items.length === 0 ? (
      <EmptyState
        icon={CreditCard}
        title="No payment workflows"
        message="Payment automation branches will appear after they are configured."
      />
    ) : (
      items.map((item) => (
        <article key={item.id} className="space-y-4">
          <div className="mx-auto flex max-w-sm items-center gap-3 rounded-xl border-2 border-primary bg-green-50 p-4">
            <div className="flex-1 text-center">
              <p className="eyebrow">Trigger</p>
              <strong>{item.name}</strong>
            </div>
            <Switch
              checked={item.active}
              disabled={pending}
              onCheckedChange={() => onToggle(item.id)}
            />
          </div>
          <div className="mx-auto h-8 w-px bg-gray-300" />
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <GitBranch className="h-4 w-4" />
            {item.steps.length} configured steps
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {item.steps.map((step, index) => (
              <div key={index} className="surface p-4">
                <div className="mb-4 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-xs text-white">
                    {index + 1}
                  </span>
                  <h3 className="font-semibold">{labelFor(step, index)}</h3>
                </div>
                <div className="rounded-xl border bg-white p-3">
                  <p className="text-[10px] uppercase text-muted-foreground">
                    Wait / action
                  </p>
                  <p className="text-sm font-medium">
                    {typeof step.wait === "string"
                      ? step.wait
                      : typeof step.wait_days === "number"
                        ? `Wait ${step.wait_days} days`
                        : "Continue when conditions match"}
                  </p>
                  <div className="mt-2 flex gap-1">
                    {[Pause, MessageSquare, Mail, SkipForward].map(
                      (Icon, control) => (
                        <span key={control} className="rounded border p-1">
                          <Icon className="h-3 w-3" />
                        </span>
                      ),
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>
      ))
    )}
  </section>
);
