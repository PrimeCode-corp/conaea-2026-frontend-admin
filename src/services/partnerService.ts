import api from '@/lib/axios';
import type {
  Partner,
  PartnerNetworkNested,
  PartnerType,
} from '@/types/partners.types';

/**
 * Los auspiciadores se crean y editan con `multipart/form-data` (llevan el
 * archivo del logo). El `Content-Type` se fija explícitamente porque la
 * instancia `api` trae `application/json` por defecto y, con ese header, axios
 * serializa el `FormData` a JSON (el backend responde entonces "The submitted
 * data was not a file"). Al detectar un `FormData`, el adaptador del navegador
 * reemplaza este valor por el equivalente con `boundary`.
 */
const multipart = { headers: { 'Content-Type': 'multipart/form-data' } };

export const partnerService = {
  getAll: (type?: PartnerType) =>
    api
      .get<Partner[]>('/partners/partner/', {
        params: type ? { type } : undefined,
      })
      .then((res) => res.data),

  getById: (id: number) =>
    api.get<Partner>(`/partners/partner/${id}/`).then((res) => res.data),

  /** La respuesta de POST/PATCH no incluye `networks` (solo los GET). */
  create: (payload: FormData) =>
    api
      .post<Partner>('/partners/partner/', payload, multipart)
      .then((res) => res.data),

  update: (id: number, payload: FormData) =>
    api
      .patch<Partner>(`/partners/partner/${id}/`, payload, multipart)
      .then((res) => res.data),

  remove: (id: number) =>
    api
      .patch<Partner>(`/partners/partner/${id}/`, { is_active: false })
      .then((res) => res.data),

  /** Redes del auspiciador en su forma aplanada, lista para pintar. */
  getNetworks: (id: number) =>
    api
      .get<PartnerNetworkNested[]>(`/partners/partner/${id}/networks/`)
      .then((res) => res.data),
};
