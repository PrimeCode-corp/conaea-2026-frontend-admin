import type { DelegatePayload } from '@/types/delegates.types';

export type DelegateForm = {
  fullname: string;
  type_delegate: string;
  cellphone: string;
  partner_university: string;
};

export type FormErrors = Partial<Record<keyof DelegateForm, string>>;

export const emptyForm: DelegateForm = {
  fullname: '',
  type_delegate: '',
  cellphone: '',
  partner_university: '',
};

export const formToPayload = (form: DelegateForm): DelegatePayload => ({
  fullname: form.fullname,
  type_delegate: form.type_delegate as 'Titular' | 'Alterno',
  cellphone: form.cellphone,
  partner_university: Number(form.partner_university),
});
