import { create } from 'zustand';
import { dayService } from '@/services/dayService';
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

export const useDayStore = create<DayStore>((set, get) => ({
  days: [],
  activities: [],
  loading: false,
  error: null,

  fetchDays: async () => {
    const { days } = get();
    if (days.length > 0) return;
    set({ loading: true, error: null });
    try {
      const days = await dayService.getAll();
      set({ days });
    } catch {
      set({ error: 'Error al cargar los días' });
    } finally {
      set({ loading: false });
    }
  },

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

  createDay: async (payload) => {
    try {
      const newDay = await dayService.create(payload);
      set((state) => ({ days: [...state.days, newDay] }));
    } catch {
      throw new Error('Error al crear el día');
    }
  },

  updateDay: async (id, payload) => {
    try {
      const updated = await dayService.update(id, payload);
      set((state) => ({
        days: state.days.map((d) => (d.id === id ? updated : d)),
      }));
    } catch {
      throw new Error('Error al actualizar el día');
    }
  },

  removeDay: async (id) => {
    try {
      await dayService.remove(id);
      set((state) => ({
        days: state.days.filter((d) => d.id !== id),
      }));
    } catch {
      throw new Error('Error al eliminar el día');
    }
  },

  invalidateDays: async () => {
    set({ days: [] });
    await get().fetchDays();
  },
}));
