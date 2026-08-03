"use client";

import { useState } from "react";
import {
  Cake,
  ChevronRight,
  Mail,
  MessageSquare,
  Pause,
  SkipForward,
} from "lucide-react";
import type { Automation } from "@/types/automation.types";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
const controls = [
  ["Stop trigger", Pause],
  ["Stop SMS", MessageSquare],
  ["Stop Email", Mail],
  ["Jump step", SkipForward],
] as const;
const textValue = (value: unknown, fallback: string) =>
  typeof value === "string" ? value : fallback;
export const BirthdayAutomation = ({
  items,
  onToggle,
  pending,
}: {
  items: Automation[];
  onToggle: (id: string) => void;
  pending: boolean;
}) => {
  const [selected, setSelected] = useState<Automation | null>(null);
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Birthday automation</h2>
        <p className="text-sm text-muted-foreground">
          Celebrate contacts automatically on their birthday.
        </p>
      </div>
      {items.length === 0 ? (
        <EmptyState
          icon={Cake}
          title="No birthday automations"
          message="Create a birthday automation through the automation API to configure the first workflow."
        />
      ) : (
        items.map((item) => (
          <article
            key={item.id}
            className="surface overflow-hidden transition hover:border-primary/40"
          >
            <div className="flex items-center gap-3 border-b p-4">
              <span className="rounded-full bg-pink-50 p-3">
                <Cake className="h-5 w-5 text-pink-600" />
              </span>
              <div className="flex-1">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-xs text-muted-foreground">
                  Trigger:{" "}
                  {textValue(
                    item.triggerConfig.date,
                    textValue(item.triggerConfig.trigger, "Contact birthday"),
                  )}
                </p>
              </div>
              <Switch
                checked={item.active}
                disabled={pending}
                onCheckedChange={() => onToggle(item.id)}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label={`Open ${item.name}`}
                onClick={() => setSelected(item)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <p className="eyebrow">Message preview</p>
              <p className="mt-2 rounded-xl bg-muted p-3 text-sm">
                {textValue(
                  item.steps[0]?.message,
                  "Birthday greeting configured in this workflow.",
                )}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {controls.map(([label, Icon]) => (
                  <span
                    key={label}
                    className="flex items-center gap-1 rounded-lg border px-2 py-1.5 text-xs"
                  >
                    <Icon className="h-3 w-3" />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))
      )}
      <Sheet
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <SheetContent className="overflow-y-auto p-0 sm:max-w-xl">
          <SheetHeader className="border-b p-6 pr-14">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300">
              <Cake className="h-6 w-6" />
            </div>
            <SheetTitle>{selected?.name ?? "Birthday automation"}</SheetTitle>
            <SheetDescription>
              Review the trigger, delivery steps and message that this contact
              will receive.
            </SheetDescription>
          </SheetHeader>
          {selected && (
            <div className="space-y-6 p-6">
              <div className="rounded-xl border bg-muted/40 p-4">
                <p className="eyebrow">Trigger</p>
                <p className="mt-1 font-semibold">
                  {textValue(
                    selected.triggerConfig.date,
                    textValue(
                      selected.triggerConfig.trigger,
                      "Contact birthday",
                    ),
                  )}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  The workflow starts automatically on the contact&apos;s saved
                  birthday.
                </p>
              </div>
              <div>
                <p className="eyebrow mb-4">Workflow</p>
                <div className="relative space-y-4 before:absolute before:bottom-5 before:left-5 before:top-5 before:w-px before:bg-border">
                  {[
                    [
                      "1",
                      "Prepare greeting",
                      "Personalize the contact name and approved message.",
                    ],
                    [
                      "2",
                      "Send SMS",
                      "Deliver through the contact's opted-in mobile line.",
                    ],
                    [
                      "3",
                      "Send email",
                      "Send the email version when an address is available.",
                    ],
                  ].map(([step, title, detail]) => (
                    <div
                      key={step}
                      className="relative flex gap-4 rounded-xl border bg-card p-4"
                    >
                      <span className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
                        {step}
                      </span>
                      <div>
                        <p className="font-semibold">{title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="eyebrow">Message preview</p>
                <blockquote className="mt-3 rounded-xl border-l-4 border-l-primary bg-muted/50 p-4 text-sm leading-6">
                  {textValue(
                    selected.steps[0]?.message,
                    "Birthday greeting configured in this workflow.",
                  )}
                </blockquote>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {controls.map(([label, Icon]) => (
                  <Button
                    key={label}
                    variant="outline"
                    className="justify-start"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </section>
  );
};
