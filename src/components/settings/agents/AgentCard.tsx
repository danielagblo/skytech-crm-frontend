import type { User } from "@/types/user.types";
import { UserAvatar } from "@/components/shared/UserAvatar";
export const AgentCard = ({ agent }: { agent: User }) => (
  <div className="surface p-4">
    <div className="flex items-center gap-3">
      <UserAvatar
        name={`${agent.firstName} ${agent.lastName}`}
        src={agent.profilePhotoUrl ?? undefined}
        className="h-11 w-11"
      />
      <div>
        <p className="font-semibold">
          {agent.firstName} {agent.lastName}
        </p>
        <p className="text-xs text-muted-foreground">
          {agent.role} · {agent.active ? "Active" : "Inactive"}
        </p>
      </div>
    </div>
  </div>
);
