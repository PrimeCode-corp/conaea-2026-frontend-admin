import { create } from 'zustand';
import { activityService } from '@/services/activityService';
import type { Activities, ActivityDetail } from '@/types/activities.types';

type ActivityPayload = Omit<Activities, 'id' | 'is_active'>;

type ActivityStore = {
  activities: ActivityDetail[];
  loading: boolean;
  error: string | null;

  fetchActivities: (filters?: {
    day_id?: number;
    activity_type_id?: number;
    speaker_id?: number;
  }) => Promise<void>;

  createActivity: (payload: ActivityPayload) => Promise<void>;
  updateActivity: (
    id: number,
    payload: Partial<ActivityPayload>,
  ) => Promise<void>;
  removeActivity: (id: number) => Promise<void>;
};
export const useActivityStore = create<ActivityStore>((set) => ({
  activities: [],
  loading: false,
  error: null,

  fetchActivities: async (filters) => {
    set({ loading: true, error: null });
    try {
      const activities = await activityService.getAll(filters);
      set({ activities });
    } catch {
      set({ error: 'Error al cargar actividades' });
    } finally {
      set({ loading: false });
    }
  },

  createActivity: async (payload) => {
    try {
      const created = await activityService.create(payload);
      const detail = await activityService.getById(created.id);
      set((state) => ({ activities: [...state.activities, detail] }));
    } catch {
      throw new Error('Error al crear la actividad');
    }
  },

  updateActivity: async (id, payload) => {
    try {
      await activityService.update(id, payload);
      const detail = await activityService.getById(id);
      set((state) => ({
        activities: state.activities.map((a) => (a.id === id ? detail : a)),
      }));
    } catch {
      throw new Error('Error al actualizar la actividad');
    }
  },

  removeActivity: async (id) => {
    try {
      await activityService.remove(id);
      set((state) => ({
        activities: state.activities.filter((a) => a.id !== id),
      }));
    } catch {
      throw new Error('Error al eliminar la actividad');
    }
  },
}));
