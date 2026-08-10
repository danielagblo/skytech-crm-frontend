import { PermissionGate } from "@/components/shared/PermissionGate";

export default function DepartmentTargetsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PermissionGate permission="manage:department-targets">
      {children}
    </PermissionGate>
  );
}