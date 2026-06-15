import type { AvailableSlots } from '@/types/availableSlots.types';

export type AvailableSlotForm = {
  pre_sale: string;
  quota_type: string;
  mount: string;
  amount: string;
};

export type FormErrors = Partial<Record<keyof AvailableSlotForm, string>>;

export type AvailableSlotPayload = Omit<AvailableSlots, 'id' | 'is_active'>;

export const emptyForm: AvailableSlotForm = {
  pre_sale: '',
  quota_type: '',
  mount: '',
  amount: '',
};

export const formToPayload = (
  form: AvailableSlotForm,
): AvailableSlotPayload => ({
  pre_sale: Number(form.pre_sale),
  quota_type: Number(form.quota_type),
  mount: Number(form.mount),
  amount: Number(form.amount),
});
