"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import { departmentTargetsService } from "@/services/department-target.service";
import type { TargetSetting } from "@/types/department-target.types";

export const currentPeriod = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const invalidate = (client: ReturnType<typeof useQueryClient>) =>
  client.invalidateQueries({ queryKey: ["department-targets"] });

export const useDepartmentTargets = (period: string) =>
  useQuery({
    queryKey: ["department-targets", "config", period],
    queryFn: () => departmentTargetsService.getConfig(period),
    select: (response) => response.data.data,
    enabled: Boolean(period),
  });

export const useDepartmentAchievement = (period: string) =>
  useQuery({
    queryKey: ["department-targets", "achievement", period],
    queryFn: () => departmentTargetsService.getAchievement(period),
    select: (response) => response.data.data,
    enabled: Boolean(period),
  });

export const useSaveDepartmentTargets = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      period,
      targets,
    }: {
      period: string;
      targets: TargetSetting[];
    }) => departmentTargetsService.saveConfig(period, targets),
    onSuccess: () => {
      void invalidate(client);
      toast.success("Department targets saved.");
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "The department targets could not be saved."),
      ),
  });
};