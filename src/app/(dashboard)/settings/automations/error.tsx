"use client";

import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

export default function AutomationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="surface mx-auto flex min-h-80 max-w-xl flex-col items-center justify-center p-8 text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-danger dark:bg-red-950/40">
        <AlertTriangle className="h-6 w-6" />
      </span>
      <h1 className="text-xl font-semibold">
        Automations could not be displayed
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        The configuration data was not in a format this screen could safely
        display. Retry after the page refreshes its backend options.
      </p>
      {error.digest && (
        <p className="mt-3 text-xs text-muted-foreground">
          Reference: {error.digest}
        </p>
      )}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button onClick={reset}>
          <RotateCcw className="h-4 w-4" />
          Retry
        </Button>
        <Link
          href="/settings"
          className={buttonVariants({ variant: "outline" })}
        >
          Back to settings
        </Link>
      </div>
    </div>
  );
}
