"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import { automationsService } from "@/services/automations.service";
import type {
  AutomationFilters,
  CreateAutomationRequest,
  UpdateAutomationRequest,
} from "@/types/automation.types";
const invalidate = (client: ReturnType<typeof useQueryClient>) =>
  client.invalidateQueries({ queryKey: ["automations"] });
export const useAutomations = (filters: AutomationFilters = {}) =>
  useQuery({
    queryKey: ["automations", filters],
    queryFn: () => automationsService.getAll(filters),
    select: (response) => response.data.data,
  });
export const useBirthdayAutomations = (filters: AutomationFilters = {}) =>
  useQuery({
    queryKey: ["automations", "birthday", filters],
    queryFn: () => automationsService.getBirthday(filters),
    select: (response) => response.data.data,
  });
export const useHolidayAutomations = (filters: AutomationFilters = {}) =>
  useQuery({
    queryKey: ["automations", "holiday", filters],
    queryFn: () => automationsService.getHolidays(filters),
    select: (response) => response.data.data,
  });
export const usePaymentAutomations = (filters: AutomationFilters = {}) =>
  useQuery({
    queryKey: ["automations", "payment", filters],
    queryFn: () => automationsService.getPayments(filters),
    select: (response) => response.data.data,
  });
export const useCreateAutomation = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAutomationRequest) =>
      automationsService.create(data),
    onSuccess: () => {
      void invalidate(client);
      toast.success("Automation created.");
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "The automation could not be created."),
      ),
  });
};
export const useUpdateAutomation = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAutomationRequest }) =>
      automationsService.update(id, data),
    onSuccess: () => {
      void invalidate(client);
      toast.success("Automation updated.");
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "The automation could not be updated."),
      ),
  });
};
export const useToggleAutomation = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => automationsService.toggle(id),
    onSuccess: () => {
      void invalidate(client);
      toast.success("Automation status updated.");
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "The automation could not be toggled."),
      ),
  });
};
