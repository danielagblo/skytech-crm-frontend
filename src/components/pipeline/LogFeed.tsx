"use client";
import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { MoreHorizontal, PhoneCall, Star } from "lucide-react";
import type { DealLog } from "@/types/deal.types";
import type { User } from "@/types/user.types";
import { dealsService } from "@/services/deals.service";
import { useAddDealLogComment, useReplyDealLogComment } from "@/hooks/useDeals";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { CommentThread } from "@/components/shared/CommentThread";
import { EmptyState } from "@/components/shared/EmptyState";

const humanize = (value: string | null) =>
  value == null ? null : value.replaceAll("_", " ").toLowerCase();

const formatMinutes = (seconds: number | null) =>
  seconds == null
    ? null
    : `${Math.floor(seconds / 60)}:${Math.round(seconds % 60)
        .toString()
        .padStart(2, "0")}`;

export const LogFeed = ({
  dealId,
  logs,
  users,
}: {
  dealId: string;
  logs: DealLog[];
  users: User[];
}) => {
  const commentQueries = useQueries({
    queries: logs.map((log) => ({
      queryKey: ["deal-log-comments", dealId, log.id],
      queryFn: () => dealsService.getComments(dealId, log.id),
      select: (
        response: Awaited<ReturnType<typeof dealsService.getComments>>,
      ) => response.data.data.content,
    })),
  });
  const add = useAddDealLogComment();
  const reply = useReplyDealLogComment();
  const ordered = useMemo(
    () =>
      [...logs].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [logs],
  );
  if (ordered.length === 0)
    return (
      <EmptyState
        title="No logs for this stage"
        message="The first update you save will appear here."
      />
    );
  return (
    <div className="space-y-4">
      {ordered.map((log, index) => {
        const reviewer = users.find((user) => user.id === log.createdById);
        const clientRating = reviewer?.clientRatingAverage ?? null;
        const clientRatingCount = reviewer?.clientRatingCount ?? 0;
        return (
          <article key={log.id} className="rounded-xl border p-4">
            <div className="mb-3 flex items-center gap-2">
              <UserAvatar
                name={
                  reviewer
                    ? `${reviewer.firstName} ${reviewer.lastName}`
                    : "CRM user"
                }
                src={reviewer?.profilePhotoUrl ?? undefined}
                className="h-8 w-8"
              />
              <div>
                <p className="text-sm font-semibold">
                  {reviewer
                    ? `${reviewer.firstName} ${reviewer.lastName}`
                    : "CRM user"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {formatDate(log.createdAt)} · {formatTime(log.createdAt)}
                </p>
              </div>
              <MoreHorizontal className="ml-auto h-4 w-4" />
            </div>
            <div className="mb-2 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
              {log.contactMode && (
                <span>{log.contactMode.replace("_", " ")}</span>
              )}
              {log.callDirection && (
                <span>• {humanize(log.callDirection)}</span>
              )}
              {log.callOutcome && (
                <span>• {humanize(log.callOutcome)}</span>
              )}
              {log.callDurationSeconds != null && (
                <span className="inline-flex items-center gap-0.5">
                  <PhoneCall className="h-3 w-3" />• {formatMinutes(log.callDurationSeconds)}
                </span>
              )}
              {log.responseType && (
                <span>• {log.responseType.replace("_", " ")}</span>
              )}
              {log.amountPaid != null && (
                <span>• {formatCurrency(log.amountPaid)}</span>
              )}
              {clientRating != null && clientRatingCount > 0 ? (
                <span
                  className="flex items-center gap-1"
                  title={`${clientRating.toFixed(2)} from ${clientRatingCount} submitted client ${clientRatingCount === 1 ? "rating" : "ratings"}`}
                >
                  <span className="flex">
                    {Array.from({ length: 5 }, (_, star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${star < Math.round(clientRating) ? "fill-primary text-primary" : "text-gray-200"}`}
                      />
                    ))}
                  </span>
                  <span>{clientRating.toFixed(1)}</span>
                </span>
              ) : (
                <span>No client ratings</span>
              )}
            </div>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              {log.body || log.specialConditions || "No written notes."}
            </p>
            <div className="mt-3 border-t pt-3">
              <CommentThread
                comments={commentQueries[index]?.data ?? []}
                onAdd={(body) => add.mutate({ dealId, logId: log.id, body })}
                onReply={(commentId, body) =>
                  reply.mutate({ dealId, logId: log.id, commentId, body })
                }
                pending={add.isPending || reply.isPending}
              />
            </div>
          </article>
        );
      })}
    </div>
  );
};
