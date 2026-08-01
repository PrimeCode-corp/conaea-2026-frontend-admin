import { create } from 'zustand';
import { participantService } from '@/services/participantService';
import type {
  ParticipantTableItem,
  ParticipantTableFilters,
  ParticipantListOption,
} from '@/types/participants.types';
import type { ValidationResponse } from '@/types/validation.types';
import { validationService } from '@/services/validationService';

type ParticipantStore = {
  participants: ParticipantTableItem[];
  preSales: ParticipantListOption[];
  quotaTypes: ParticipantListOption[];
  meta: { count: number; next: string | null; previous: string | null } | null;
  page: number;
  lastParams: ParticipantTableFilters;
  loading: boolean;
  error: string | null;
  stats: { total: number; validated: number; pending: number } | null;
  /** Ids de participantes cuyo correo se está observando (envío en curso). */
  emailWatchingIds: number[];

  /**
   * Actualiza el estado del correo de un participante en la tabla. Lo usan
   * tanto la validación (envío de bienvenida) como el reenvío desde el modal
   * de historial, para que el icono del correo refleje el último resultado sin
   * recargar la lista.
   */
  setEmailStatus: (
    participantId: number,
    status: ParticipantTableItem['email_status'],
  ) => void;
  setEmailWatching: (participantId: number, watching: boolean) => void;

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
  preSales: [],
  quotaTypes: [],
  meta: null,
  page: 1,
  lastParams: {},
  loading: false,
  error: null,
  stats: null,
  emailWatchingIds: [],

  setEmailStatus: (participantId, status) => {
    set((state) => ({
      participants: state.participants.map((p) =>
        p.id === participantId ? { ...p, email_status: status } : p,
      ),
    }));
  },

  setEmailWatching: (participantId, watching) => {
    set((state) => ({
      emailWatchingIds: watching
        ? state.emailWatchingIds.includes(participantId)
          ? state.emailWatchingIds
          : [...state.emailWatchingIds, participantId]
        : state.emailWatchingIds.filter((id) => id !== participantId),
    }));
  },

  fetchParticipants: async (page = 1, params?) => {
    set({ loading: true, error: null, lastParams: params ?? {}, page });
    try {
      const data = await participantService.getTable({ ...params, page });
      set({
        participants: data.results,
        preSales: data.pre_sales,
        quotaTypes: data.quota_types,
        meta: { count: data.count, next: data.next, previous: data.previous },
      });
    } catch {
      set({ error: 'Error al cargar los participantes' });
    } finally {
      set({ loading: false });
    }
  },

  updateParticipant: async (id, formData) => {
    const updated = await participantService.update(id, formData);
    // Optimistic: aplica los campos conocidos de inmediato
    set((state) => ({
      participants: state.participants.map((p) =>
        p.id === id ? { ...p, ...updated } : p,
      ),
    }));
    // Re-fetch silencioso para obtener campos calculados (university_name, full_name, etc.)
    const { page, lastParams } = get();
    try {
      const data = await participantService.getTable({ ...lastParams, page });
      set({
        participants: data.results,
        meta: { count: data.count, next: data.next, previous: data.previous },
      });
    } catch {
      // si falla el re-fetch silencioso, los datos optimistas se mantienen
    }
  },

  removeParticipant: async (id: number) => {
    try {
      await participantService.remove(id);
    } catch {
      throw new Error('Error al eliminar el participante');
    }
    set((state) => ({
      participants: state.participants.filter((p) => p.id !== id),
    }));
    try {
      const { page, lastParams } = get();
      const data = await participantService.getTable({ ...lastParams, page });
      set({
        participants: data.results,
        meta: { count: data.count, next: data.next, previous: data.previous },
      });
    } catch { /* keep optimistic */ }
  },

  invalidate: async () => {
    await get().fetchParticipants(get().page);
  },

  toggleEnrollmentValidation: async (enrollmentId) => {
    try {
      const result = await validationService.toggleEnrollment(enrollmentId);
      const { page, lastParams } = get();
      try {
        const data = await participantService.getTable({ ...lastParams, page });
        set({ participants: data.results, meta: { count: data.count, next: data.next, previous: data.previous } });
      } catch { /* keep current state */ }
      return result;
    } catch {
      throw new Error('Error al validar la ficha');
    }
  },

  toggleTransactionValidation: async (transactionId) => {
    try {
      const result = await validationService.toggleTransaction(transactionId);
      const { page, lastParams } = get();
      try {
        const data = await participantService.getTable({ ...lastParams, page });
        set({ participants: data.results, meta: { count: data.count, next: data.next, previous: data.previous } });
      } catch { /* keep current state */ }
      return result;
    } catch {
      throw new Error('Error al validar la transacción');
    }
  },

  toggleRegistrationValidation: async (participantId) => {
    try {
      const result = await validationService.toggleRegistration(participantId);
      const { page, lastParams } = get();
      try {
        const data = await participantService.getTable({ ...lastParams, page });
        set({ participants: data.results, meta: { count: data.count, next: data.next, previous: data.previous } });
      } catch { /* keep current state */ }
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
