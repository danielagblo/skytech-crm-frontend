"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Lead, LaunchTimeline } from "@/types/lead.types";
import type { LeadSource, Priority } from "@/types/api.types";
import type { User } from "@/types/user.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCreateLead, useUpdateLead } from "@/hooks/useLeads";
import { LEAD_INDUSTRIES } from "@/lib/crm-options";

const schema = z
  .object({
    assigneeIds: z.array(z.string()).default([]),
    firstName: z.string().min(2, "Enter a first name."),
    lastName: z.string().min(2, "Enter a last name."),
    birthday: z.string().optional(),
    role: z.string().min(2, "Enter the contact role."),
    leadSource: z.enum([
      "SMS",
      "EMAIL",
      "FACEBOOK",
      "GOOGLE",
      "BANNER",
      "META_ADS",
    ]),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
    companyName: z.string().min(2, "Enter a company name."),
    industry: z.string().min(2, "Choose an industry."),
    phone1: z.string(),
    phone2: z.string().optional(),
    whatsapp: z.string().optional(),
    emailAddress: z.union([
      z.literal(""),
      z.string().email("Enter a valid email."),
    ]),
    address: z.string().min(4, "Enter an address."),
    launchTimeline: z.enum([
      "IN_1_WEEK",
      "ONE_TO_TWO_MONTHS",
      "THREE_PLUS_MONTHS",
    ]),
    meetingArranged: z.boolean(),
    hasPublicOffice: z.boolean(),
    smsOptIn: z.boolean(),
    emailOptIn: z.boolean(),
    newsletterOptIn: z.boolean(),
    description: z.string().min(10, "Add at least 10 characters."),
  })
  .superRefine((values, context) => {
    if (values.smsOptIn && values.phone1.trim().length < 8)
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phone1"],
        message: "Enter a valid phone number for SMS communication.",
      });
    if (
      (values.emailOptIn || values.newsletterOptIn) &&
      !values.emailAddress.trim()
    )
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["emailAddress"],
        message: "Email is required for email communication or the newsletter.",
      });
  });
type Values = z.infer<typeof schema>;

const defaults: Values = {
  assigneeIds: [],
  firstName: "",
  lastName: "",
  birthday: "",
  role: "",
  leadSource: "SMS",
  priority: "MEDIUM",
  companyName: "",
  industry: "",
  phone1: "",
  phone2: "",
  whatsapp: "",
  emailAddress: "",
  address: "",
  launchTimeline: "ONE_TO_TWO_MONTHS",
  meetingArranged: true,
  hasPublicOffice: true,
  smsOptIn: false,
  emailOptIn: false,
  newsletterOptIn: false,
  description: "",
};

