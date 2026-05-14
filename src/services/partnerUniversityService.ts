// services/partnerUniversityService.ts
import api from '@/lib/axios';
import type {
  PartnerUniversities,
  PartnerUniversityDetail,
  PartnerUniversityListResponse,
} from '@/types/partnerUniversties.types';

type PartnerUniversityPayload = Omit<
  PartnerUniversities,
  'id' | 'is_active' | 'code'
>;

export const partnerUniversityService = {
  getAll: (page = 1, params?: { search?: string; quota_type_id?: number }) =>
    api
      .get<PartnerUniversityListResponse>('/participants/partner-universities/', {
        params: { page, ...params },
      })
      .then((res) => res.data),

  getById: (id: number) =>
    api
      .get<PartnerUniversityDetail>(`/participants/partner-universities/${id}/`)
      .then((res) => res.data),

  create: (payload: PartnerUniversityPayload) =>
    api
      .post<PartnerUniversities>('/participants/partner-universities/', payload)
      .then((res) => res.data),

  update: (id: number, payload: Partial<PartnerUniversityPayload>) =>
    api
      .put<PartnerUniversities>(
        `/participants/partner-universities/${id}/`,
        payload,
      )
      .then((res) => res.data),

  remove: (id: number) =>
    api
      .patch<PartnerUniversities>(`/participants/partner-universities/${id}/`, {
        is_active: false,
      })
      .then((res) => res.data),

  getDelegates: (id: number) =>
    api
      .get(`/participants/partner-universities/${id}/delegates/`)
      .then((res) => res.data),

  search: (query?: string) =>
    api
      .get<{ code: string; name: string; abbreviation: string }[]>(
        '/participants/partner-universities/select/',
        { params: query ? { search: query } : {} },
      )
      .then((res) => res.data),
};
