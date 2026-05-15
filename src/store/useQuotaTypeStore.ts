import { create } from 'zustand';
import { quotaTypeService } from '@/services/quotaTypeService';
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

export const useQuotaTypeStore = create<QuotaTypeStore>((set, get) => ({
  quotaTypes: [],
  loading: false,
  error: null,

  fetchQuotaTypes: async () => {
    const { quotaTypes } = get();
    if (quotaTypes.length > 0) return;
    set({ loading: true, error: null });
    try {
      const quotaTypes = await quotaTypeService.getAll();
      set({ quotaTypes });
    } catch {
      set({ error: 'Error al cargar los tipos de cuota' });
    } finally {
      set({ loading: false });
    }
  },

  createQuotaType: async (payload) => {
    try {
      const newQuotaType = await quotaTypeService.create(payload);
      set((state) => ({ quotaTypes: [...state.quotaTypes, newQuotaType] }));
    } catch {
      throw new Error('Error al crear el tipo de cuota');
    }
  },

  updateQuotaType: async (id, payload) => {
    try {
      const updated = await quotaTypeService.update(id, payload);
      set((state) => ({
        quotaTypes: state.quotaTypes.map((q) => (q.id === id ? updated : q)),
      }));
    } catch {
      throw new Error('Error al actualizar el tipo de cuota');
    }
  },

  removeQuotaType: async (id) => {
    try {
      await quotaTypeService.remove(id);
      set((state) => ({
        quotaTypes: state.quotaTypes.filter((q) => q.id !== id),
      }));
    } catch {
      throw new Error('Error al eliminar el tipo de cuota');
    }
  },

  invalidateQuotaTypes: async () => {
    set({ quotaTypes: [] });
    await get().fetchQuotaTypes();
  },
}));
