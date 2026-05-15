import api from '@/lib/axios';
import type {
  ParticipantTableFilters,
  ParticipantTableItem,
  ParticipantListResponse,
} from '@/types/participants.types';

export const participantService = {
  getTable: (filters: ParticipantTableFilters = {}) => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(
        ([, v]) => v !== undefined && v !== null && v !== '',
      ),
    );
    return api
      .get<ParticipantListResponse>('/participants/table/', { params })
      .then((res) => res.data);
  },

  update: (id: number, formData: FormData) =>
    api
      .patch<ParticipantTableItem>(`/participants/participant/${id}/update/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data),

  remove: (id: number) =>
    api
      .patch(`/participants/participant/${id}/deactivate/`)
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
