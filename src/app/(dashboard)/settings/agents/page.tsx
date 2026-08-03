'use client';
import { useState } from 'react';
import type { User } from '@/types/user.types';
import { ArrowRight,Plus } from 'lucide-react';
import { people,leads } from '@/lib/mock-data';
import { PageHeader } from '@/components/shared/PageHeader';
import { Pagination } from '@/components/shared/Pagination';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { AgentTable } from '@/components/settings/agents/AgentTable';
import { AddAgentModal } from '@/components/settings/agents/AddAgentModal';
import { AgentPerformanceTable } from '@/components/settings/agents/AgentPerformanceTable';
export default function AgentsPage(){const [agent,setAgent]=useState<User|null>(null);const [open,setOpen]=useState(false);const [page,setPage]=useState(1);return <div className="space-y-5"><PageHeader title="Agents" description="Manage access, assignment and team performance" actions={<Button onClick={()=>{setAgent(null);setOpen(true)}}><Plus className="h-4 w-4"/>Add agent</Button>}/><section className="surface overflow-hidden"><AgentTable agents={people} onOpen={(selected)=>{setAgent(selected);setOpen(true)}}/><Pagination page={page} totalPages={3} onPageChange={setPage}/></section><div className="grid gap-5 xl:grid-cols-[1fr_360px]"><AgentPerformanceTable/><section className="surface p-4"><div className="flex items-center justify-between"><div><h3 className="font-semibold">Lead Assignment</h3><p className="text-xs text-muted-foreground">Auto assign new lead</p></div><Switch defaultChecked/></div><div className="mt-4 divide-y">{leads.slice(0,4).map((lead)=><div key={lead.id} className="flex items-center gap-3 py-3"><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{lead.firstName} {lead.lastName}</p><p className="truncate text-xs text-muted-foreground">{lead.phone} · {lead.company} · {lead.category}</p></div><span className="text-xs">{lead.conversion}%</span><ArrowRight className="h-4 w-4"/></div>)}</div></section></div><AddAgentModal agent={agent} open={open} onOpenChange={setOpen}/></div>}
