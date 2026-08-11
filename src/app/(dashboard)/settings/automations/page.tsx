"use client";
import { useState } from "react";
import { AlertCircle, Plus } from "lucide-react";
import type { Automation } from "@/types/automation.types";
import {
  useAutomationOptions,
  useAutomations,
  useToggleAutomation,
} from "@/hooks/useAutomations";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { AutomationList } from "@/components/settings/automations/AutomationList";
import { BirthdayAutomation } from "@/components/settings/automations/BirthdayAutomation";
import { HolidayAutomation } from "@/components/settings/automations/HolidayAutomation";
import { PaymentAutomation } from "@/components/settings/automations/PaymentAutomation";
import { PersonalAutomation } from "@/components/settings/automations/PersonalAutomation";
import { AutomationBuilderSheet } from "@/components/settings/automations/AutomationBuilderSheet";
import { Button } from "@/components/ui/button";
export default function AutomationsPage() {
  const [active, setActive] = useState("birthday");
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editing, setEditing] = useState<Automation | null>(null);
  const [activeOverrides, setActiveOverrides] = useState<
    Record<string, boolean>
  >({});
  const automations = useAutomations({ page: 0, size: 100 });
  const options = useAutomationOptions();
  const toggle = useToggleAutomation();
  const items = automations.data?.content ?? [];
  const applyOverrides = (list: Automation[]) =>
    list.map((item) => ({
      ...item,
      active: activeOverrides[item.id] ?? item.active,
    }));
  const handleToggle = (id: string) => {
    const current =
      activeOverrides[id] ?? items.find((item) => item.id === id)?.active;
    setActiveOverrides((currentMap) => ({
      ...currentMap,
      [id]: !current,
    }));
    toggle.mutate(id, {
      onError: () =>
        setActiveOverrides((currentMap) => {
          const next = { ...currentMap };
          delete next[id];
          return next;
        }),
    });
  };
  const content =
    active === "birthday" ? (
      <BirthdayAutomation
        items={applyOverrides(
          items.filter((item) => item.automationType === "BIRTHDAY"),
        )}
        onToggle={handleToggle}
        pending={toggle.isPending}
        onEdit={(item) => {
          setEditing(item);
          setBuilderOpen(true);
        }}
      />
    ) : active === "holidays" ? (
      <HolidayAutomation
        items={applyOverrides(
          items.filter((item) => item.automationType === "PUBLIC_HOLIDAY"),
        )}
        onToggle={handleToggle}
        pending={toggle.isPending}
        onEdit={(item) => {
          setEditing(item);
          setBuilderOpen(true);
        }}
      />
    ) : active === "payment" ? (
      <PaymentAutomation
        items={applyOverrides(
          items.filter((item) => item.automationType === "PAYMENT"),
        )}
        onToggle={handleToggle}
        pending={toggle.isPending}
        onEdit={(item) => {
          setEditing(item);
          setBuilderOpen(true);
        }}
      />
    ) : (
      <PersonalAutomation
        items={applyOverrides(
          items.filter((item) => item.automationType === "PERSONAL"),
        )}
        onToggle={handleToggle}
        pending={toggle.isPending}
        onEdit={(item) => {
          setEditing(item);
          setBuilderOpen(true);
        }}
      />
    );
  return (
    <div className="space-y-5">
      <div className="fixed bottom-6 right-6 z-20">
        <Button
          onClick={() => {
            setEditing(null);
            setBuilderOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Create automation
        </Button>
      </div>
      <div className="grid gap-3 lg:grid-cols-[260px_1fr]">
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
      <AutomationBuilderSheet
        open={builderOpen}
        automation={editing}
        options={options.data}
        onOpenChange={setBuilderOpen}
      />
    </div>
  );
}
