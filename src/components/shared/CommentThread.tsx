'use client';
import { useState } from 'react';
import { MessageCircle, Reply } from 'lucide-react';
import type { Comment } from '@/types/deal.types';
import { formatRelative } from '@/lib/utils';
import { UserAvatar } from './UserAvatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const CommentThread = ({ comments, onAdd, onReply, pending = false }: { comments: Comment[]; onAdd?: (body: string) => void; onReply?: (commentId: string, body: string) => void; pending?: boolean }) => {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [body, setBody] = useState('');
  const [replying, setReplying] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const roots = comments.filter((comment) => !comment.parentCommentId);
  const submit = () => { const value = body.trim(); if (!value || !onAdd) return; onAdd(value); setBody(''); };
  return <div className="space-y-4">{roots.length === 0 ? <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">No comments yet. Start the conversation.</p> : roots.map((comment) => {
    const replies = comments.filter((reply) => reply.parentCommentId === comment.id);
    return <div key={comment.id} className="space-y-2"><div className="flex gap-3"><UserAvatar name={comment.authorName || 'CRM user'} className="h-8 w-8" /><div className="min-w-0 flex-1 rounded-xl bg-muted/70 p-3"><div className="flex justify-between gap-3 text-xs"><strong>{comment.authorName || 'CRM user'}</strong><span className="text-muted-foreground">{formatRelative(comment.createdAt)}</span></div><p className="mt-1 text-sm">{comment.body}</p>{onReply && <button type="button" onClick={() => setReplying(replying === comment.id ? null : comment.id)} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground"><Reply className="h-3 w-3" />Reply</button>}</div></div>
      {replying === comment.id && <div className="ml-11 flex gap-2"><Input value={replyBody} onChange={(event) => setReplyBody(event.target.value)} placeholder="Write a reply…" /><Button size="sm" disabled={pending || !replyBody.trim()} onClick={() => { if (!replyBody.trim()) return; onReply?.(comment.id, replyBody.trim()); setReplyBody(''); setReplying(null); }}>Reply</Button></div>}
      {replies.length > 0 && <div className="ml-11"><button type="button" onClick={() => setOpen((state) => ({ ...state, [comment.id]: !state[comment.id] }))} className="mb-2 text-xs font-semibold text-green-700">{open[comment.id] ? 'Hide' : `Show ${replies.length}`} {replies.length === 1 ? 'Reply' : 'Replies'}</button>{open[comment.id] && replies.map((reply) => <div key={reply.id} className="mb-2 flex gap-2"><UserAvatar name={reply.authorName || 'CRM user'} className="h-7 w-7" /><div className="rounded-xl bg-muted p-3 text-sm"><strong className="text-xs">{reply.authorName || 'CRM user'}</strong><p>{reply.body}</p></div></div>)}</div>}
    </div>;
  })}{onAdd && <div className="flex gap-2"><Input value={body} onChange={(event) => setBody(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); submit(); } }} placeholder="Type a comment…" /><Button size="icon" disabled={pending || !body.trim()} onClick={submit} aria-label="Send comment"><MessageCircle className="h-4 w-4" /></Button></div>}</div>;
};
