import { create } from 'zustand';
import { enrollmentService } from '@/services/enrollmentService';

type EnrollmentStore = {
  updating: boolean;
  error: string | null;
  updateEnrollment: (id: number, file: File) => Promise<void>;
};

export const useEnrollmentStore = create<EnrollmentStore>((set) => ({
  updating: false,
  error: null,

  updateEnrollment: async (id, file) => {
    set({ updating: true, error: null });
    try {
      const formData = new FormData();
      formData.append('archive', file);
      await enrollmentService.update(id, formData);
    } catch {
      set({ error: 'Error al actualizar la ficha' });
      throw new Error('Error al actualizar la ficha');
    } finally {
      set({ updating: false });
    }
  },
}));
