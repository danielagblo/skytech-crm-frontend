import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";
import type {
  DepartmentAchievementResponse,
  DepartmentTargetsResponse,
  TargetSetting,
} from "@/types/department-target.types";

export const departmentTargetsService = {
  getConfig: (period: string) =>
    api.get<ApiResponse<DepartmentTargetsResponse>>("/department-targets", {
      params: { period },
    }),
  saveConfig: (period: string, targets: TargetSetting[]) =>
    api.put<ApiResponse<DepartmentTargetsResponse>>(
      "/department-targets",
      { targets },
      { params: { period } },
    ),
  getAchievement: (period: string) =>
    api.get<ApiResponse<DepartmentAchievementResponse>>(
      "/department-targets/achievement",
      { params: { period } },
    ),
};