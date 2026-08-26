import { Star } from "lucide-react";
import type { DashboardOverview } from "@/types/dashboard.types";
import { formatCurrency } from "@/lib/utils";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
export const ExecutivePerformanceTable = ({
  rows,
}: {
  rows: DashboardOverview["executivePerformance"];
}) => (
  <section className="overflow-hidden border bg-card">
    <div className="px-5 py-4">
      <h3 className="text-base font-medium text-muted-foreground">
        Agent performance overview
      </h3>
    </div>
    {rows.length === 0 ? (
      <EmptyState
        title="No agent performance yet"
        message="Performance appears after agents receive deals and log activity."
      />
    ) : (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Deal closed</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Conversion rate</TableHead>
              <TableHead>Ratings</TableHead>
              <TableHead>Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.userId}>
                <TableCell>
                  <span
                    className={
                      row.rank <= 3
                        ? "font-semibold text-primary"
                        : "font-medium text-muted-foreground"
                    }
                  >
                    #{row.rank || index + 1}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <UserAvatar name={row.name} className="h-7 w-7" />
                    <span className="font-medium">{row.name}</span>
                  </div>
                </TableCell>
                <TableCell>{row.closedDeals}</TableCell>
                <TableCell>{formatCurrency(row.revenue)}</TableCell>
                <TableCell>{row.conversionRate.toFixed(1)}%</TableCell>
                <TableCell>
                  <div className="flex">
                    {Array.from({ length: 5 }, (_, star) => (
                      <Star
                        key={star}
                        className={`h-3.5 w-3.5 ${star < Math.round(row.rating) ? "fill-primary text-primary" : "text-gray-200"}`}
                      />
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div
                    className="tabular-nums"
                    title="Backend score: Bayesian-adjusted customer rating, revenue, auto-review quality, deals closed, and conversion rate."
                  >
                    <strong>{row.score.toFixed(1)}</strong>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )}
  </section>
);
