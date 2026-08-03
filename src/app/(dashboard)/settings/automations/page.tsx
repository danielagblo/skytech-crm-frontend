"use client";
import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { useAutomations, useToggleAutomation } from "@/hooks/useAutomations";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { AutomationList } from "@/components/settings/automations/AutomationList";
import { BirthdayAutomation } from "@/components/settings/automations/BirthdayAutomation";
import { HolidayAutomation } from "@/components/settings/automations/HolidayAutomation";
import { PaymentAutomation } from "@/components/settings/automations/PaymentAutomation";
import { PersonalAutomation } from "@/components/settings/automations/PersonalAutomation";
export default function AutomationsPage() {
  const [active, setActive] = useState("birthday");
  const automations = useAutomations({ page: 0, size: 100 });
  const toggle = useToggleAutomation();
  const items = automations.data?.content ?? [];
  const content =
    active === "birthday" ? (
      <BirthdayAutomation
        items={items.filter((item) => item.automationType === "BIRTHDAY")}
        onToggle={(id) => toggle.mutate(id)}
        pending={toggle.isPending}
      />
    ) : active === "holidays" ? (
      <HolidayAutomation
        items={items.filter((item) => item.automationType === "PUBLIC_HOLIDAY")}
        onToggle={(id) => toggle.mutate(id)}
        pending={toggle.isPending}
      />
    ) : active === "payment" ? (
      <PaymentAutomation
        items={items.filter((item) => item.automationType === "PAYMENT")}
        onToggle={(id) => toggle.mutate(id)}
        pending={toggle.isPending}
      />
    ) : (
      <PersonalAutomation
        items={items.filter((item) => item.automationType === "PERSONAL")}
        onToggle={(id) => toggle.mutate(id)}
        pending={toggle.isPending}
      />
    );
  return (
    <div className="space-y-5">
      <PageHeader
        title="Automations"
        description="Manage lifecycle messages and operational workflows"
      />
      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <AutomationList active={active} onChange={setActive} />
        {automations.isLoading ? (
          <Skeleton className="h-96" />
        ) : automations.isError ? (
          <EmptyState
            icon={AlertCircle}
            title="Automations could not be loaded"
            message="This feature may require the Pro plan, or the server may be temporarily unavailable."
          />
        ) : (
          content
        )}
      </div>
    </div>
  );
}
