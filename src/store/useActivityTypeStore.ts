import { create } from 'zustand';
import { activityTypeService } from '@/services/activityTypeService';
import type { ActivityTypes } from '@/types/activityTypes.types';

type ActivityTypePayload = Omit<ActivityTypes, 'id' | 'is_active'>;

type ActivityTypeStore = {
  activityTypes: ActivityTypes[];
  loading: boolean;
  error: string | null;

  fetchActivityTypes: () => Promise<void>;
  createActivityType: (payload: ActivityTypePayload) => Promise<void>;
  updateActivityType: (
    id: number,
    payload: Partial<ActivityTypePayload>,
  ) => Promise<void>;
  removeActivityType: (id: number) => Promise<void>;
  invalidateActivityTypes: () => Promise<void>;
};

export const useActivityTypeStore = create<ActivityTypeStore>((set, get) => ({
  activityTypes: [],
  loading: false,
  error: null,

  fetchActivityTypes: async () => {
    const { activityTypes } = get();
    if (activityTypes.length > 0) return;
    set({ loading: true, error: null });
    try {
      const activityTypes = await activityTypeService.getAll();
      set({ activityTypes });
    } catch {
      set({ error: 'Error al cargar los tipos de actividad' });
    } finally {
      set({ loading: false });
    }
  },

  createActivityType: async (payload) => {
    try {
      const newActivityType = await activityTypeService.create(payload);
      set((state) => ({
        activityTypes: [...state.activityTypes, newActivityType],
      }));
    } catch {
      throw new Error('Error al crear el tipo de actividad');
    }
  },

  updateActivityType: async (id, payload) => {
    try {
      const updated = await activityTypeService.update(id, payload);
      set((state) => ({
        activityTypes: state.activityTypes.map((at) =>
          at.id === id ? updated : at,
        ),
      }));
    } catch {
      throw new Error('Error al actualizar el tipo de actividad');
    }
  },

  removeActivityType: async (id) => {
    await activityTypeService.remove(id);
    set((state) => ({
      activityTypes: state.activityTypes.filter((at) => at.id !== id),
    }));
  },

  invalidateActivityTypes: async () => {
    set({ activityTypes: [] });
    await get().fetchActivityTypes();
  },
}));
