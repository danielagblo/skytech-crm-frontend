"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import { dealsService } from "@/services/deals.service";
import { useRequestRatingLink } from "@/hooks/useRatings";
import type { DealStage } from "@/types/api.types";
import type {
  CreateDealLogRequest,
  CreateDealRequest,
  DealFilters,
  UpdateDealRequest,
} from "@/types/deal.types";
import {
  demoPage,
  demoPipeline,
  demoResponse,
  demoDeals,
  isDemoSession,
} from "@/lib/demo-data";

const invalidate = (client: ReturnType<typeof useQueryClient>) =>
  Promise.all([
    client.invalidateQueries({ queryKey: ["deals"] }),
    client.invalidateQueries({ queryKey: ["pipeline"] }),
    client.invalidateQueries({ queryKey: ["dashboard"] }),
  ]);

export const useDeals = (filters: DealFilters = {}) =>
  useQuery({
    queryKey: ["deals", filters],
    queryFn: () =>
      isDemoSession()
        ? demoResponse(demoPage(demoDeals))
        : dealsService.getAll(filters),
    select: (response) => response.data.data,
  });
export const usePipeline = () =>
  useQuery({
    queryKey: ["pipeline"],
    queryFn: () =>
      isDemoSession() ? demoResponse(demoPipeline) : dealsService.getPipeline(),
    select: (response) => response.data.data,
  });
export const useDeal = (id: string) =>
  useQuery({
    queryKey: ["deals", id],
    queryFn: () => {
      const demoDeal = demoDeals.find((deal) => deal.id === id);
      return isDemoSession() && demoDeal ? demoResponse(demoDeal) : dealsService.getById(id);
    },
    select: (response) => response.data.data,
    enabled: Boolean(id),
  });
export const useDealLogs = (dealId: string) =>
  useQuery({
    queryKey: ["deal-logs", dealId],
    queryFn: () => isDemoSession() ? demoResponse(demoPage([])) : dealsService.getLogs(dealId),
    select: (response) => response.data.data.content,
    enabled: Boolean(dealId),
  });
export const useDealLogComments = (dealId: string, logId: string) =>
  useQuery({
    queryKey: ["deal-log-comments", dealId, logId],
    queryFn: () => dealsService.getComments(dealId, logId),
    select: (response) => response.data.data.content,
    enabled: Boolean(dealId && logId),
  });
export const useCreateDeal = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDealRequest) => dealsService.create(data),
    onSuccess: () => {
      void invalidate(client);
      toast.success("Deal created and added to the pipeline.");
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "The deal could not be created.")),
  });
};
export const useUpdateDeal = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDealRequest }) =>
      dealsService.update(id, data),
    onSuccess: () => {
      void invalidate(client);
      toast.success("Deal updated.");
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "The deal could not be updated.")),
  });
};
export const useDeleteDeal = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: dealsService.delete,
    onSuccess: () => {
      void invalidate(client);
      toast.success("Deal deleted.");
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "The deal could not be deleted.")),
  });
};
export const useUpdateDealStage = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: DealStage }) =>
      dealsService.updateStage(id, stage),
    onSuccess: () => {
      void invalidate(client);
      toast.success("Deal moved to the new stage.");
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "The deal could not be moved.")),
  });
};
export const useAddDealLog = () => {
  const client = useQueryClient();
  const requestRating = useRequestRatingLink();
  return useMutation({
    mutationFn: ({
      dealId,
      data,
    }: {
      dealId: string;
      data: CreateDealLogRequest;
    }) => dealsService.addLog(dealId, data),
    onSuccess: (_, variables) => {
      void client.invalidateQueries({
        queryKey: ["deal-logs", variables.dealId],
      });
      void invalidate(client);
      toast.success("Interaction log saved.");
      requestRating.mutate(variables.dealId);
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "The interaction log could not be saved."),
      ),
  });
};
export const useAddDealLogComment = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      dealId,
      logId,
      body,
    }: {
      dealId: string;
      logId: string;
      body: string;
    }) => dealsService.addComment(dealId, logId, body),
    onSuccess: (_, variables) => {
      void client.invalidateQueries({
        queryKey: ["deal-log-comments", variables.dealId, variables.logId],
      });
      toast.success("Comment posted.");
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "The comment could not be posted."),
      ),
  });
};
export const useReplyDealLogComment = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      dealId,
      logId,
      commentId,
      body,
    }: {
      dealId: string;
      logId: string;
      commentId: string;
      body: string;
    }) => dealsService.replyToComment(dealId, logId, commentId, body),
    onSuccess: (_, variables) => {
      void client.invalidateQueries({
        queryKey: ["deal-log-comments", variables.dealId, variables.logId],
      });
      toast.success("Reply posted.");
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "The reply could not be posted.")),
  });
};
