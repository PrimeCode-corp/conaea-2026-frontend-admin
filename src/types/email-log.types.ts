export interface EmailLog {
  id: number;
  participant: number;
  participant_name: string;
  participant_email: string;
  subject: string;
  email_type: string;
  email_type_display: string;
  status: 'sent' | 'failed' | 'pending' | 'disabled' | 'timeout';
  status_display: string;
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
}

export interface EmailLogResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: EmailLog[];
}
