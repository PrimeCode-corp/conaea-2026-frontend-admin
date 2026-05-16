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
