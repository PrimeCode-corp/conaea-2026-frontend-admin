import api from '@/lib/axios';
import type { IndividualCup, IndividualCupListResponse } from '@/types/individualCups.types';

type IndividualCupPayload = {
  pre_sale: number;
  partner_university: number;
  currency: number;
};

export const individualCupService = {
  getAll: (params?: { pre_sale_id?: number; partner_university_id?: number; quota_type_id?: number }) =>
    api
      .get<IndividualCupListResponse>('/register/individual-cup/', { params })
      .then((res) => res.data),

  getById: (id: number) =>
    api
      .get<IndividualCup>(`/register/individual-cup/${id}/`)
      .then((res) => res.data),

  create: (payload: IndividualCupPayload) =>
    api
      .post<{ id: number; pre_sale: number; partner_university: number; currency: number; is_active: boolean }>(
        '/register/individual-cup/',
        payload,
      )
      .then((res) => res.data),

  update: (id: number, payload: Partial<IndividualCupPayload>) =>
    api
      .put<IndividualCup>(`/register/individual-cup/${id}/`, payload)
      .then((res) => res.data),

  remove: (id: number) =>
    api
      .patch(`/register/individual-cup/${id}/`, { is_active: false })
      .then((res) => res.data),
};
