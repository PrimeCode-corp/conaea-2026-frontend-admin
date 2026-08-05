import type { NetworkPayload } from '@/types/partners.types';

export type NetworkForm = {
  name: string;
  logo: string;
};

export type FormErrors = Partial<Record<keyof NetworkForm, string>>;

export const emptyForm: NetworkForm = {
  name: '',
  logo: '',
};

export const formToPayload = (form: NetworkForm): NetworkPayload => ({
  name: form.name.trim(),
  logo: form.logo,
});
