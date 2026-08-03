import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
export const EmptyState = ({
  icon: Icon = Inbox,
  title,
  message,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  message: string;
  action?: React.ReactNode;
}) => (
  <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center">
    <span className="mb-3 rounded-full bg-muted p-3">
      <Icon className="h-6 w-6 text-muted-foreground" />
    </span>
    <h3 className="font-semibold">{title}</h3>
    <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);
