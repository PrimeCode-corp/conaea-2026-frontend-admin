import api from '@/lib/axios';
import type { Vouchers } from '@/types/transaction.types';

export const voucherService = {
  update: (id: number, payload: FormData) =>
    api
      .patch<Vouchers>(`/register/transaction/${id}/`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data),

  updateDetails: (
    id: number,
    payload: Partial<
      Pick<Vouchers, 'payment_method' | 'mount' | 'payment_date'>
    >,
  ) => {
    const formData = new FormData();
    if (payload.payment_method !== undefined)
      formData.append('payment_method', payload.payment_method);
    if (payload.mount !== undefined) formData.append('mount', payload.mount);
    if (payload.payment_date !== undefined)
      formData.append('payment_date', payload.payment_date);

    return api
      .patch<Vouchers>(`/register/transaction/${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data);
  },
};
