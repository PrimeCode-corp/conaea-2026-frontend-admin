import { create } from 'zustand';
import { individualCupService } from '@/services/individualCupService';
import type {
  IndividualCup,
  PreSaleOption,
  QuotaTypeOption,
  UniversityOption,
} from '@/types/individualCups.types';

type IndividualCupPayload = {
  pre_sale: number;
  partner_university: number;
  currency: number;
};

type IndividualCupStore = {
  individualCups: IndividualCup[];
  universities: UniversityOption[];
  preSales: PreSaleOption[];
  quotaTypes: QuotaTypeOption[];
  loading: boolean;
  error: string | null;

  fetchIndividualCups: (params?: { pre_sale_id?: number; partner_university_id?: number; quota_type_id?: number }) => Promise<void>;
  createIndividualCup: (payload: IndividualCupPayload) => Promise<void>;
  updateIndividualCup: (id: number, payload: Partial<IndividualCupPayload>) => Promise<void>;
  removeIndividualCup: (id: number) => Promise<void>;
  invalidateIndividualCups: () => Promise<void>;
};

export const useIndividualCupStore = create<IndividualCupStore>((set, get) => ({
  individualCups: [],
  universities: [],
  preSales: [],
  quotaTypes: [],
  loading: false,
  error: null,

  fetchIndividualCups: async (params) => {
    set({ loading: true, error: null });
    try {
      const data = await individualCupService.getAll(params);
      set({
        individualCups: data.results,
        preSales:       data.pre_sales,
        quotaTypes:     data.quota_types,
        universities:   data.universities,
      });
    } catch {
      set({ error: 'Error al cargar los cupos individuales' });
    } finally {
      set({ loading: false });
    }
  },

  createIndividualCup: async (payload) => {
    const created = await individualCupService.create(payload);
    const detail = await individualCupService.getById(created.id);
    set((state) => ({ individualCups: [...state.individualCups, detail] }));
  },

  updateIndividualCup: async (id, payload) => {
    await individualCupService.update(id, payload);
    const detail = await individualCupService.getById(id);
    set((state) => ({
      individualCups: state.individualCups.map((c) => {
        if (c.id !== id) return c;
        return {
          ...detail,
          used:         detail.used         ?? c.used,
          total_amount: detail.total_amount  ?? c.total_amount,
          used_total:   detail.used_total    ?? c.used_total,
        };
      }),
    }));
  },

  removeIndividualCup: async (id) => {
    try {
      await individualCupService.remove(id);
      set((state) => ({
        individualCups: state.individualCups.filter((c) => c.id !== id),
      }));
    } catch {
      throw new Error('Error al eliminar el cupo individual');
    }
  },

  invalidateIndividualCups: async () => {
    set({ individualCups: [] });
    await get().fetchIndividualCups();
  },
}));
