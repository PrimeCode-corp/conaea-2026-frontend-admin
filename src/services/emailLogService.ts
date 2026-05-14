import api from '@/lib/axios';
import type { EmailLogResponse } from '@/types/email-log.types';

export const emailLogService = {
  getByParticipant: (
    participantId: number,
    params?: { status?: string; page?: number; page_size?: number },
  ) =>
    api
      .get<EmailLogResponse>('/security/email-logs/', {
        params: { participant_id: participantId, ...params },
      })
      .then((res) => res.data),

  getLastStatus: (participantId: number) =>
    api
      .get<EmailLogResponse>('/security/email-logs/', {
        params: { participant_id: participantId, page_size: 1 },
      })
      .then((res) => res.data.results[0]?.status ?? null),
};