export const CreateLeadModal = ({
  open,
  onOpenChange,
  lead,
  users = [],
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  lead?: Lead | null;
  users?: User[];
}) => {
  const create = useCreateLead();
  const update = useUpdateLead();
  const {
    register,
    control,
    setValue,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: defaults,
  });
  const toggles = useWatch({ control });
  useEffect(() => {
    if (!open) return;
    reset(
      lead
        ? {
            assigneeIds: lead.assignedTo ?? [],
            firstName: lead.firstName ?? "",
            lastName: lead.lastName ?? "",
            birthday: lead.birthday ?? "",
            role: lead.role ?? "",
            leadSource: lead.leadSource ?? "SMS",
            priority: lead.priority ?? "MEDIUM",
            companyName: lead.companyName ?? "",
            industry: lead.industry ?? lead.category ?? "",
            phone1: lead.phone1 ?? "",
            phone2: lead.phone2 ?? "",
            whatsapp: lead.whatsapp ?? "",
            emailAddress: lead.email ?? "",
            address: lead.address ?? "",
            launchTimeline: lead.launchTimeline ?? "ONE_TO_TWO_MONTHS",
            meetingArranged: Boolean(lead.meetingArranged),
            hasPublicOffice: Boolean(lead.hasPublicOffice),
            smsOptIn: lead.smsOptIn,
            emailOptIn: lead.emailOptIn,
            newsletterOptIn: lead.newsletterOptIn,
            description: lead.description ?? "",
          }
        : defaults,
    );
  }, [lead, open, reset]);

  const submit = handleSubmit((values) => {
    const data = {
      assignedTo: values.assigneeIds,
      firstName: values.firstName,
      lastName: values.lastName,
      birthday: values.birthday || undefined,
      role: values.role,
      leadSource: values.leadSource as LeadSource,
      priority: values.priority as Priority,
      companyName: values.companyName,
      industry: values.industry,
      category: values.industry,
      phone1: values.phone1,
      phone2: values.phone2 || undefined,
      whatsapp: values.whatsapp || undefined,
      email: values.emailAddress || undefined,
      address: values.address,
      launchTimeline: values.launchTimeline as LaunchTimeline,
      meetingArranged: values.meetingArranged,
      hasPublicOffice: values.hasPublicOffice,
      smsOptIn: values.smsOptIn,
      emailOptIn: values.emailOptIn,
      newsletterOptIn: values.newsletterOptIn,
      description: values.description,
    };
    if (lead)
      update.mutate(
        { id: lead.id, data },
        { onSuccess: () => onOpenChange(false) },
      );
    else
      create.mutate(data, {
        onSuccess: () => {
          reset(defaults);
          onOpenChange(false);
        },
      });
  });
  const pending = create.isPending || update.isPending;
  const error = (name: keyof Values) =>
    errors[name] && (
      <p className="text-xs text-danger">{errors[name]?.message}</p>
    );
  const selectedAssignees = new Set(toggles.assigneeIds ?? []);
  const toggleAssignee = (id: string) => {
    const next = selectedAssignees.has(id)
      ? (toggles.assigneeIds ?? []).filter((value) => value !== id)
      : [...(toggles.assigneeIds ?? []), id];
    setValue("assigneeIds", next, { shouldValidate: true });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-hidden p-0">
        <DialogHeader className="border-b bg-gradient-to-r from-primary/15 via-primary/5 to-transparent px-6 py-5 text-left">
          <DialogTitle className="text-xl">
            {lead ? "Edit lead profile" : "Create a new lead"}
          </DialogTitle>
          <DialogDescription>
            Capture contact, company, assignment, consent, and qualification
            details in one place.
          </DialogDescription>
        </DialogHeader>
        <form
          className="max-h-[calc(92vh-105px)] space-y-5 overflow-y-auto px-6 pb-6"
          onSubmit={submit}
        >
          <div className="surface grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2 lg:col-span-3">
              <h3 className="font-semibold">Assignment and contact profile</h3>
              <p className="text-xs text-muted-foreground">
                Multiple active agents can share responsibility for this lead.
              </p>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <div className="flex items-center justify-between gap-3">
                <Label>Assign to</Label>
                <span className="rounded-full bg-primary/15 px-2 py-1 text-xs font-medium">
                  {selectedAssignees.size} selected
                </span>
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {users
                  .filter((user) => user.active)
                  .map((user) => (
                    <label
                      key={user.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition hover:border-primary/60 hover:bg-primary/5 ${selectedAssignees.has(user.id) ? "border-primary bg-primary/10" : "bg-background"}`}
                    >
                      <Checkbox
                        checked={selectedAssignees.has(user.id)}
                        onCheckedChange={() => toggleAssignee(user.id)}
                      />
                      <span>
                        {user.firstName} {user.lastName}
                      </span>
                    </label>
                  ))}
              </div>
            </div>
            <div>
              <Label>First name</Label>
              <Input {...register("firstName")} />
              {error("firstName")}
            </div>
            <div>
              <Label>Last name</Label>
              <Input {...register("lastName")} />
              {error("lastName")}
            </div>
            <div>
              <Label>Birthday</Label>
              <Input type="date" {...register("birthday")} />
            </div>
            <div>
              <Label>Role</Label>
              <Input {...register("role")} />
              {error("role")}
            </div>
            <div>
              <Label>Lead source</Label>
              <Select
                value={toggles.leadSource}
                onValueChange={(value: LeadSource) =>
                  setValue("leadSource", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    [
                      "SMS",
                      "EMAIL",
                      "FACEBOOK",
                      "GOOGLE",
                      "BANNER",
                      "META_ADS",
                    ] as const
                  ).map((value) => (
                    <SelectItem key={value} value={value}>
                      {value.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select
                value={toggles.priority}
                onValueChange={(value: Priority) => setValue("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Company name</Label>
              <Input {...register("companyName")} />
              {error("companyName")}
            </div>
            <div>
              <Label>Industry</Label>
              <Select
                value={toggles.industry}
                onValueChange={(value) =>
                  setValue("industry", value, { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an industry" />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_INDUSTRIES.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {error("industry")}
            </div>
            <div>
              <Label>Phone</Label>
              <Input {...register("phone1")} />
              {error("phone1")}
            </div>
            <div>
              <Label>Secondary phone</Label>
              <Input {...register("phone2")} />
            </div>
            <div>
              <Label>WhatsApp line</Label>
              <Input {...register("whatsapp")} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" {...register("emailAddress")} />
              {error("emailAddress")}
            </div>
            <div className="sm:col-span-2">
              <Label>Address</Label>
              <Input {...register("address")} />
              {error("address")}
            </div>
          </div>
          <div className="surface p-4">
            <Label>How soon to launch?</Label>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {(
                [
                  ["IN_1_WEEK", "In 1 week"],
                  ["ONE_TO_TWO_MONTHS", "1–2 months"],
                  ["THREE_PLUS_MONTHS", "3+ months"],
                ] as const
              ).map(([value, label]) => (
                <label key={value} className="cursor-pointer">
                  <input
                    type="radio"
                    value={value}
                    className="peer sr-only"
                    {...register("launchTimeline")}
                  />
                  <span className="block rounded-lg border bg-background px-3 py-3 text-center text-sm transition peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:font-medium">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["Can we arrange a meeting?", "meetingArranged"],
                ["Do you have a public office?", "hasPublicOffice"],
              ] as const
            ).map(([label, key]) => (
              <div
                key={key}
                className="surface flex items-center justify-between p-4"
              >
                <Label>{label}</Label>
                <Switch
                  checked={Boolean(toggles[key])}
                  onCheckedChange={(value) => setValue(key, value)}
                />
              </div>
            ))}
          </div>
          <div className="surface p-4">
            <h3 className="font-semibold">Communication consent</h3>
            <p className="mb-4 text-xs text-muted-foreground">
              These controls determine which channels automations and broadcasts
              may use.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  ["Communications by SMS", "smsOptIn"],
                  ["Communications by email", "emailOptIn"],
                  ["Subscribe to newsletter", "newsletterOptIn"],
                ] as const
              ).map(([label, key]) => (
                <label
                  key={key}
                  className="flex items-center justify-between gap-2 rounded-lg border bg-background p-3 text-sm"
                >
                  <Switch
                    checked={Boolean(toggles[key])}
                    onCheckedChange={(value) => setValue(key, value)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            These choices only save the lead&apos;s communication consent.
            Creating the lead will not send an SMS or email.
          </p>
          <div className="surface p-4">
            <Label>Description</Label>
            <Textarea
              className="mt-2 min-h-28"
              placeholder="Add context, customer needs, and next-step notes…"
              {...register("description")}
            />
            {error("description")}
          </div>
          <div className="sticky bottom-0 -mx-6 flex justify-end gap-2 border-t bg-card/95 px-6 py-4 backdrop-blur">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button className="min-w-36" disabled={pending} type="submit">
              {pending ? "Saving…" : lead ? "Save changes" : "Create lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
