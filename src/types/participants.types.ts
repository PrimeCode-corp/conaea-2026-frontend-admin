// types/participants.types.ts

import type { Enrollments } from './enrollment.types';
import type { Vouchers } from './transaction.types';

export interface ParticipantTableItem {
  id: number;
  first_name: string;
  paternal_surname: string;
  maternal_surname: string;
  full_name: string;
  document_type: 'DNI' | 'PASAPORTE';
  identity_document: string;
  birthday: string;
  cellphone: string;
  email: string;
  academic_cycle: string;
  cod_university: string;
  university_type: 'Referido' | 'General';
  university_name: string;
  cod_country: number;
  discapacidad: string;
  alergia: string;
  photograph: string;
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

// ── Opciones embebidas en la respuesta de la tabla ─────────────────────

export type ParticipantListOption = { id: number; name: string };

export interface ParticipantListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  pre_sales: ParticipantListOption[];
  quota_types: ParticipantListOption[];
  results: ParticipantTableItem[];
}
