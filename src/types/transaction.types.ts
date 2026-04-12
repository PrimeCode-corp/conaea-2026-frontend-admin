export interface Vouchers {
  id: number;
  payment_method: string;
  mount: string;
  voucher: string;
  payment_date?: string;
  created_at: string;
  is_active: boolean;
  is_validated: boolean;
}
