// validationService.ts
import api from '@/lib/axios';
import type { ValidationResponse } from '@/types/validation.types';

export const validationService = {
  toggleEnrollment: (enrollmentId: number) =>
    api
      .post<ValidationResponse>(
        `/security/validation-admin/enrollment/${enrollmentId}/`,
      )
      .then((res) => res.data),

  toggleTransaction: (transactionId: number) =>
    api
      .post<ValidationResponse>(
        `/security/validation-admin/transaction/${transactionId}/`,
      )
      .then((res) => res.data),

  toggleRegistration: (participantId: number) =>
    api
      .post<ValidationResponse>(
        `/security/validation-admin/registration/${participantId}/`,
      )
      .then((res) => res.data),
};
