export type IndividualCupForm = {
  pre_sale: string;
  partner_university: string;
  currency: string;
};

export type FormErrors = Partial<Record<keyof IndividualCupForm, string>>;

export type IndividualCupPayload = {
  pre_sale: number;
  partner_university: number;
  currency: number;
};

export const emptyForm: IndividualCupForm = {
  pre_sale: '',
  partner_university: '',
  currency: '',
};

export const formToPayload = (
  form: IndividualCupForm,
): IndividualCupPayload => ({
  pre_sale: Number(form.pre_sale),
  partner_university: Number(form.partner_university),
  currency: Number(form.currency),
});
