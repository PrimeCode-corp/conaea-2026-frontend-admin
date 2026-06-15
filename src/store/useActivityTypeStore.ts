import { create } from 'zustand';
import { activityTypeService } from '@/services/activityTypeService';
import { createCrudActions } from './createCrudActions';
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

export const useActivityTypeStore = create<ActivityTypeStore>((set, get) => {
  const crud = createCrudActions<
    ActivityTypeStore,
    ActivityTypes,
    ActivityTypePayload
  >(set, get, {
    key: 'activityTypes',
    service: activityTypeService,
    loadError: 'Error al cargar los tipos de actividad',
    createError: 'Error al crear el tipo de actividad',
    updateError: 'Error al actualizar el tipo de actividad',
  });

  return {
    activityTypes: [],
    loading: false,
    error: null,
    fetchActivityTypes: crud.fetch,
    createActivityType: crud.create,
    updateActivityType: crud.update,
    removeActivityType: crud.remove,
    invalidateActivityTypes: crud.invalidate,
  };
});
