// services/availableSlotService.ts
import api from '@/lib/axios';
import type {
  AvailableSlots,
  AvailableSlotDetail,
  AvailableSlotListResponse,
} from '@/types/availableSlots.types';

type AvailableSlotPayload = Omit<AvailableSlots, 'id' | 'is_active'>;

export const availableSlotService = {
  getAll: (params?: { pre_sale_id?: number; quota_type_id?: number }) =>
    api
      .get<AvailableSlotListResponse>('/register/available-slot/', { params })
      .then((res) => res.data),

  getById: (id: number) =>
    api
      .get<AvailableSlotDetail>(`/register/available-slot/${id}/`)
      .then((res) => res.data),

  create: (payload: AvailableSlotPayload) =>
    api
      .post<AvailableSlots>('/register/available-slot/', payload)
      .then((res) => res.data),

  update: (id: number, payload: Partial<AvailableSlotPayload>) =>
    api
      .put<AvailableSlots>(`/register/available-slot/${id}/`, payload)
      .then((res) => res.data),

  remove: (id: number) =>
    api
      .patch<AvailableSlots>(`/register/available-slot/${id}/`, {
        is_active: false,
      })
      .then((res) => res.data),
};
