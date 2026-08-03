"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import { calendarService } from "@/services/calendar.service";
import type {
  CalendarFilters,
  CreateCalendarEventRequest,
} from "@/types/calendar.types";
export const useCalendar = (filters: CalendarFilters = {}) =>
  useQuery({
    queryKey: ["calendar", filters],
    queryFn: () => calendarService.getAll(filters),
    select: (response) => response.data.data,
  });
export const useCreateCalendarEvent = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCalendarEventRequest) =>
      calendarService.create(data),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["calendar"] });
      toast.success("Calendar event created.");
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "The calendar event could not be created."),
      ),
  });
};
export const useDeleteCalendarEvent = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: calendarService.delete,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["calendar"] });
      toast.success("Calendar event deleted.");
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "The calendar event could not be deleted."),
      ),
  });
};
