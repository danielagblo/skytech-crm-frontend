"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
export const ConfirmModal = ({
  open,
  onOpenChange,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  onConfirm,
  pending = false,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  pending?: boolean;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button variant="destructive" disabled={pending} onClick={onConfirm}>
          {pending ? "Working…" : confirmLabel}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
