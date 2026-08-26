"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Info, Plus, Trash2, Workflow } from "lucide-react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { useLeads } from "@/hooks/useLeads";
import {
  useCreateAutomation,
  useDeleteAutomation,
  useUpdateAutomation,
} from "@/hooks/useAutomations";
import type { AutomationType } from "@/types/api.types";
import type {
  Automation,
  AutomationChannel,
  AutomationOptions,
  AutomationTypeOption,
} from "@/types/automation.types";

const stepSchema = z.object({
  channel: z.enum(["SMS", "EMAIL", "BOTH"]),
  subject: z.string().max(200),
  message: z.string().trim().min(1, "Enter the message.").max(2000),
  waitDays: z.coerce.number().int().min(0).default(0),
});
const schema = z
  .object({
    automationType: z.enum([
      "BIRTHDAY",
      "PUBLIC_HOLIDAY",
      "PAYMENT_RECEIVED",
      "PAYMENT_DUE",
      "PAYMENT_OVERDUE",
      "PAYMENT_RECOVERY",
      "PERSONAL",
    ]),
    name: z.string().trim().min(3, "Name this automation.").max(255),
    active: z.boolean(),
    triggerDate: z.string(),
    contactIds: z.array(z.string()),
    steps: z.array(stepSchema).min(1, "Add at least one delivery step."),
  })
  .superRefine((values, context) => {
    if (
      (values.automationType === "PUBLIC_HOLIDAY" ||
        values.automationType === "PERSONAL") &&
      !/^\d{4}-\d{2}-\d{2}$/.test(values.triggerDate)
    )
      context.addIssue({
        code: "custom",
        path: ["triggerDate"],
        message: "Enter the holiday as YYYY-MM-DD.",
      });
  });
type Values = z.infer<typeof schema>;

const fallbackTypes: Array<{ value: AutomationType; label: string }> = [
  { value: "BIRTHDAY", label: "Birthday greeting" },
  { value: "PUBLIC_HOLIDAY", label: "Public holiday" },
  { value: "PAYMENT_RECEIVED", label: "Payment received" },
  { value: "PAYMENT_DUE", label: "Payment due" },
  { value: "PAYMENT_OVERDUE", label: "Payment overdue" },
  { value: "PAYMENT_RECOVERY", label: "Payment recovery" },
  { value: "PERSONAL", label: "Personal (stored only)" },
];
const supportedTypes = new Set<AutomationType>(
  fallbackTypes.map((item) => item.value),
);
const supportedChannels = new Set<AutomationChannel>(["SMS", "EMAIL", "BOTH"]);
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isAutomationType = (value: unknown): value is AutomationType =>
  typeof value === "string" && supportedTypes.has(value as AutomationType);
const isAutomationChannel = (value: unknown): value is AutomationChannel =>
  typeof value === "string" &&
  supportedChannels.has(value as AutomationChannel);
const optionLabel = (value: AutomationType) =>
  fallbackTypes.find((item) => item.value === value)?.label ?? value;

const normalizeTypeOption = (input: unknown): AutomationTypeOption | null => {
  if (isAutomationType(input))
    return { value: input, label: optionLabel(input) };
  if (!isRecord(input)) return null;
  const value = [
    input.value,
    input.type,
    input.automationType,
    input.automation_type,
    input.name,
  ].find(isAutomationType);
  if (!value) return null;
  const label = [input.label, input.displayName, input.display_name].find(
    (item): item is string => typeof item === "string" && item.length > 0,
  );
  return {
    value,
    label: label ?? optionLabel(value),
    executable:
      typeof input.executable === "boolean" ? input.executable : undefined,
    requiresDate:
      typeof input.requiresDate === "boolean"
        ? input.requiresDate
        : typeof input.requires_date === "boolean"
          ? input.requires_date
          : undefined,
  };
};

const normalizeChannel = (input: unknown): AutomationChannel | null => {
  if (isAutomationChannel(input)) return input;
  if (!isRecord(input)) return null;
  const value = [input.value, input.channel, input.name].find(
    isAutomationChannel,
  );
  return value ?? null;
};

const defaults = (): Values => ({
  automationType: "BIRTHDAY",
  name: "",
  active: true,
  triggerDate: "",
  contactIds: [],
  steps: [{ channel: "BOTH", subject: "", message: "", waitDays: 0 }],
});

interface AutomationBuilderSheetProps {
  open: boolean;
  automation: Automation | null;
  options?: AutomationOptions;
  onOpenChange: (open: boolean) => void;
}

