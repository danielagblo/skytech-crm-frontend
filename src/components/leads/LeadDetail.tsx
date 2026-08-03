"use client";
import { useState } from "react";
import {
  Building2,
  Calendar,
  Mail,
  MapPin,
  Phone,
  Plus,
  Trash2,
  Workflow,
} from "lucide-react";
import type { Lead } from "@/types/lead.types";
import type { User, UserSummary } from "@/types/user.types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AssigneeStack } from "@/components/shared/AssigneeStack";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { Button } from "@/components/ui/button";
import { CreateLeadModal } from "./CreateLeadModal";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { usePermission } from "@/hooks/usePermission";
import { useConvertLead, useDeleteLead } from "@/hooks/useLeads";

export const LeadDetail = ({
  lead,
  users,
  open,
  onOpenChange,
}: {
  lead: Lead | null;
  users: User[];
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) => {
  const [edit, setEdit] = useState(false);
  const [action, setAction] = useState<"delete" | "convert" | null>(null);
  const { can } = usePermission();
  const remove = useDeleteLead();
  const convert = useConvertLead();
  if (!lead) return null;
  const assignees = lead.assignedTo
    .map((id) => users.find((user) => user.id === id))
    .filter((user): user is User => Boolean(user)) as UserSummary[];
  const creator = users.find((user) => user.id === lead.createdById);
  const rows = [
    [Phone, lead.phone1 || "Not provided"],
    [Mail, lead.email || "Not provided"],
    [
      Building2,
      `${lead.companyName || "No company"} · ${lead.role || "No role"}`,
    ],
    [MapPin, lead.address || "Not provided"],
    [Calendar, lead.launchTimeline?.replaceAll("_", " ") || "Not set"],
  ] as const;
  const confirm = () => {
    if (action === "delete")
      remove.mutate(lead.id, {
        onSuccess: () => {
          setAction(null);
          onOpenChange(false);
        },
      });
    if (action === "convert")
      convert.mutate(
        { id: lead.id },
        {
          onSuccess: () => {
            setAction(null);
            onOpenChange(false);
          },
        },
      );
  };
  const pending = remove.isPending || convert.isPending;
  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="text-xl">Lead details</SheetTitle>
          </SheetHeader>
          <div className="text-center">
            <p className="eyebrow">Assignees</p>
            <div className="mt-3 flex justify-center gap-2">
              {assignees.length ? (
                <AssigneeStack users={assignees} />
              ) : (
                <span className="text-sm text-muted-foreground">
                  Unassigned
                </span>
              )}
              <button
                onClick={() => setEdit(true)}
                className="rounded-full border p-1"
                aria-label="Change assignee"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <h2 className="mt-5 text-xl font-semibold">
              {lead.firstName || "Unnamed"} {lead.lastName || ""}
            </h2>
            <p className="text-sm text-muted-foreground">
              {lead.category || "Uncategorized"} · {lead.status}
            </p>
            {creator && (
              <p className="mt-1 text-xs text-muted-foreground">
                Created by {creator.firstName} {creator.lastName}
              </p>
            )}
          </div>
          <div className="mt-6 space-y-3">
            {rows.map(([Icon, value]) => (
              <div
                key={value}
                className="flex items-center gap-3 rounded-xl bg-muted p-3 text-sm"
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                {value}
              </div>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="eyebrow">Priority</p>
              <div className="mt-2">
                {lead.priority ? (
                  <PriorityBadge priority={lead.priority} />
                ) : (
                  "Not set"
                )}
              </div>
            </div>
            <div>
              <p className="eyebrow">Lead source</p>
              <p className="mt-2">
                {lead.leadSource?.replace("_", " ") || "Not set"}
              </p>
            </div>
            <div>
              <p className="eyebrow">Public office</p>
              <p className="mt-2">{lead.hasPublicOffice ? "Yes" : "No"}</p>
            </div>
            <div>
              <p className="eyebrow">Meeting</p>
              <p className="mt-2">{lead.meetingArranged ? "Yes" : "No"}</p>
            </div>
            <div>
              <p className="eyebrow">SMS / Email</p>
              <p className="mt-2">
                {lead.smsOptIn ? "SMS" : "No SMS"} ·{" "}
                {lead.emailOptIn ? "Email" : "No email"}
              </p>
            </div>
            <div>
              <p className="eyebrow">Newsletter</p>
              <p className="mt-2">
                {lead.newsletterOptIn ? "Subscribed" : "Not subscribed"}
              </p>
            </div>
          </div>
          <div className="mt-6">
            <p className="eyebrow">Description</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {lead.description || "No description provided."}
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            <Button className="flex-1" onClick={() => setEdit(true)}>
              Edit details
            </Button>
            {lead.status !== "CONVERTED" && (
              <Button variant="outline" onClick={() => setAction("convert")}>
                <Workflow className="h-4 w-4" />
                Convert
              </Button>
            )}
            {can("delete:leads") && (
              <Button
                variant="destructive"
                size="icon"
                onClick={() => setAction("delete")}
                aria-label="Delete lead"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
      <CreateLeadModal
        open={edit}
        onOpenChange={setEdit}
        lead={lead}
        users={users}
      />
      <ConfirmModal
        open={Boolean(action)}
        onOpenChange={(value) => !value && setAction(null)}
        title={
          action === "delete"
            ? "Delete this lead?"
            : "Convert this lead to a deal?"
        }
        description={
          action === "delete"
            ? "This removes the lead from active CRM records. This action cannot be undone."
            : "A new prospecting deal will be created and this lead will be marked as converted."
        }
        confirmLabel={action === "delete" ? "Delete lead" : "Convert lead"}
        onConfirm={confirm}
        pending={pending}
      />
    </>
  );
};
