"use client";
import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DepartmentAchievement } from "@/components/settings/department-targets/DepartmentAchievement";
import { DepartmentTargetEditor } from "@/components/settings/department-targets/DepartmentTargetEditor";
import { currentPeriod } from "@/hooks/useDepartmentTargets";

export default function DepartmentTargetsPage() {
  const [period, setPeriod] = useState(currentPeriod());
  return (
    <div className="space-y-5">
      <PageHeader
        title="Department Targets"
        description="Set team targets for calls, deals and revenue, then review achievement per agent."
        actions={
          <div className="flex items-center gap-3">
            <Label htmlFor="period" className="text-sm text-muted-foreground">
              Month
            </Label>
            <Input
              id="period"
              type="month"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              className="w-44"
            />
          </div>
        }
      />
      <DepartmentTargetEditor key={period} period={period} />
      <DepartmentAchievement period={period} />
    </div>
  );
}