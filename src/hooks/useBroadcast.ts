"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import { broadcastService } from "@/services/broadcast.service";
import type {
  BroadcastFilters,
  CreateBroadcastRequest,
} from "@/types/broadcast.types";
import {
  demoBroadcasts,
  demoPage,
  demoResponse,
  demoSegments,
  isDemoSession,
} from "@/lib/demo-data";
const invalidate = (client: ReturnType<typeof useQueryClient>) =>
  client.invalidateQueries({ queryKey: ["broadcasts"] });
export const useBroadcasts = (filters: BroadcastFilters = {}) =>
  useQuery({
    queryKey: ["broadcasts", filters],
    queryFn: () =>
      isDemoSession()
        ? demoResponse(demoPage(demoBroadcasts))
        : broadcastService.getAll(filters),
    select: (response) => response.data.data,
  });
export const useRecentBroadcasts = (filters: BroadcastFilters = {}) =>
  useQuery({
    queryKey: ["broadcasts", "recent", filters],
    queryFn: () =>
      isDemoSession()
        ? demoResponse(demoPage(demoBroadcasts))
        : broadcastService.getRecent(filters),
    select: (response) => response.data.data,
  });
export const useContactSegments = () =>
  useQuery({
    queryKey: ["broadcast-segments"],
    queryFn: () =>
      isDemoSession()
        ? demoResponse(demoSegments)
        : broadcastService.getSegments(),
    select: (response) => response.data.data,
  });
export const useCreateBroadcast = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBroadcastRequest) => broadcastService.create(data),
    onSuccess: () => {
      void invalidate(client);
      toast.success("Broadcast draft saved.");
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "The broadcast could not be saved."),
      ),
  });
};
export const useSendBroadcast = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: broadcastService.send,
    onSuccess: () => {
      void invalidate(client);
      toast.success("Broadcast sent successfully.");
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(
          error,
          "The broadcast could not be sent. Check the recipient consent and messaging configuration.",
        ),
      ),
  });
};
export const useScheduleBroadcast = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, scheduledAt }: { id: string; scheduledAt: string }) =>
      broadcastService.schedule(id, scheduledAt),
    onSuccess: () => {
      void invalidate(client);
      toast.success("Broadcast scheduled.");
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "The broadcast could not be scheduled."),
      ),
  });
};
