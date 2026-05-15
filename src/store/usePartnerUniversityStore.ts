import { create } from 'zustand';
import { partnerUniversityService } from '@/services/partnerUniversityService';
import type {
  PartnerUniversities,
  PartnerUniversityDetail,
  QuotaTypeOption,
} from '@/types/partnerUniversties.types';

type PartnerUniversityPayload = Omit<
  PartnerUniversities,
  'id' | 'is_active' | 'code'
>;

type PartnerUniversityFilters = { search?: string; quota_type_id?: number };

type PartnerUniversityStore = {
  universities: PartnerUniversityDetail[];
  quotaTypes: QuotaTypeOption[];
  meta: { count: number; next: string | null; previous: string | null } | null;
  page: number;
  lastParams: PartnerUniversityFilters;
  loading: boolean;
  error: string | null;

  fetchUniversities: (
    page?: number,
    params?: PartnerUniversityFilters,
  ) => Promise<void>;
  createUniversity: (payload: PartnerUniversityPayload) => Promise<void>;
  updateUniversity: (
    id: number,
    payload: Partial<PartnerUniversityPayload>,
  ) => Promise<void>;
  removeUniversity: (id: number) => Promise<void>;
  invalidateUniversities: () => Promise<void>;
};

export const usePartnerUniversityStore = create<PartnerUniversityStore>(
  (set, get) => ({
    universities: [],
    quotaTypes: [],
    meta: null,
    page: 1,
    lastParams: {},
    loading: false,
    error: null,

    fetchUniversities: async (page = 1, params?: PartnerUniversityFilters) => {
      set({ loading: true, error: null, lastParams: params ?? {}, page });
      try {
        const data = await partnerUniversityService.getAll(page, params);
        set({
          universities: data.results,
          quotaTypes: data.quota_types,
          meta: { count: data.count, next: data.next, previous: data.previous },
        });
      } catch {
        set({ error: 'Error al cargar las universidades' });
      } finally {
        set({ loading: false });
      }
    },

    createUniversity: async (payload) => {
      try {
        await partnerUniversityService.create(payload);
      } catch {
        throw new Error('Error al crear la universidad');
      }
    },

    updateUniversity: async (id, payload) => {
      try {
        await partnerUniversityService.update(id, payload);
      } catch {
        throw new Error('Error al actualizar la universidad');
      }
      try {
        const detail = await partnerUniversityService.getById(id);
        set((state) => ({
          universities: state.universities.map((u) =>
            u.id === id ? { ...u, ...detail } : u,
          ),
        }));
      } catch { /* keep current state */ }
      try {
        const { page, lastParams } = get();
        const data = await partnerUniversityService.getAll(page, lastParams);
        set({
          universities: data.results,
          meta: { count: data.count, next: data.next, previous: data.previous },
        });
      } catch { /* keep optimistic */ }
    },

    removeUniversity: async (id) => {
      try {
        await partnerUniversityService.remove(id);
      } catch {
        throw new Error('Error al eliminar la universidad');
      }
      set((state) => ({
        universities: state.universities.filter((u) => u.id !== id),
      }));
      try {
        const { page, lastParams } = get();
        const data = await partnerUniversityService.getAll(page, lastParams);
        set({
          universities: data.results,
          meta: { count: data.count, next: data.next, previous: data.previous },
        });
      } catch { /* keep optimistic */ }
    },

    invalidateUniversities: async () => {
      await get().fetchUniversities(get().page);
    },
  }),
);
