export type DaysForm = {
  title: string;
  date: string;
};

export type FormErrors = Partial<Record<keyof DaysForm, string>>;

export const emptyForm: DaysForm = {
  title: '',
  date: '',
};
