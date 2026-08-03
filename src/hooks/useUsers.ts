"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import { usersService } from "@/services/users.service";
import { useAuthStore } from "@/store/authStore";
import type {
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
} from "@/types/user.types";
export const useUsers = (filters: UserFilters = {}) =>
  useQuery({
    queryKey: ["users", filters],
    queryFn: () => usersService.getAll(filters),
    select: (response) => response.data.data,
  });
export const useUserPerformance = (id: string) =>
  useQuery({
    queryKey: ["user-performance", id],
    queryFn: () => usersService.getPerformance(id),
    select: (response) => response.data.data,
    enabled: Boolean(id),
  });
export const useCreateUser = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserRequest) => usersService.create(data),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["users"] });
      toast.success("Agent account created.");
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "The agent account could not be created."),
      ),
  });
};
export const useUpdateUser = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      usersService.update(id, data),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["users"] });
      toast.success("Agent details updated.");
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "The agent could not be updated.")),
  });
};
export const useDeleteUser = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: usersService.delete,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["users"] });
      toast.success("Agent access removed.");
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "The agent could not be removed.")),
  });
};
export const useUploadUserPhoto = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      usersService.uploadPhoto(id, file),
    onSuccess: (response) => {
      void client.invalidateQueries({ queryKey: ["users"] });
      void client.invalidateQueries({ queryKey: ["auth", "me"] });
      if (useAuthStore.getState().user?.id === response.data.data.id) useAuthStore.getState().setUser(response.data.data);
      toast.success("Profile photo updated.");
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "The profile photo could not be uploaded."),
      ),
  });
};
