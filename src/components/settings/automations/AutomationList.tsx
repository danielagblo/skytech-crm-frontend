"use client";

import Link from "next/link";
import { Cake, CalendarHeart, CreditCard, UserCog } from "lucide-react";

const items = [
  { id: "birthday", label: "Birthday", icon: Cake },
  { id: "holidays", label: "Celebrations & holidays", icon: CalendarHeart },
  { id: "payment", label: "Payment automation", icon: CreditCard },
  { id: "personal", label: "Personal automations", icon: UserCog },
];

interface AutomationListProps {
  active: string;
  onChange: (value: string) => void;
}

export const AutomationList = ({ active, onChange }: AutomationListProps) => (
  <aside className="surface h-fit p-3">
    <p className="eyebrow px-3 py-2">Automation categories</p>
    {items.map((item) => (
      <button
        key={item.id}
        onClick={() => onChange(item.id)}
        className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm ${active === item.id ? "bg-green-50 font-semibold text-green-700" : "hover:bg-muted"}`}
      >
        <item.icon className="h-4 w-4" />
        {item.label}
      </button>
    ))}
    <Link
      className="mt-3 block border-t px-3 pt-3 text-xs text-muted-foreground"
      href="/settings"
    >
      Back to settings
    </Link>
  </aside>
);
