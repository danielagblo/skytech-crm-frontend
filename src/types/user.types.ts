import type { PageParams, PlanTier, Role } from "./api.types";

export interface User {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  username: string | null;
  role: Role;
  planTier: PlanTier;
  profilePhotoUrl: string | null;
  active: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export type UserSummary = Pick<
  User,
  "id" | "firstName" | "lastName" | "role" | "profilePhotoUrl"
>;

export interface UserFilters extends PageParams {
  search?: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone?: string;
  username?: string;
  role: Role;
  planTier?: PlanTier;
  active?: boolean;
}

export type UpdateUserRequest = CreateUserRequest;

export interface UserPerformance {
  rank: number;
  closedDeals: number;
  revenue: number;
  hours: number;
  byMonth: Record<string, number>;
}
