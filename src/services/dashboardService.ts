import api from '@/lib/axios';
import type { DashboardData } from '@/types/dashboard.types';

export const dashboardService = {
  get: () =>
    api.get<DashboardData>('/dashboard/').then((res) => res.data),
};
