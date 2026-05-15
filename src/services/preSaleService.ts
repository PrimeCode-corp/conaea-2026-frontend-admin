// services/preSaleService.ts
import api from '@/lib/axios';
import type { PreSales } from '@/types/preSales.types';

type PreSalePayload = Omit<PreSales, 'id' | 'is_active'>;

export const preSaleService = {
  getAll: () =>
    api.get<PreSales[]>('/register/pre-sale/').then((res) => res.data),

  getById: (id: number) =>
    api.get<PreSales>(`/register/pre-sale/${id}/`).then((res) => res.data),

  create: (payload: PreSalePayload) =>
    api.post<PreSales>('/register/pre-sale/', payload).then((res) => res.data),

  update: (id: number, payload: Partial<PreSalePayload>) =>
    api
      .put<PreSales>(`/register/pre-sale/${id}/`, payload)
      .then((res) => res.data),

  toggleBookingMode: (id: number, booking_mode: boolean) =>
    api
      .patch<PreSales>(`/register/pre-sale/${id}/`, { booking_mode })
      .then((res) => res.data),

  remove: (id: number) =>
    api
      .patch<PreSales>(`/register/pre-sale/${id}/`, { is_active: false })
      .then((res) => res.data),

  getSlots: (id: number) =>
    api.get(`/register/pre-sale/${id}/slots/`).then((res) => res.data),
};
