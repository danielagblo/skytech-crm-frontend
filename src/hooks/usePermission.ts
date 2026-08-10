"use client";
import { useAuthStore } from "@/store/authStore";
import type { Role } from "@/types/api.types";

export type Permission =
  | "view:executive-performance"
  | "delete:leads"
  | "delete:deals"
  | "delete:tasks"
  | "manage:users"
  | "view:settings"
  | "view:all-leads"
  | "manage:broadcasts"
  | "manage:automations"
  | "manage:invoices"
  | "manage:department-targets";
const access: Record<Permission, Role[]> = {
  "view:executive-performance": ["ADMIN", "MANAGER"],
  "delete:leads": ["ADMIN"],
  "delete:deals": ["ADMIN"],
  "delete:tasks": ["ADMIN"],
  "manage:users": ["ADMIN"],
  "view:settings": ["ADMIN", "MANAGER"],
  "view:all-leads": ["ADMIN", "MANAGER"],
  "manage:broadcasts": ["ADMIN", "MANAGER"],
  "manage:automations": ["ADMIN", "MANAGER"],
  "manage:invoices": ["ADMIN", "MANAGER"],
  "manage:department-targets": ["ADMIN", "MANAGER"],
};
export const usePermission = () => {
  const role = useAuthStore((state) => state.user?.role);
  return {
    can: (permission: Permission) =>
      Boolean(role && access[permission].includes(role)),
    role,
  };
};
