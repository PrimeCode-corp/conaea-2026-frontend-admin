import { create } from 'zustand';
import { dashboardService } from '@/services/dashboardService';
import type { DashboardData } from '@/types/dashboard.types';

type DashboardStore = {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  fetchDashboard: () => Promise<void>;
};

export const useDashboardStore = create<DashboardStore>((set) => ({
  data: null,
  loading: false,
  error: null,

  fetchDashboard: async () => {
    set({ loading: true, error: null });
    try {
      const data = await dashboardService.get();
      set({ data });
    } catch {
      set({ error: 'Error al cargar el dashboard' });
    } finally {
      set({ loading: false });
    }
  },
}));
