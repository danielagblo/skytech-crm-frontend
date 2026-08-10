"use client";
import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  useDepartmentTargets,
  useSaveDepartmentTargets,
} from "@/hooks/useDepartmentTargets";
import {
  TARGET_METRIC_LABELS,
  TARGET_METRIC_DESCRIPTIONS,
} from "@/lib/department-target";
import type { TargetMetric, TargetSetting } from "@/types/department-target.types";

const same = (a: TargetSetting[], b: TargetSetting[]) =>
  a.length === b.length &&
  a.every(
    (item) =>
      (b.find((other) => other.metric === item.metric)?.target ?? null) ===
        item.target &&
      (b.find((other) => other.metric === item.metric)?.enabled ?? null) ===
        item.enabled,
  );

export const DepartmentTargetEditor = ({ period }: { period: string }) => {
  const { data, isLoading } = useDepartmentTargets(period);
  const save = useSaveDepartmentTargets();
  const configured = data?.targets ?? [];
  const [draft, setDraft] = useState<TargetSetting[] | null>(null);
  const targets = draft ?? configured;

  const patch = (metric: TargetMetric, change: Partial<TargetSetting>) =>
    setDraft((current) =>
      (current ?? configured).map((item) =>
        item.metric === metric ? { ...item, ...change } : item,
      ),
    );

  if (isLoading) {
    return <Skeleton className="h-72" />;
  }

  return (
    <section className="surface overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b p-5">
        <div>
          <h2 className="font-semibold">Department targets</h2>
          <p className="text-sm text-muted-foreground">
            Achievements are calculated against enabled targets for {period}.
          </p>
        </div>
        <Button
          onClick={() => save.mutate({ period, targets })}
          disabled={!draft || same(targets, configured) || save.isPending}
        >
          <Save className="mr-2" />
          {save.isPending ? "Saving…" : "Save"}
        </Button>
      </div>
      <div className="divide-y">
        {targets.map((item) => (
          <div
            key={item.metric}
            className="flex items-center justify-between gap-4 p-5"
          >
            <div>
              <p className="font-medium">{TARGET_METRIC_LABELS[item.metric]}</p>
              <p className="text-sm text-muted-foreground">
                {TARGET_METRIC_DESCRIPTIONS[item.metric]}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={0}
                step="0.01"
                value={item.target === 0 ? "" : item.target}
                disabled={!item.enabled}
                onChange={(event) =>
                  patch(item.metric, {
                    target: Number(event.target.value) || 0,
                  })
                }
                className="w-28 text-right"
              />
              <Switch
                checked={item.enabled}
                onCheckedChange={(checked) =>
                  patch(item.metric, { enabled: checked })
                }
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};