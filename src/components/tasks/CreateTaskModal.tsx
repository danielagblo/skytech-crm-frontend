"use client";
import { useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useCreateTaskWithSubtasks } from "@/hooks/useTasks";
import { useLeads } from "@/hooks/useLeads";
import { useDeals } from "@/hooks/useDeals";
import { useUsers } from "@/hooks/useUsers";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { Priority } from "@/types/api.types";
const schema = z.object({
  title: z.string().min(3, "Enter a task title."),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  assigneeId: z.string().optional(),
  reminder: z.boolean(),
  dueDate: z.string().optional(),
  description: z.string().min(10, "Add at least 10 characters."),
  subTasks: z.array(
    z.object({
      title: z.string().min(2),
      priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
      description: z.string().min(3),
    }),
  ),
});
type Values = z.infer<typeof schema>;
export const CreateTaskModal = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) => {
  const [caseType, setCaseType] = useState<"lead" | "deal">("lead");
  const [caseId, setCaseId] = useState("");
  const create = useCreateTaskWithSubtasks();
  const leads = useLeads({ page: 0, size: 100 });
  const deals = useDeals({ page: 0, size: 100 });
  const users = useUsers({ page: 0, size: 100 });
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
    defaultValues: {
      title: "",
      priority: "LOW",
      assigneeId: "",
      reminder: true,
      dueDate: "",
      description: "",
      subTasks: [],
    },
  });
  const values = useWatch({ control });
  const fields = useFieldArray({ control, name: "subTasks" });
  const submitValues = (
    data: Values,
    linked?: { linkedLeadId?: string; linkedDealId?: string },
  ) =>
    create.mutate(
      {
        task: {
          title: data.title,
          priority: data.priority,
          assigneeIds: data.assigneeId ? [data.assigneeId] : [],
          allowReminder: data.reminder,
          dueDate: data.dueDate
            ? new Date(data.dueDate).toISOString()
            : undefined,
          description: data.description,
          status: "TODO",
          ...linked,
        },
        subtasks: data.subTasks.map((subtask) => ({
          ...subtask,
          complete: false,
        })),
      },
      {
        onSuccess: () => {
          reset();
          setCaseId("");
          onOpenChange(false);
        },
      },
    );
  const save = handleSubmit((data) => submitValues(data));
  const createFromCase = () => {
    const lead = leads.data?.content.find((item) => item.id === caseId);
    const deal = deals.data?.content.find((item) => item.id === caseId);
    const title = lead
      ? `Follow up with ${lead.firstName || "lead"} ${lead.lastName || ""}`
      : deal
        ? `Follow up: ${deal.title}`
        : "";
    const description =
      lead?.description ||
      deal?.notes ||
      "Follow up on this pending CRM case and record the outcome.";
    submitValues(
      {
        ...values,
        title,
        description,
        priority: values.priority ?? "LOW",
        reminder: values.reminder ?? true,
        subTasks: values.subTasks ?? [],
      } as Values,
      caseType === "lead" ? { linkedLeadId: caseId } : { linkedDealId: caseId },
    );
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create task</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="manual">
          <TabsList>
            <TabsTrigger value="manual">Manual entry</TabsTrigger>
            <TabsTrigger value="case">Select pending case</TabsTrigger>
          </TabsList>
          <TabsContent value="manual">
            <form className="space-y-4" onSubmit={save}>
              <div>
                <Label>Title</Label>
                <Input {...register("title")} />
                {errors.title && (
                  <p className="text-xs text-danger">{errors.title.message}</p>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Priority</Label>
                  <Select
                    value={values.priority}
                    onValueChange={(value: Priority) =>
                      setValue("priority", value)
                    }
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
                  <Label>Assignee</Label>
                  <Select
                    value={values.assigneeId || "NONE"}
                    onValueChange={(value) =>
                      setValue("assigneeId", value === "NONE" ? "" : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">Unassigned</SelectItem>
                      {(users.data?.content ?? [])
                        .filter((user) => user.active)
                        .map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.firstName} {user.lastName}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Due date</Label>
                <Input type="datetime-local" {...register("dueDate")} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label>Allow reminder</Label>
                <Switch
                  checked={Boolean(values.reminder)}
                  onCheckedChange={(value) => setValue("reminder", value)}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea {...register("description")} />
                {errors.description && (
                  <p className="text-xs text-danger">
                    {errors.description.message}
                  </p>
                )}
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label>Sub tasks</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      fields.append({
                        title: "",
                        priority: "LOW",
                        description: "",
                      })
                    }
                  >
                    <Plus className="h-3 w-3" />
                    Add subtask
                  </Button>
                </div>
                {fields.fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="mb-3 grid gap-2 rounded-xl border p-3"
                  >
                    <div className="flex gap-2">
                      <Input
                        placeholder="Subtask title"
                        {...register(`subTasks.${index}.title`)}
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => fields.remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Select
                      value={values.subTasks?.[index]?.priority || "LOW"}
                      onValueChange={(value: Priority) =>
                        setValue(`subTasks.${index}.priority`, value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low priority</SelectItem>
                        <SelectItem value="MEDIUM">Medium priority</SelectItem>
                        <SelectItem value="HIGH">High priority</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea
                      placeholder="Description"
                      {...register(`subTasks.${index}.description`)}
                    />
                  </div>
                ))}
              </div>
              <Button className="w-full" disabled={create.isPending}>
                {create.isPending ? "Creating…" : "Create task"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="case">
            <p className="mb-3 text-sm text-muted-foreground">
              Select a pending lead or deal to create a linked follow-up task.
            </p>
            <div className="mb-3 flex gap-2">
              <Button
                variant={caseType === "lead" ? "default" : "outline"}
                onClick={() => {
                  setCaseType("lead");
                  setCaseId("");
                }}
              >
                Leads
              </Button>
              <Button
                variant={caseType === "deal" ? "default" : "outline"}
                onClick={() => {
                  setCaseType("deal");
                  setCaseId("");
                }}
              >
                Deals
              </Button>
            </div>
            <div className="max-h-72 space-y-2 overflow-y-auto">
              {caseType === "lead"
                ? (leads.data?.content ?? [])
                    .filter(
                      (lead) =>
                        lead.status !== "CONVERTED" && lead.status !== "LOST",
                    )
                    .map((lead) => (
                      <button
                        key={lead.id}
                        onClick={() => setCaseId(lead.id)}
                        className={`w-full rounded-xl border p-3 text-left ${caseId === lead.id ? "border-primary bg-green-50" : ""}`}
                      >
                        <strong className="text-sm">
                          {lead.firstName} {lead.lastName}
                        </strong>
                        <p className="text-xs text-muted-foreground">
                          {lead.companyName} · {lead.category}
                        </p>
                      </button>
                    ))
                : (deals.data?.content ?? []).map((deal) => (
                    <button
                      key={deal.id}
                      onClick={() => setCaseId(deal.id)}
                      className={`w-full rounded-xl border p-3 text-left ${caseId === deal.id ? "border-primary bg-green-50" : ""}`}
                    >
                      <strong className="text-sm">{deal.title}</strong>
                      <p className="text-xs text-muted-foreground">
                        {deal.stage.replace("_", " ")}
                      </p>
                    </button>
                  ))}
            </div>
            <Button
              className="mt-4 w-full"
              onClick={createFromCase}
              disabled={!caseId || create.isPending}
            >
              {create.isPending ? "Creating…" : "Create from selected case"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
