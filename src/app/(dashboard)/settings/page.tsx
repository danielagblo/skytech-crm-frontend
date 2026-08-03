'use client';

import Link from 'next/link';
import { ArrowRight, Bot, Cog, Radio, Users } from 'lucide-react';
import { usePermission, type Permission } from '@/hooks/usePermission';
import { PageHeader } from '@/components/shared/PageHeader';

const cards: Array<{ href: string; title: string; description: string; icon: typeof Bot; permission: Permission }> = [
  { href: '/settings/automations', title: 'Automations', description: 'Birthday, holiday, payment and personal workflows.', icon: Bot, permission: 'manage:automations' },
  { href: '/settings/agents', title: 'Agents', description: 'User access, lead assignment and performance.', icon: Users, permission: 'manage:users' },
  { href: '/settings/broadcast', title: 'Broadcast', description: 'Recipient segments, SMS composer and history.', icon: Radio, permission: 'manage:broadcasts' },
];

export default function SettingsPage() {
  const { can } = usePermission();
  const available = cards.filter((card) => can(card.permission));
  return (
    <div className="space-y-5">
      <PageHeader title="Settings" description="Configure your CRM workspace" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {available.map((card) => (
          <Link href={card.href} key={card.href} className="surface group p-6 transition hover:-translate-y-1 hover:shadow-soft">
            <span className="inline-flex rounded-xl bg-green-50 p-3"><card.icon className="h-6 w-6 text-green-700" /></span>
            <h2 className="mt-5 text-lg font-semibold">{card.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{card.description}</p>
            <span className="mt-5 flex items-center gap-2 text-sm font-semibold text-green-700">Open settings <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
          </Link>
        ))}
      </div>
      <div className="surface flex items-center gap-3 p-5"><Cog className="h-5 w-5 text-muted-foreground" /><p className="text-sm text-muted-foreground">Workspace defaults and account security are managed by your Skytech administrator.</p></div>
    </div>
  );
}
