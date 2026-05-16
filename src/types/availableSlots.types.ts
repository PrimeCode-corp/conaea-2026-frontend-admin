// types/availableSlot.types.ts
import type { PreSales } from './preSales.types';
import type { QuotaTypes } from './quotaTypes.types';

export type AvailableSlots = {
  id: number;
  pre_sale: number;
  quota_type: number;
  mount: number;
  amount: number;
  is_active: boolean;
};

export type AvailableSlotDetail = {
  id: number;
  pre_sale: PreSales;
  quota_type: QuotaTypes;
  pre_sale_id: number;
  quota_type_id: number;
  mount: number;
  amount: number;
  reserved: number;
  used_reserved: number;
  used_total: number;
  is_active: boolean;
};

export type PreSaleOption = {
  id: number;
  name: string;
  is_default: boolean;
};

export type AvailableSlotListResponse = {
  pre_sales: PreSaleOption[];
  results: AvailableSlotDetail[];
};
