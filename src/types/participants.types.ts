// types/participants.types.ts

import type { Enrollments } from './enrollment.types';
import type { Vouchers } from './transaction.types';

export interface ParticipantTableItem {
  id: number;
  document_type: 'DNI' | 'PASAPORTE';
  identity_document: string;
  photograph: string;
  full_name: string;
  university_type: 'Referido' | 'General';
  university_name: string;
  cellphone: string;
  email: string;
  quota_type: string;
  pre_sale: string;
  vouchers: Vouchers[];
  enrollments: Enrollments[];
  is_validated: boolean;
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
