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
  mode?: "explain" | "complete";
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => Promise<void>;
}

export const OverdueResolutionModal = ({
  task,
  open,
  pending,
  mode = "explain",
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
      <DialogContent className="border-primary/70 sm:max-w-2xl sm:p-8">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-4 pr-8">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-950/50">
              <AlertTriangle className="h-6 w-6" />
            </span>
            <DialogTitle className="text-xl sm:text-2xl">
              {mode === "complete"
                ? "Finish this overdue task?"
                : "Uh oh! Why were you not able to fulfill this task?"}
            </DialogTitle>
          </div>
          <DialogDescription>
            {task?.title
              ? `“${task.title}” passed its due date.`
              : "This task passed its due date."}
            {mode === "complete"
              ? " Add a completion note so managers understand what delayed it."
              : " Share a clear reason so an admin or manager can follow up."}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-5" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="overdue-reason" className="sr-only">
              Reason
            </Label>
            <Textarea
              id="overdue-reason"
              className="min-h-44 resize-none rounded-md text-base sm:min-h-56"
              placeholder="Type reasons here..."
              {...register("reason")}
            />
            {errors.reason && (
              <p className="text-xs text-danger">{errors.reason.message}</p>
            )}
          </div>
          <div className="grid gap-2 sm:grid-cols-[.7fr_1.3fr]">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button type="submit" disabled={pending}>
              {pending
                ? "Saving…"
                : mode === "complete"
                  ? "Save reason and finish"
                  : "Share reason"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
