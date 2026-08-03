'use client';
import { useQuery } from '@tanstack/react-query';
import { activitiesService } from '@/services/activities.service';
import type { ActivityFilters } from '@/types/activity.types';
export const useActivities = (filters: ActivityFilters = {}) => useQuery({ queryKey: ['activities', filters], queryFn: () => activitiesService.getAll(filters), select: (response) => response.data.data });
