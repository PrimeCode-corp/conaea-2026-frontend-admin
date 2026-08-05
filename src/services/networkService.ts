import api from '@/lib/axios';
import type { Network, NetworkPayload } from '@/types/partners.types';

export const networkService = {
  getAll: () =>
    api.get<Network[]>('/partners/network/').then((res) => res.data),

  getById: (id: number) =>
    api.get<Network>(`/partners/network/${id}/`).then((res) => res.data),

  create: (payload: NetworkPayload) =>
    api.post<Network>('/partners/network/', payload).then((res) => res.data),

  update: (id: number, payload: Partial<NetworkPayload>) =>
    api
      .patch<Network>(`/partners/network/${id}/`, payload)
      .then((res) => res.data),

  /**
   * Soft-delete. Devuelve `400` con `detail` si la red todavía tiene enlaces
   * activos, porque el catálogo es compartido entre auspiciadores.
   */
  remove: (id: number) =>
    api
      .patch<Network>(`/partners/network/${id}/`, { is_active: false })
      .then((res) => res.data),
};
