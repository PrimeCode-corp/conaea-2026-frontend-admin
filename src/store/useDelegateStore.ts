import { create } from 'zustand';
import { delegateService } from '@/services/delegateService';
import type {
  Delegate,
  DelegatePayload,
  DelegateUniversityOption,
} from '@/types/delegates.types';

type DelegateStore = {
  delegates: Delegate[];
  universities: DelegateUniversityOption[];
  meta: { count: number; next: string | null; previous: string | null } | null;
  page: number;
  loading: boolean;
  error: string | null;
  fetchDelegates: (
    page?: number,
    params?: { search?: string; partner_university_id?: number },
  ) => Promise<void>;
  createDelegate: (payload: DelegatePayload) => Promise<void>;
  updateDelegate: (id: number, payload: Partial<DelegatePayload>) => Promise<void>;
  removeDelegate: (id: number) => Promise<void>;
};

export const useDelegateStore = create<DelegateStore>((set) => ({
  delegates: [],
  universities: [],
  meta: null,
  page: 1,
  loading: false,
  error: null,

  fetchDelegates: async (page = 1, params?) => {
    set({ loading: true, error: null });
    try {
      const data = await delegateService.list({ page, ...params });
      set({
        delegates: data.results,
        universities: data.universities,
        meta: { count: data.count, next: data.next, previous: data.previous },
        page,
      });
    } catch {
      set({ error: 'Error al cargar los delegados' });
    } finally {
      set({ loading: false });
    }
  },

  createDelegate: async (payload) => {
    try {
      await delegateService.create(payload);
    } catch {
      throw new Error('Error al crear el delegado');
    }
  },

  updateDelegate: async (id, payload) => {
    try {
      await delegateService.update(id, payload);
    } catch {
      throw new Error('Error al actualizar el delegado');
    }
  },

  removeDelegate: async (id) => {
    try {
      await delegateService.remove(id);
      set((state) => ({
        delegates: state.delegates.filter((d) => d.id !== id),
      }));
    } catch {
      throw new Error('Error al eliminar el delegado');
    }
  },
}));
