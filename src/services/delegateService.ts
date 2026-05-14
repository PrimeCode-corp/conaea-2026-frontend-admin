import api from '@/lib/axios';
import type {
  Delegate,
  DelegateListResponse,
  DelegatePayload,
} from '@/types/delegates.types';

type DelegateParams = {
  partner_university_id?: number;
  search?: string;
  page?: number;
  page_size?: number;
};

export const delegateService = {
  list: (params?: DelegateParams) =>
    api
      .get<DelegateListResponse>('/participants/delegates/', { params })
      .then((res) => res.data),

  getById: (id: number) =>
    api.get<Delegate>(`/participants/delegates/${id}/`).then((res) => res.data),

  create: (payload: DelegatePayload) =>
    api
      .post<Delegate>('/participants/delegates/', payload)
      .then((res) => res.data),

  update: (id: number, payload: Partial<DelegatePayload>) =>
    api
      .patch<Delegate>(`/participants/delegates/${id}/`, payload)
      .then((res) => res.data),

  remove: (id: number) =>
    api.delete(`/participants/delegates/${id}/`).then((res) => res.data),
};
