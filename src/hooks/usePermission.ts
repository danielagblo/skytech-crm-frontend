"use client";
import { useAuthStore } from "@/store/authStore";
import type { Role } from "@/types/api.types";

export type Permission =
  | "delete:leads"
  | "delete:deals"
  | "delete:tasks"
  | "manage:users"
  | "view:settings"
  | "view:all-leads"
  | "manage:broadcasts"
  | "manage:automations";
const access: Record<Permission, Role[]> = {
  "delete:leads": ["ADMIN"],
  "delete:deals": ["ADMIN"],
  "delete:tasks": ["ADMIN"],
  "manage:users": ["ADMIN"],
  "view:settings": ["ADMIN", "MANAGER"],
  "view:all-leads": ["ADMIN", "MANAGER"],
  "manage:broadcasts": ["ADMIN", "MANAGER"],
  "manage:automations": ["ADMIN", "MANAGER"],
};
export const usePermission = () => {
  const role = useAuthStore((state) => state.user?.role);
  return {
    can: (permission: Permission) =>
      Boolean(role && access[permission].includes(role)),
    role,
  };
};
