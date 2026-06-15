import { create } from 'zustand';
import { dayService } from '@/services/dayService';
import { createCrudActions } from './createCrudActions';
import type { Days } from '@/types/days.types';
import type { Activities } from '@/types/activities.types';

type DayPayload = Omit<Days, 'id' | 'is_active'>;

type DayStore = {
  days: Days[];
  activities: Activities[];
  loading: boolean;
  error: string | null;

  fetchDays: () => Promise<void>;
  fetchActivities: (dayId: number) => Promise<void>;
  createDay: (payload: DayPayload) => Promise<void>;
  updateDay: (id: number, payload: Partial<DayPayload>) => Promise<void>;
  removeDay: (id: number) => Promise<void>;
  invalidateDays: () => Promise<void>;
};

export const useDayStore = create<DayStore>((set, get) => {
  const crud = createCrudActions<DayStore, Days, DayPayload>(set, get, {
    key: 'days',
    service: dayService,
    loadError: 'Error al cargar los días',
    createError: 'Error al crear el día',
    updateError: 'Error al actualizar el día',
  });

  return {
    days: [],
    activities: [],
    loading: false,
    error: null,

    fetchDays: crud.fetch,
    createDay: crud.create,
    updateDay: crud.update,
    removeDay: crud.remove,
    invalidateDays: crud.invalidate,

    fetchActivities: async (dayId) => {
      set({ loading: true, error: null });
      try {
        const activities = await dayService.getActivities(dayId);
        set({ activities });
      } catch {
        set({ error: 'Error al cargar actividades' });
      } finally {
        set({ loading: false });
      }
    },
  };
});
