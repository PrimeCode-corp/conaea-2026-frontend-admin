import { create } from 'zustand';
import { quotaTypeService } from '@/services/quotaTypeService';
import { createCrudActions } from './createCrudActions';
import type { QuotaTypes } from '@/types/quotaTypes.types';

type QuotaTypePayload = Omit<QuotaTypes, 'id' | 'is_active'>;

type QuotaTypeStore = {
  quotaTypes: QuotaTypes[];
  loading: boolean;
  error: string | null;

  fetchQuotaTypes: () => Promise<void>;
  createQuotaType: (payload: QuotaTypePayload) => Promise<void>;
  updateQuotaType: (
    id: number,
    payload: Partial<QuotaTypePayload>,
  ) => Promise<void>;
  removeQuotaType: (id: number) => Promise<void>;
  invalidateQuotaTypes: () => Promise<void>;
};

export const useQuotaTypeStore = create<QuotaTypeStore>((set, get) => {
  const crud = createCrudActions<QuotaTypeStore, QuotaTypes, QuotaTypePayload>(
    set,
    get,
    {
      key: 'quotaTypes',
      service: quotaTypeService,
      loadError: 'Error al cargar los tipos de cuota',
      createError: 'Error al crear el tipo de cuota',
      updateError: 'Error al actualizar el tipo de cuota',
    },
  );

  return {
    quotaTypes: [],
    loading: false,
    error: null,
    fetchQuotaTypes: crud.fetch,
    createQuotaType: crud.create,
    updateQuotaType: crud.update,
    removeQuotaType: crud.remove,
    invalidateQuotaTypes: crud.invalidate,
  };
});
