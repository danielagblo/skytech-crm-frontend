import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";
import type { LeadAssignmentConfig } from "@/types/lead.types";

export interface Settings {
  general: Record<string, unknown>;
  leadAssignment: LeadAssignmentConfig;
}

export const settingsService = {
  get: () => api.get<ApiResponse<Settings>>("/settings"),
  update: (general: Record<string, unknown>) =>
    api.put<ApiResponse<Settings>>("/settings", { general }),
  getLeadAssignment: () =>
    api.get<ApiResponse<LeadAssignmentConfig>>("/settings/lead-assignment"),
  updateLeadAssignment: (data: LeadAssignmentConfig) =>
    api.put<ApiResponse<LeadAssignmentConfig>>(
      "/settings/lead-assignment",
      data,
    ),
};
