import { cn } from "@/lib/utils";
type Status =
  | "TODO"
  | "DOING"
  | "DONE"
  | "OVERDUE"
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "LOST"
  | "CONVERTED"
  | "DRAFT"
  | "SENT"
  | "WAITING"
  | "FAILED"
  | string;
const style = (status: Status) =>
  status === "DONE" ||
  status === "SENT" ||
  status === "CONVERTED" ||
  status === "QUALIFIED"
    ? "bg-green-50 text-green-700"
    : status === "OVERDUE" || status === "FAILED" || status === "LOST"
      ? "bg-red-50 text-red-700"
      : status === "DOING" || status === "CONTACTED"
        ? "bg-blue-50 text-blue-700"
        : "bg-amber-50 text-amber-700";
export const StatusBadge = ({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) => (
  <span
    className={cn(
      "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize",
      style(status),
      className,
    )}
  >
    {status.toLowerCase().replace("_", " ")}
  </span>
);
