import api from '@/lib/axios';
import type {
  PartnerNetworkDetail,
  PartnerNetworkPayload,
} from '@/types/partners.types';

/**
 * Enlaces entre un auspiciador y una red social. Ojo con la asimetría de la
 * API: en lectura `partner` y `network` vienen anidados, en escritura se
 * mandan como ids.
 */
export const partnerNetworkService = {
  getAll: (params?: { partner_id?: number; network_id?: number }) =>
    api
      .get<PartnerNetworkDetail[]>('/partners/partner-network/', { params })
      .then((res) => res.data),

  getById: (id: number) =>
    api
      .get<PartnerNetworkDetail>(`/partners/partner-network/${id}/`)
      .then((res) => res.data),

  create: (payload: PartnerNetworkPayload) =>
    api.post('/partners/partner-network/', payload).then((res) => res.data),

  update: (id: number, payload: Partial<PartnerNetworkPayload>) =>
    api
      .patch(`/partners/partner-network/${id}/`, payload)
      .then((res) => res.data),

  remove: (id: number) =>
    api
      .patch(`/partners/partner-network/${id}/`, { is_active: false })
      .then((res) => res.data),
};
