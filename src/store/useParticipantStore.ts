import { create } from 'zustand';
import { participantService } from '@/services/participantService';
import type {
  ParticipantTableItem,
  ParticipantTableFilters,
} from '@/types/participants.types';
import type { ValidationResponse } from '@/types/validation.types';
import { validationService } from '@/services/validationService';

type ParticipantStore = {
  participants: ParticipantTableItem[];
  meta: { count: number; next: string | null; previous: string | null } | null;
  page: number;
  loading: boolean;
  error: string | null;
  stats: { total: number; validated: number; pending: number } | null;

  fetchParticipants: (
    page?: number,
    params?: ParticipantTableFilters,
  ) => Promise<void>;
  invalidate: () => Promise<void>;
  removeParticipant: (id: number) => Promise<void>;
  updateParticipant: (id: number, formData: FormData) => Promise<void>;

  toggleEnrollmentValidation: (
    enrollmentId: number,
  ) => Promise<ValidationResponse>;
  toggleTransactionValidation: (
    transactionId: number,
  ) => Promise<ValidationResponse>;
  toggleRegistrationValidation: (
    participantId: number,
  ) => Promise<ValidationResponse>;

  fetchStats: () => Promise<void>;
};

export const useParticipantStore = create<ParticipantStore>((set, get) => ({
  participants: [],
  meta: null,
  page: 1,
  loading: false,
  error: null,
  stats: null,

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

  updateParticipant: async (id, formData) => {
    await participantService.update(id, formData);
    await get().invalidate();
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

  toggleEnrollmentValidation: async (enrollmentId) => {
    try {
      const result = await validationService.toggleEnrollment(enrollmentId);
      await get().invalidate();
      return result;
    } catch {
      throw new Error('Error al validar la ficha');
    }
  },

  toggleTransactionValidation: async (transactionId) => {
    try {
      const result = await validationService.toggleTransaction(transactionId);
      await get().invalidate();
      return result;
    } catch {
      throw new Error('Error al validar la transacción');
    }
  },

  toggleRegistrationValidation: async (participantId) => {
    try {
      const result = await validationService.toggleRegistration(participantId);
      await get().invalidate();
      return result;
    } catch {
      throw new Error('Error al validar el registro');
    }
  },

  fetchStats: async () => {
    try {
      const stats = await participantService.getStats();
      set({ stats });
    } catch {
      console.error('Error al cargar estadísticas');
    }
  },
}));
