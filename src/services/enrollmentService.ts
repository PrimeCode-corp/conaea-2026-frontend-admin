import api from '@/lib/axios';
import type { Enrollments } from '@/types/enrollment.types';

export const enrollmentService = {
  update: (id: number, payload: FormData) =>
    api
      .patch<Enrollments>(`/participants/enrollment/${id}/`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data),
};
