"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import { leadsService } from "@/services/leads.service";
import type {
  ConvertLeadRequest,
  LeadAssignmentConfig,
  LeadFilters,
  UpdateLeadRequest,
} from "@/types/lead.types";
import {
  demoLeadStats,
  demoLeads,
  demoPage,
  demoResponse,
  isDemoSession,
} from "@/lib/demo-data";

const refresh = (client: ReturnType<typeof useQueryClient>) =>
  Promise.all([
    client.invalidateQueries({ queryKey: ["leads"] }),
    client.invalidateQueries({ queryKey: ["lead-stats"] }),
  ]);

export const useLeads = (filters: LeadFilters = {}) =>
  useQuery({
    queryKey: ["leads", filters],
    queryFn: () =>
      isDemoSession()
        ? demoResponse(demoPage(demoLeads))
        : leadsService.getAll(filters),
    select: (response) => response.data.data,
  });
export const useLead = (id: string) =>
  useQuery({
    queryKey: ["leads", id],
    queryFn: () => {
      const demoLead = demoLeads.find((lead) => lead.id === id);
      return isDemoSession() && demoLead ? demoResponse(demoLead) : leadsService.getById(id);
    },
    select: (response) => response.data.data,
    enabled: Boolean(id),
  });
export const useLeadStats = () =>
  useQuery({
    queryKey: ["lead-stats"],
    queryFn: () =>
      isDemoSession() ? demoResponse(demoLeadStats) : leadsService.getStats(),
    select: (response) => response.data.data,
  });
export const useLeadAutoAssign = () =>
  useQuery({
    queryKey: ["lead-auto-assign"],
    queryFn: leadsService.getAutoAssignConfig,
    select: (response) => response.data.data,
  });
export const useCreateLead = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: leadsService.create,
    onSuccess: () => {
      void refresh(client);
      toast.success("Lead created successfully.");
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "The lead could not be created.")),
  });
};
export const useUpdateLead = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadRequest }) =>
      leadsService.update(id, data),
    onSuccess: () => {
      void refresh(client);
      toast.success("Lead details updated.");
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "The lead could not be updated.")),
  });
};
export const useDeleteLead = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: leadsService.delete,
    onSuccess: () => {
      void refresh(client);
      toast.success("Lead deleted.");
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "The lead could not be deleted.")),
  });
};
export const useConvertLead = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data = {},
    }: {
      id: string;
      data?: ConvertLeadRequest;
    }) => leadsService.convert(id, data),
    onSuccess: () => {
      void refresh(client);
      void client.invalidateQueries({ queryKey: ["deals"] });
      toast.success("Lead converted to a pipeline deal.");
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "The lead could not be converted."),
      ),
  });
};
export const useAssignLead = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, assignees }: { id: string; assignees: string[] }) =>
      leadsService.assign(id, assignees),
    onSuccess: () => {
      void refresh(client);
      toast.success("Lead assignment updated.");
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "The lead could not be assigned.")),
  });
};
export const useUpdateLeadAutoAssign = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: LeadAssignmentConfig) =>
      leadsService.updateAutoAssignConfig(data),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["lead-auto-assign"] });
      toast.success("Automatic lead assignment updated.");
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "Automatic assignment could not be updated."),
      ),
  });
};
