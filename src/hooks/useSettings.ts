'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/api-error';
import { settingsService } from '@/services/settings.service';
import type { LeadAssignmentConfig } from '@/types/lead.types';
export const useSettings = () => useQuery({ queryKey: ['settings'], queryFn: settingsService.get, select: (response) => response.data.data });
export const useLeadAssignmentSettings = () => useQuery({ queryKey: ['settings', 'lead-assignment'], queryFn: settingsService.getLeadAssignment, select: (response) => response.data.data });
export const useUpdateLeadAssignmentSettings = () => { const client = useQueryClient(); return useMutation({ mutationFn: (data: LeadAssignmentConfig) => settingsService.updateLeadAssignment(data), onSuccess: () => { void client.invalidateQueries({ queryKey: ['settings'] }); toast.success('Lead assignment settings saved.'); }, onError: (error) => toast.error(getApiErrorMessage(error, 'Lead assignment settings could not be saved.')) }); };
