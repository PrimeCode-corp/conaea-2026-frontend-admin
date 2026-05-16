export type PreSaleOption = {
  id: number;
  name: string;
  is_default: boolean;
};

export type QuotaTypeOption = {
  id: number;
  name: string;
};

export type UniversityOption = {
  id: number;
  name: string;
  abbreviation: string;
  quota_type: number;
  has_cup: boolean;
};

export type IndividualCupListResponse = {
  pre_sales: PreSaleOption[];
  quota_types: QuotaTypeOption[];
  universities: UniversityOption[];
  results: IndividualCup[];
};

export type IndividualCupPreSale = {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  booking_mode: boolean;
  is_active: boolean;
};

export type IndividualCupUniversity = {
  id: number;
  code: string;
  name: string;
  abbreviation: string;
  place: string;
  country: string;
  region: string;
  quota_type: number;
  is_active: boolean;
};

export type IndividualCup = {
  id: number;
  pre_sale: IndividualCupPreSale;
  partner_university: IndividualCupUniversity;
  currency: number;
  used: number;
  total_amount: number;
  used_total: number;
  is_active: boolean;
};
