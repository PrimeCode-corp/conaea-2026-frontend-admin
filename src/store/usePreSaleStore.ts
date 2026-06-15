// store/usePreSaleStore.ts
import { create } from 'zustand';
import { preSaleService } from '@/services/preSaleService';
import type { PreSales } from '@/types/preSales.types';

type PreSalePayload = Omit<PreSales, 'id' | 'is_active'>;

type PreSaleStore = {
  preSales: PreSales[];
  loading: boolean;
  error: string | null;

  fetchPreSales: () => Promise<void>;
  createPreSale: (payload: PreSalePayload) => Promise<void>;
  updatePreSale: (
    id: number,
    payload: Partial<PreSalePayload>,
  ) => Promise<void>;
  toggleBookingMode: (id: number, booking_mode: boolean) => Promise<void>;
  removePreSale: (id: number) => Promise<void>;
  invalidatePreSales: () => Promise<void>;
};

export const usePreSaleStore = create<PreSaleStore>((set, get) => ({
  preSales: [],
  loading: false,
  error: null,

  fetchPreSales: async () => {
    const { preSales } = get();
    if (preSales.length > 0) return;
    set({ loading: true, error: null });
    try {
      const preSales = await preSaleService.getAll();
      set({ preSales });
    } catch {
      set({ error: 'Error al cargar las preventas' });
    } finally {
      set({ loading: false });
    }
  },

  createPreSale: async (payload) => {
    const newPreSale = await preSaleService.create(payload);
    set((state) => ({ preSales: [...state.preSales, newPreSale] }));
  },

  updatePreSale: async (id, payload) => {
    const updated = await preSaleService.update(id, payload);
    set((state) => ({
      preSales: state.preSales.map((p) => (p.id === id ? updated : p)),
    }));
  },

  toggleBookingMode: async (id, booking_mode) => {
    try {
      const updated = await preSaleService.toggleBookingMode(id, booking_mode);
      set((state) => ({
        preSales: state.preSales.map((p) => (p.id === id ? updated : p)),
      }));
    } catch {
      throw new Error('Error al cambiar el modo de reserva');
    }
  },

  removePreSale: async (id) => {
    await preSaleService.remove(id);
    set((state) => ({
      preSales: state.preSales.filter((p) => p.id !== id),
    }));
  },

  invalidatePreSales: async () => {
    set({ preSales: [] });
    await get().fetchPreSales();
  },
}));
