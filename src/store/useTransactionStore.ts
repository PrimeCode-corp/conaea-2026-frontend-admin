import { create } from 'zustand';
import { voucherService } from '@/services/transactionService';
import type { Vouchers } from '@/types/transaction.types';

type VoucherStore = {
  updating: boolean;
  updatingDetails: boolean;
  error: string | null;
  updateVoucher: (id: number, file: File) => Promise<void>;
  updateVoucherDetails: (
    id: number,
    payload: Partial<
      Pick<Vouchers, 'payment_method' | 'mount' | 'payment_date'>
    >,
  ) => Promise<void>;
};

export const useVoucherStore = create<VoucherStore>((set) => ({
  updating: false,
  updatingDetails: false,
  error: null,

  updateVoucher: async (id, file) => {
    set({ updating: true, error: null });
    try {
      const formData = new FormData();
      formData.append('voucher', file);
      await voucherService.update(id, formData);
    } catch {
      set({ error: 'Error al actualizar el voucher' });
      throw new Error('Error al actualizar el voucher');
    } finally {
      set({ updating: false });
    }
  },

  updateVoucherDetails: async (id, payload) => {
    set({ updatingDetails: true, error: null });
    try {
      await voucherService.updateDetails(id, payload);
    } catch {
      set({ error: 'Error al actualizar los detalles' });
      throw new Error('Error al actualizar los detalles');
    } finally {
      set({ updatingDetails: false });
    }
  },
}));
