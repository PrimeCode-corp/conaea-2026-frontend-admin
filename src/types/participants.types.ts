// types/participants.types.ts

// ── Tabla ──────────────────────────────────────────────────────────────

export interface ParticipantVoucher {
  id: number;
  payment_method: string;
  mount: string;
  voucher: string; // URL
  created_at: string;
}

export interface ParticipantEnrollment {
  id: number;
  type: string;
  archive: string; // URL
}

export interface ParticipantTableItem {
  id: number;
  document_type: 'DNI' | 'PASAPORTE';
  identity_document: string;
  photograph: string;
  full_name: string;
  university_type: 'Referido' | 'General';
  university_name: string;
  cellphone: string;
  quota_type: string;
  pre_sale: string;
  vouchers: ParticipantVoucher[];
  enrollments: ParticipantEnrollment[];
}

// ── Filtros ────────────────────────────────────────────────────────────

export interface ParticipantTableFilters {
  pre_sale_id?: number;
  document_type?: 'DNI' | 'PASAPORTE';
  quota_type_id?: number;
  university_type?: 'Referido' | 'General';
  university_code?: string;
  search?: string;
  page?: number;
}

// ── Paginación ─────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type ParticipantTableResponse = PaginatedResponse<ParticipantTableItem>;
