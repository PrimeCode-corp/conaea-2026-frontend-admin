import { create } from 'zustand';
import { participantService } from '@/services/participantService';
import type {
  ParticipantTableItem,
  ParticipantTableFilters,
} from '@/types/participants.types';

type ParticipantStore = {
  participants: ParticipantTableItem[];
  meta: { count: number; next: string | null; previous: string | null } | null;
  page: number;
  loading: boolean;
  error: string | null;

  fetchParticipants: (
    page?: number,
    params?: ParticipantTableFilters,
  ) => Promise<void>;
  invalidate: () => Promise<void>;
  removeParticipant: (id: number) => Promise<void>;
};

export const useParticipantStore = create<ParticipantStore>((set, get) => ({
  participants: [],
  meta: null,
  page: 1,
  loading: false,
  error: null,

  fetchParticipants: async (page = 1, params?) => {
    set({ loading: true, error: null });
    try {
      const data = await participantService.getTable({ ...params, page });
      set({
        participants: data.results,
        meta: { count: data.count, next: data.next, previous: data.previous },
        page,
      });
    } catch {
      set({ error: 'Error al cargar los participantes' });
    } finally {
      set({ loading: false });
    }
  },

  removeParticipant: async (id: number) => {
    try {
      await participantService.remove(id);
      set((state) => ({
        participants: state.participants.filter((p) => p.id !== id),
      }));
    } catch {
      throw new Error('Error al eliminar el participante');
    }
  },

  invalidate: async () => {
    await get().fetchParticipants(get().page);
  },
}));
