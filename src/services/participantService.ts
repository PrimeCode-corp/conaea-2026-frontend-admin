import api from '@/lib/axios';
import type {
  ParticipantTableFilters,
  ParticipantTableResponse,
} from '@/types/participants.types';

export const participantService = {
  getTable: (filters: ParticipantTableFilters = {}) => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(
        ([, v]) => v !== undefined && v !== null && v !== '',
      ),
    );
    return api
      .get<ParticipantTableResponse>('/participants/table/', { params })
      .then((res) => res.data);
  },

  remove: (id: number) =>
    api
      .patch(`/participants/participant/${id}/`, { is_active: false })
      .then((res) => res.data),

  getStats: () =>
    api
      .get<{
        total: number;
        validated: number;
        pending: number;
      }>('/participants/stats/')
      .then((res) => res.data),
};