export const AutomationBuilderSheet = ({
  open,
  automation,
  options,
  onOpenChange,
}: AutomationBuilderSheetProps) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const create = useCreateAutomation();
  const update = useUpdateAutomation();
  const remove = useDeleteAutomation();
  const leads = useLeads({ page: 0, size: 100 });
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: defaults(),
  });
  const steps = useFieldArray({ control: form.control, name: "steps" });
  const automationType = useWatch({
    control: form.control,
    name: "automationType",
  });
  const active = useWatch({ control: form.control, name: "active" });
  const contactIds = useWatch({ control: form.control, name: "contactIds" });
  const configuredSteps = useWatch({ control: form.control, name: "steps" });
  const rawTypes: unknown[] = Array.isArray(options?.types)
    ? options.types
    : Array.isArray(options?.automationTypes)
      ? options.automationTypes
      : [];
  const providedTypes = rawTypes
    .map(normalizeTypeOption)
    .filter((item): item is AutomationTypeOption => item !== null);
  const typeOptions: AutomationTypeOption[] = fallbackTypes.map((fallback) => ({
    ...fallback,
    ...providedTypes.find((item) => item.value === fallback.value),
  }));
  const providedChannels = Array.isArray(options?.channels)
    ? options.channels
        .map(normalizeChannel)
        .filter((item): item is AutomationChannel => item !== null)
    : [];
  const channelOptions = providedChannels.length
    ? providedChannels
    : (["SMS", "EMAIL", "BOTH"] as AutomationChannel[]);
  const personalExecutable =
    options?.triggerRequirements?.PERSONAL?.executable ??
    typeOptions.find((item) => item.value === "PERSONAL")?.executable ??
    true;

  useEffect(() => {
    if (!open) return;
    if (!automation) {
      form.reset(defaults());
      return;
    }
    form.reset({
      automationType: automation.automationType,
      name: automation.name,
      active:
        automation.automationType === "PERSONAL" && !personalExecutable
          ? false
          : automation.active,
      triggerDate: automation.triggerConfig.date ?? "",
      contactIds: Array.isArray(automation.contactIds)
        ? automation.contactIds
        : [],
      steps: automation.steps.map((step) => ({
        channel: step.channel,
        subject: step.subject ?? "",
        message: step.message,
        waitDays: step.waitDays ?? 0,
      })),
    });
  }, [automation, form, open, personalExecutable]);

  const pending = create.isPending || update.isPending;
  const submit = form.handleSubmit(async (values) => {
    const data = {
      automationType: values.automationType,
      name: values.name,
      active:
        values.automationType === "PERSONAL" && !personalExecutable
          ? false
          : values.active,
      contactIds:
        values.automationType === "PERSONAL" ? values.contactIds : undefined,
      triggerConfig:
        values.automationType === "PUBLIC_HOLIDAY"
          ? { date: values.triggerDate }
          : values.automationType === "PERSONAL"
            ? { date: values.triggerDate }
            : {},
      steps: values.steps.map(({ channel, subject, message, waitDays }) => ({
        channel,
        subject: subject || undefined,
        message,
        waitDays,
      })),
    };
    if (automation) await update.mutateAsync({ id: automation.id, data });
    else await create.mutateAsync(data);
    onOpenChange(false);
  });

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(value) => !pending && onOpenChange(value)}
      >
        <SheetContent className="sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>
              {automation ? "Edit automation" : "Create automation"}
            </SheetTitle>
            <SheetDescription>
              Configure the trigger and every delivery step. Channel opt-ins are
              enforced by the backend.
            </SheetDescription>
          </SheetHeader>
          <form className="space-y-5" onSubmit={submit}>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <div>
                <Label>Automation type</Label>
                <Select
                  value={automationType}
                  disabled={Boolean(automation)}
                  onValueChange={(value: AutomationType) => {
                    form.setValue("automationType", value, {
                      shouldValidate: true,
                    });
                    if (value === "PERSONAL" && !personalExecutable)
                      form.setValue("active", false);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label ?? optionLabel(item.value)}
                        {item.value === "PERSONAL" ? " · date-based" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <div className="flex h-10 items-center gap-2 rounded-lg border px-3">
                  <Switch
                    checked={active}
                    disabled={
                      automationType === "PERSONAL" && !personalExecutable
                    }
                    onCheckedChange={(checked) =>
                      form.setValue("active", checked)
                    }
                  />
                  <Label>Active</Label>
                </div>
              </div>
            </div>
            <div>
              <Label>Name</Label>
              <Input
                placeholder="e.g. Independence Day greeting"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-danger">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            {automationType === "BIRTHDAY" && (
              <div className="flex gap-3 rounded-xl border bg-muted/40 p-4 text-sm">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-info" />
                <p>
                  Runs daily at 8 AM using birthdays saved on leads. No trigger
                  date is required here.
                </p>
              </div>
            )}
            {(automationType === "PUBLIC_HOLIDAY" ||
              automationType === "PERSONAL") && (
              <div>
                <Label>
                  {automationType === "PERSONAL"
                    ? "Trigger date"
                    : "Holiday date"}
                </Label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    className="pl-9"
                    {...form.register("triggerDate")}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Stored as YYYY-MM-DD.
                  {automationType === "PUBLIC_HOLIDAY"
                    ? " Create next year's configuration for annual recurrence."
                    : " This date controls when the personal automation starts."}
                </p>
                {form.formState.errors.triggerDate && (
                  <p className="text-xs text-danger">
                    {form.formState.errors.triggerDate.message}
                  </p>
                )}
              </div>
            )}
            {automationType.startsWith("PAYMENT_") && (
              <div className="flex gap-3 rounded-xl border bg-muted/40 p-4 text-sm">
                <Workflow className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <p>
                  Runs after a positive deal payment log, including payments
                  recorded through an invoice.
                </p>
              </div>
            )}
            {automationType === "PERSONAL" && (
              <div className="space-y-3 rounded-xl border p-4">
                <div>
                  <h3 className="font-semibold">Target contacts</h3>
                  <p className="text-xs text-muted-foreground">
                    Select the contacts this personal automation should apply
                    to.
                  </p>
                </div>
                {leads.isLoading ? (
                  <div className="space-y-2">
                    <div className="h-10 animate-pulse rounded-lg bg-muted" />
                    <div className="h-10 animate-pulse rounded-lg bg-muted" />
                  </div>
                ) : (
                  <div className="max-h-72 divide-y overflow-y-auto rounded-lg border">
                    {(leads.data?.content ?? []).map((lead) => {
                      const label =
                        `${lead.firstName ?? ""} ${lead.lastName ?? ""}`.trim() ||
                        lead.companyName ||
                        lead.email ||
                        lead.id;
                      return (
                        <label
                          key={lead.id}
                          className="flex cursor-pointer items-center gap-3 p-3 hover:bg-muted/50"
                        >
                          <Checkbox
                            checked={contactIds.includes(lead.id)}
                            onCheckedChange={(checked) => {
                              const next = checked
                                ? [...contactIds, lead.id]
                                : contactIds.filter((id) => id !== lead.id);
                              form.setValue("contactIds", next, {
                                shouldValidate: true,
                              });
                            }}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">
                              {label}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {lead.companyName || lead.category || "Contact"}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Delivery steps</h3>
                  <p className="text-xs text-muted-foreground">
                    Each step needs a channel and message.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    steps.append({
                      channel: "SMS",
                      subject: "",
                      message: "",
                      waitDays: 0,
                    })
                  }
                >
                  <Plus className="h-4 w-4" />
                  Add step
                </Button>
              </div>
              {steps.fields.map((field, index) => (
                <div key={field.id} className="rounded-xl border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <strong className="text-sm">Step {index + 1}</strong>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      disabled={steps.fields.length === 1}
                      onClick={() => steps.remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label>Channel</Label>
                      <Select
                        value={configuredSteps[index]?.channel ?? "SMS"}
                        onValueChange={(value: AutomationChannel) =>
                          form.setValue(`steps.${index}.channel`, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {channelOptions.map((channel) => (
                            <SelectItem key={channel} value={channel}>
                              {channel}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>
                        Subject{" "}
                        <span className="font-normal text-muted-foreground">
                          (optional)
                        </span>
                      </Label>
                      <Input {...form.register(`steps.${index}.subject`)} />
                    </div>
                    <div>
                      <Label>Wait before this step (days)</Label>
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        {...form.register(`steps.${index}.waitDays`, {
                          valueAsNumber: true,
                        })}
                      />
                    </div>
                    <div>
                      <Label>Message</Label>
                      <Textarea
                        className="min-h-28"
                        {...form.register(`steps.${index}.message`)}
                      />
                      {form.formState.errors.steps?.[index]?.message && (
                        <p className="text-xs text-danger">
                          {form.formState.errors.steps[index]?.message?.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-between gap-2 border-t pt-4">
              <div>
                {automation && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setConfirmDelete(true)}
                  >
                    Delete automation
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending
                    ? "Saving…"
                    : automation
                      ? "Save configuration"
                      : "Create automation"}
                </Button>
              </div>
            </div>
          </form>
        </SheetContent>
      </Sheet>
      <ConfirmModal
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this automation?"
        description="This workflow configuration will be permanently removed."
        confirmLabel="Delete automation"
        pending={remove.isPending}
        onConfirm={async () => {
          if (!automation) return;
          await remove.mutateAsync(automation.id);
          setConfirmDelete(false);
          onOpenChange(false);
        }}
      />
    </>
  );
};
