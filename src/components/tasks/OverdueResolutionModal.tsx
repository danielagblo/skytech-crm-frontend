"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Task } from "@/types/task.types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  reason: z
    .string()
    .trim()
    .min(12, "Give the team a little more context (at least 12 characters)."),
});
type Values = z.infer<typeof schema>;

interface OverdueResolutionModalProps {
  task: Task | null;
  open: boolean;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => Promise<void>;
}

export const OverdueResolutionModal = ({
  task,
  open,
  pending,
  onOpenChange,
  onConfirm,
}: OverdueResolutionModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: { reason: "" },
  });
  const submit = handleSubmit(async ({ reason }) => {
    await onConfirm(reason);
    reset();
  });
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!pending) onOpenChange(value);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            <AlertTriangle className="h-6 w-6" />
          </span>
          <DialogTitle>Close an overdue task?</DialogTitle>
          <DialogDescription>
            {task?.title
              ? `“${task.title}” passed its due date.`
              : "This task passed its due date."}{" "}
            Add a short completion note so managers understand what delayed it.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="overdue-reason">Completion note</Label>
            <Textarea
              id="overdue-reason"
              className="min-h-32"
              placeholder="Explain the delay and how it was resolved…"
              {...register("reason")}
            />
            {errors.reason && (
              <p className="text-xs text-danger">{errors.reason.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => onOpenChange(false)}
            >
              Keep overdue
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Mark as done"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
