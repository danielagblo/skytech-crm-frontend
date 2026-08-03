"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { activitiesService } from "@/services/activities.service";
import { getApiErrorMessage } from "@/lib/api-error";
import type {
  ActivityFilters,
  CreateActivityRequest,
} from "@/types/activity.types";
export const useActivities = (filters: ActivityFilters = {}) =>
  useQuery({
    queryKey: ["activities", filters],
    queryFn: () => activitiesService.getAll(filters),
    select: (response) => response.data.data,
  });

export const useCreateActivity = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateActivityRequest) => activitiesService.create(data),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["activities"] });
      toast.success("Completion note saved.");
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "The completion note could not be saved."),
      ),
  });
};
