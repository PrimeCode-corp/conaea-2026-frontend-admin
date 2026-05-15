import { create } from 'zustand';
import { delegateService } from '@/services/delegateService';
import type {
  Delegate,
  DelegatePayload,
  DelegateUniversityOption,
} from '@/types/delegates.types';

type DelegateFilters = { search?: string; partner_university_id?: number };

type DelegateStore = {
  delegates: Delegate[];
  universities: DelegateUniversityOption[];
  meta: { count: number; next: string | null; previous: string | null } | null;
  page: number;
  lastParams: DelegateFilters;
  loading: boolean;
  error: string | null;
  fetchDelegates: (page?: number, params?: DelegateFilters) => Promise<void>;
  createDelegate: (payload: DelegatePayload) => Promise<void>;
  updateDelegate: (id: number, payload: Partial<DelegatePayload>) => Promise<void>;
  removeDelegate: (id: number) => Promise<void>;
};

export const useDelegateStore = create<DelegateStore>((set, get) => ({
  delegates: [],
  universities: [],
  meta: null,
  page: 1,
  lastParams: {},
  loading: false,
  error: null,

  fetchDelegates: async (page = 1, params?) => {
    set({ loading: true, error: null, lastParams: params ?? {}, page });
    try {
      const data = await delegateService.list({ page, ...params });
      set({
        delegates: data.results,
        universities: data.universities,
        meta: { count: data.count, next: data.next, previous: data.previous },
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
    try {
      const detail = await delegateService.getById(id);
      set((state) => ({
        delegates: state.delegates.map((d) =>
          d.id === id ? { ...d, ...detail } : d,
        ),
      }));
    } catch { /* keep current state */ }
    try {
      const { page, lastParams } = get();
      const data = await delegateService.list({ page, ...lastParams });
      set({
        delegates: data.results,
        meta: { count: data.count, next: data.next, previous: data.previous },
      });
    } catch { /* keep optimistic */ }
  },

  removeDelegate: async (id) => {
    try {
      await delegateService.remove(id);
    } catch {
      throw new Error('Error al eliminar el delegado');
    }
    set((state) => ({
      delegates: state.delegates.filter((d) => d.id !== id),
    }));
    try {
      const { page, lastParams } = get();
      const data = await delegateService.list({ page, ...lastParams });
      set({
        delegates: data.results,
        meta: { count: data.count, next: data.next, previous: data.previous },
      });
    } catch { /* keep optimistic */ }
  },
}));
