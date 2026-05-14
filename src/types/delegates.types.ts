export type DelegateUniversity = {
  id: number;
  name: string;
  abbreviation: string;
  code: string;
};

export type Delegate = {
  id: number;
  fullname: string;
  type_delegate: 'Titular' | 'Alterno';
  cellphone: string;
  partner_university: DelegateUniversity;
};

export type DelegateUniversityOption = {
  id: number;
  name: string;
  abbreviation: string;
};

export type DelegateListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  universities: DelegateUniversityOption[];
  results: Delegate[];
};

export type DelegatePayload = {
  fullname: string;
  type_delegate: 'Titular' | 'Alterno';
  cellphone: string;
  partner_university: number;
  is_active?: boolean;
};
