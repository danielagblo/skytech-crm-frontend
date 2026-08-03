'use client';

import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { usePermission, type Permission } from '@/hooks/usePermission';
import { useAuthStore } from '@/store/authStore';
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';

export const PermissionGate = ({ permission, children }: { permission: Permission; children: React.ReactNode }) => {
  const hydrated = useAuthStore((state) => state.hydrated);
  const user = useAuthStore((state) => state.user);
  const { can } = usePermission();

  if (!hydrated || !user) return <Skeleton className="h-96 w-full" />;
  if (!can(permission)) return (
    <section className="surface p-6">
      <EmptyState
        icon={ShieldAlert}
        title="You do not have access to this area"
        message="Your role does not include this permission. Contact an administrator if your responsibilities have changed."
        action={<Link href="/home" className={buttonVariants()}>Return to dashboard</Link>}
      />
    </section>
  );
  return children;
};
