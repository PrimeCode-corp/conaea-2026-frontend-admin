export type ParticipantFilterForm = {
  pre_sale_id: string;
  document_type: string;
  quota_type_id: string;
  university_type: string;
  university_code: string;
  search: string;
};

export const emptyFilterForm: ParticipantFilterForm = {
  pre_sale_id: '',
  document_type: '',
  quota_type_id: '',
  university_type: '',
  university_code: '',
  search: '',
};
