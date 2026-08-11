"use client";
import type { Priority } from "@/types/api.types";
import type { User } from "@/types/user.types";
import { SearchInput } from "@/components/shared/SearchInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface LeadFiltersProps {
  search: string;
  onSearch: (value: string) => void;
  priority?: Priority;
  onPriority: (value?: Priority) => void;
  assignee?: string;
  onAssignee: (value?: string) => void;
  users: User[];
  onCreate: () => void;
}
export const LeadFilters = ({
  search,
  onSearch,
  priority,
  onPriority,
  assignee,
  onAssignee,
  users,
  onCreate,
}: LeadFiltersProps) => (
  <div className="flex flex-wrap gap-2 bg-card py-4">
    <SearchInput value={search} onChange={onSearch} placeholder="Search" />
    <Select
      onValueChange={(value) => onAssignee(value === "ALL" ? undefined : value)}
      value={assignee || "ALL"}
    >
      <SelectTrigger className="w-44">
        <SelectValue placeholder="Assignee" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">All assignees</SelectItem>
        {users.map((user) => (
          <SelectItem key={user.id} value={user.id}>
            {user.firstName} {user.lastName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    <Select
      onValueChange={(value) =>
        onPriority(value === "ALL" ? undefined : (value as Priority))
      }
      value={priority || "ALL"}
    >
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">All priorities</SelectItem>
        <SelectItem value="LOW">Low</SelectItem>
        <SelectItem value="MEDIUM">Medium</SelectItem>
        <SelectItem value="HIGH">High</SelectItem>
      </SelectContent>
    </Select>
    <Button className="ml-auto" onClick={onCreate}>
      <Plus className="h-4 w-4" />
      Create lead
    </Button>
  </div>
);
