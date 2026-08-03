import { PermissionGate } from '@/components/shared/PermissionGate';

export default function BroadcastLayout({ children }: { children: React.ReactNode }) {
  return <PermissionGate permission="manage:broadcasts">{children}</PermissionGate>;
}
