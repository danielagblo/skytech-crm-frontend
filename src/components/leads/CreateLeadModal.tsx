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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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

const schema = z.object({
  assigneeId: z.string().optional(),
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
  industry: z.string().min(2, "Enter an industry."),
  category: z.string().min(2, "Enter a category."),
  phone1: z.string().min(8, "Enter a valid phone number."),
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
});
type Values = z.infer<typeof schema>;

const defaults: Values = {
  assigneeId: "",
  firstName: "",
  lastName: "",
  birthday: "",
  role: "",
  leadSource: "SMS",
  priority: "MEDIUM",
  companyName: "",
  industry: "",
  category: "",
  phone1: "",
  phone2: "",
  whatsapp: "",
  emailAddress: "",
  address: "",
  launchTimeline: "ONE_TO_TWO_MONTHS",
  meetingArranged: true,
  hasPublicOffice: true,
  smsOptIn: true,
  emailOptIn: true,
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
            assigneeId: lead.assignedTo[0] ?? "",
            firstName: lead.firstName ?? "",
            lastName: lead.lastName ?? "",
            birthday: lead.birthday ?? "",
            role: lead.role ?? "",
            leadSource: lead.leadSource ?? "SMS",
            priority: lead.priority ?? "MEDIUM",
            companyName: lead.companyName ?? "",
            industry: lead.industry ?? "",
            category: lead.category ?? "",
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
      assignedTo: values.assigneeId ? [values.assigneeId] : [],
      firstName: values.firstName,
      lastName: values.lastName,
      birthday: values.birthday || undefined,
      role: values.role,
      leadSource: values.leadSource as LeadSource,
      priority: values.priority as Priority,
      companyName: values.companyName,
      industry: values.industry,
      category: values.category,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{lead ? "Edit lead" : "Create lead"}</DialogTitle>
        </DialogHeader>
        <form className="space-y-5" onSubmit={submit}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label>Assign to</Label>
              <Select
                value={toggles.assigneeId || "UNASSIGNED"}
                onValueChange={(value) =>
                  setValue("assigneeId", value === "UNASSIGNED" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                  {users
                    .filter((user) => user.active)
                    .map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
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
              <Input {...register("industry")} />
              {error("industry")}
            </div>
            <div>
              <Label>Category</Label>
              <Input {...register("category")} />
              {error("category")}
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
          <div>
            <Label>How soon to launch?</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {(
                [
                  ["IN_1_WEEK", "In 1 week"],
                  ["ONE_TO_TWO_MONTHS", "1–2 months"],
                  ["THREE_PLUS_MONTHS", "3+ months"],
                ] as const
              ).map(([value, label]) => (
                <label
                  key={value}
                  className="rounded-lg border px-3 py-2 text-sm"
                >
                  <input
                    type="radio"
                    value={value}
                    className="mr-2"
                    {...register("launchTimeline")}
                  />
                  {label}
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
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <Label>{label}</Label>
                <Switch
                  checked={Boolean(toggles[key])}
                  onCheckedChange={(value) => setValue(key, value)}
                />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-5 rounded-xl bg-muted p-4">
            {(
              [
                ["SMS reminder", "smsOptIn"],
                ["Email reminder", "emailOptIn"],
                ["Newsletter", "newsletterOptIn"],
              ] as const
            ).map(([label, key]) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <Switch
                  checked={Boolean(toggles[key])}
                  onCheckedChange={(value) => setValue(key, value)}
                />
                {label}
              </label>
            ))}
          </div>
          <div>
            <Label>Description</Label>
            <Textarea {...register("description")} />
            {error("description")}
          </div>
          <Button className="w-full" disabled={pending}>
            {pending ? "Saving…" : "Save lead"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
