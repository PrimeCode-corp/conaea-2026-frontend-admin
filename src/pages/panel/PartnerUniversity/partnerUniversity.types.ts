import type { PartnerUniversities } from '@/types/partnerUniversties.types';

export type PartnerUniversityForm = {
  quota_type: string;
  name: string;
  abbreviation: string;
  country: string;
  region: string;
  place: string;
};

export type FormErrors = Partial<Record<keyof PartnerUniversityForm, string>>;

export type PartnerUniversityPayload = Omit<
  PartnerUniversities,
  'id' | 'is_active' | 'code'
>;

export const emptyForm: PartnerUniversityForm = {
  quota_type: '',
  name: '',
  abbreviation: '',
  country: '',
  region: '',
  place: '',
};

export const formToPayload = (
  form: PartnerUniversityForm,
): PartnerUniversityPayload => ({
  quota_type: Number(form.quota_type),
  name: form.name,
  abbreviation: form.abbreviation,
  country: form.country,
  region: form.region,
  place: form.place,
});
