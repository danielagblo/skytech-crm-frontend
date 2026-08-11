import type { User, UserPerformance } from "@/types/user.types";
import { formatCurrency, formatDate, formatRelative } from "@/lib/utils";
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
export const AgentTable = ({
  agents,
  performance,
  onOpen,
}: {
  agents: User[];
  performance: Record<string, UserPerformance | undefined>;
  onOpen: (agent: User) => void;
}) => (
  <div className="surface overflow-hidden">
    {agents.length === 0 ? (
      <EmptyState
        title="No agents yet"
        message="Create the first agent account to build your team."
      />
    ) : (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Account / last login</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Logged call time</TableHead>
              <TableHead>Date added</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents.map((agent) => (
              <TableRow
                key={agent.id}
                onClick={() => onOpen(agent)}
                className="cursor-pointer"
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <UserAvatar
                      name={`${agent.firstName} ${agent.lastName}`}
                      src={agent.profilePhotoUrl ?? undefined}
                      className="h-8 w-8"
                    />
                    <strong>
                      {agent.firstName} {agent.lastName}
                    </strong>
                  </div>
                </TableCell>
                <TableCell>{agent.role}</TableCell>
                <TableCell>
                  <span className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${agent.active ? "bg-green-500" : "bg-gray-300"}`}
                    />
                    {agent.active
                      ? agent.lastLogin
                        ? `Enabled · logged in ${formatRelative(agent.lastLogin)}`
                        : "Enabled · never logged in"
                      : "Disabled"}
                  </span>
                </TableCell>
                <TableCell>
                  {formatCurrency(performance[agent.id]?.revenue ?? 0)}
                </TableCell>
                <TableCell title="Sum of recorded deal-call durations, not browser session time.">
                  {performance[agent.id]?.hours ?? 0} hrs
                </TableCell>
                <TableCell>{formatDate(agent.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )}
  </div>
);
