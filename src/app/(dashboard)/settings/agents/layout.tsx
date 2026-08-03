import { PermissionGate } from '@/components/shared/PermissionGate';

export default function AgentsLayout({ children }: { children: React.ReactNode }) {
  return <PermissionGate permission="manage:users">{children}</PermissionGate>;
}
