'use client';
import { AlertCircle } from 'lucide-react';
import { useLead } from '@/hooks/useLeads';
import { useUsers } from '@/hooks/useUsers';
import { PageHeader } from '@/components/shared/PageHeader';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { AssigneeStack } from '@/components/shared/AssigneeStack';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import type { User, UserSummary } from '@/types/user.types';

export const LeadDetailPage = ({ leadId }: { leadId: string }) => {
  const leadQuery = useLead(leadId);
  const usersQuery = useUsers({ page: 0, size: 100 });
  if (leadQuery.isLoading) return <div className="space-y-4"><Skeleton className="h-20" /><Skeleton className="h-80 max-w-3xl" /></div>;
  if (leadQuery.isError || !leadQuery.data) return <EmptyState icon={AlertCircle} title="Lead could not be loaded" message="The lead may have been deleted or you may not have permission to view it." />;
  const lead = leadQuery.data;
  const users = usersQuery.data?.content ?? [];
  const assignees = lead.assignedTo.map((id) => users.find((user) => user.id === id)).filter((user): user is User => Boolean(user)) as UserSummary[];
  return <div className="space-y-5"><PageHeader title={`${lead.firstName || 'Unnamed'} ${lead.lastName || ''}`} description={`${lead.companyName || 'No company'} · ${lead.role || 'No role'}`} /><section className="surface max-w-3xl p-6"><div className="flex items-center justify-between">{assignees.length ? <AssigneeStack users={assignees} /> : <span className="text-sm text-muted-foreground">Unassigned</span>}{lead.priority && <PriorityBadge priority={lead.priority} />}</div><dl className="mt-6 grid gap-4 sm:grid-cols-2">{[['Phone', lead.phone1 || '—'], ['Email', lead.email || '—'], ['Location', lead.address || '—'], ['Category', lead.category || '—'], ['Lead source', lead.leadSource || '—'], ['Conversion', `${lead.conversionScore}%`], ['Status', lead.status], ['Industry', lead.industry || '—']].map(([label, value]) => <div key={label}><dt className="eyebrow">{label}</dt><dd className="mt-1 text-sm font-medium">{value}</dd></div>)}</dl><p className="mt-6 text-sm leading-relaxed text-muted-foreground">{lead.description || 'No description provided.'}</p></section></div>;
};
