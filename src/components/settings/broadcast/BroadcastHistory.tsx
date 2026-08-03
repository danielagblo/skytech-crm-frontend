"use client";
import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { useBroadcasts } from "@/hooks/useBroadcast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Pagination } from "@/components/shared/Pagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatTime } from "@/lib/utils";
export const BroadcastHistory = () => {
  const [page, setPage] = useState(1);
  const broadcasts = useBroadcasts({ page: page - 1, size: 20 });
  if (broadcasts.isLoading) return <Skeleton className="h-72" />;
  return (
    <section className="surface overflow-hidden">
      <div className="p-5">
        <h2 className="font-semibold">Recent Broadcast Activity</h2>
      </div>
      {broadcasts.isError ? (
        <EmptyState
          icon={AlertCircle}
          title="Broadcast history could not be loaded"
          message="This feature may require the Pro plan, or the server may be temporarily unavailable."
        />
      ) : (broadcasts.data?.content ?? []).length === 0 ? (
        <EmptyState
          title="No broadcasts yet"
          message="Compose your first message above to start the history."
        />
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Broadcast name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Created date</TableHead>
                  <TableHead>Message preview</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {broadcasts.data?.content.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-semibold">{row.name}</TableCell>
                    <TableCell>
                      <StatusBadge status={row.status} />
                    </TableCell>
                    <TableCell>{row.recipientCount.toLocaleString()}</TableCell>
                    <TableCell>{formatDate(row.createdAt)}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {row.messageContent}
                    </TableCell>
                    <TableCell>
                      {formatTime(
                        row.sentAt || row.scheduledAt || row.createdAt,
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination
            page={page}
            totalPages={Math.max(broadcasts.data?.totalPages ?? 1, 1)}
            onPageChange={setPage}
          />
        </>
      )}
    </section>
  );
};
