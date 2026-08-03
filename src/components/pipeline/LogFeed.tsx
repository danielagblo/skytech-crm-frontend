'use client';
import { useQueries } from '@tanstack/react-query';
import { MoreHorizontal, Star } from 'lucide-react';
import type { DealLog } from '@/types/deal.types';
import type { User } from '@/types/user.types';
import { dealsService } from '@/services/deals.service';
import { useAddDealLogComment, useReplyDealLogComment } from '@/hooks/useDeals';
import { formatDate, formatTime, formatCurrency } from '@/lib/utils';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { CommentThread } from '@/components/shared/CommentThread';
import { EmptyState } from '@/components/shared/EmptyState';

export const LogFeed = ({ dealId, logs, users }: { dealId: string; logs: DealLog[]; users: User[] }) => {
  const commentQueries = useQueries({ queries: logs.map((log) => ({ queryKey: ['deal-log-comments', dealId, log.id], queryFn: () => dealsService.getComments(dealId, log.id), select: (response: Awaited<ReturnType<typeof dealsService.getComments>>) => response.data.data.content })) });
  const add = useAddDealLogComment();
  const reply = useReplyDealLogComment();
  if (logs.length === 0) return <EmptyState title="No logs for this stage" message="The first update you save will appear here." />;
  return <div className="space-y-4">{logs.map((log, index) => { const reviewer = users.find((user) => user.id === log.createdById); return <article key={log.id} className="rounded-xl border p-4"><div className="mb-3 flex items-center gap-2"><UserAvatar name={reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : 'CRM user'} src={reviewer?.profilePhotoUrl ?? undefined} className="h-8 w-8" /><div><p className="text-sm font-semibold">{reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : 'CRM user'}</p><p className="text-[10px] text-muted-foreground">{formatDate(log.createdAt)} · {formatTime(log.createdAt)}</p></div><MoreHorizontal className="ml-auto h-4 w-4" /></div><div className="mb-2 flex flex-wrap gap-2 text-[10px] text-muted-foreground">{log.contactMode && <span>{log.contactMode.replace('_', ' ')}</span>}{log.responseType && <span>• {log.responseType.replace('_', ' ')}</span>}{log.amountPaid && <span>• {formatCurrency(log.amountPaid)}</span>}<span className="flex">{Array.from({ length: 5 }, (_, star) => <Star key={star} className={`h-3 w-3 ${star < (log.autoReviewScore ?? 0) ? 'fill-primary text-primary' : 'text-gray-200'}`} />)}</span></div><p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{log.body || log.specialConditions || 'No written notes.'}</p><div className="mt-3 border-t pt-3"><CommentThread comments={commentQueries[index]?.data ?? []} onAdd={(body) => add.mutate({ dealId, logId: log.id, body })} onReply={(commentId, body) => reply.mutate({ dealId, logId: log.id, commentId, body })} pending={add.isPending || reply.isPending} /></div></article>; })}</div>;
};
