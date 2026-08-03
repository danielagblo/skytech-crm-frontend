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
  <section className="surface overflow-hidden">
    <div className="p-5">
      <h3 className="font-semibold">Executive performance overview</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Live sales performance across the team
      </p>
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
              <TableHead>Executive</TableHead>
              <TableHead>Deal closed</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Conversion rate</TableHead>
              <TableHead>Ratings</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.userId}>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )}
  </section>
);
