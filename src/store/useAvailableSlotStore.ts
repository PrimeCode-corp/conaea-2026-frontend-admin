// store/useAvailableSlotStore.ts
import { create } from 'zustand';
import { availableSlotService } from '@/services/availableSlotService';
import type {
  AvailableSlots,
  AvailableSlotDetail,
} from '@/types/availableSlots.types';

type AvailableSlotPayload = Omit<AvailableSlots, 'id' | 'is_active'>;

type AvailableSlotStore = {
  availableSlots: AvailableSlotDetail[];
  loading: boolean;
  error: string | null;

  fetchAvailableSlots: (params?: {
    pre_sale_id?: number;
    quota_type_id?: number;
  }) => Promise<void>;
  createAvailableSlot: (payload: AvailableSlotPayload) => Promise<void>;
  updateAvailableSlot: (
    id: number,
    payload: Partial<AvailableSlotPayload>,
  ) => Promise<void>;
  removeAvailableSlot: (id: number) => Promise<void>;
  invalidateAvailableSlots: () => Promise<void>;
};

export const useAvailableSlotStore = create<AvailableSlotStore>((set, get) => ({
  availableSlots: [],
  loading: false,
  error: null,

  fetchAvailableSlots: async (params) => {
    const { availableSlots } = get();
    if (availableSlots.length > 0 && !params) return;
    set({ loading: true, error: null });
    try {
      const availableSlots = await availableSlotService.getAll(params);
      set({ availableSlots });
    } catch {
      set({ error: 'Error al cargar los cupos disponibles' });
    } finally {
      set({ loading: false });
    }
  },

  createAvailableSlot: async (payload) => {
    try {
      const created = await availableSlotService.create(payload);
      const detail = await availableSlotService.getById(created.id);
      set((state) => ({ availableSlots: [...state.availableSlots, detail] }));
    } catch {
      throw new Error('Error al crear el cupo');
    }
  },

  updateAvailableSlot: async (id, payload) => {
    try {
      await availableSlotService.update(id, payload);
      const detail = await availableSlotService.getById(id);
      set((state) => ({
        availableSlots: state.availableSlots.map((s) =>
          s.id === id ? detail : s,
        ),
      }));
    } catch {
      throw new Error('Error al actualizar el cupo');
    }
  },

  removeAvailableSlot: async (id) => {
    try {
      await availableSlotService.remove(id);
      set((state) => ({
        availableSlots: state.availableSlots.filter((s) => s.id !== id),
      }));
    } catch {
      throw new Error('Error al eliminar el cupo');
    }
  },

  invalidateAvailableSlots: async () => {
    set({ availableSlots: [] });
    await get().fetchAvailableSlots();
  },
}));
