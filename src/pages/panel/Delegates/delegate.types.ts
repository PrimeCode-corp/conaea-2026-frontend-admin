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
