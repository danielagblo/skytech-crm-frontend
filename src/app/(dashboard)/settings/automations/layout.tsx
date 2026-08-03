import { PermissionGate } from "@/components/shared/PermissionGate";

export default function AutomationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PermissionGate permission="manage:automations">{children}</PermissionGate>
  );
}
