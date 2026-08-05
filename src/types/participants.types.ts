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
  fecha: string;
  hora: string;
  academic_cycle: string;
  cod_university: string;
  university_type: 'Referido' | 'General';
  university_name: string;
  university_abbreviation: string;
  cod_country: number;
  discapacidad: string;
  alergia: string;
  photograph: string;
  quota_type: string;
  pre_sale: string;
  vouchers: Vouchers[];
  enrollments: Enrollments[];
  is_validated: boolean;
  email_status: 'nobody' | 'sent' | 'error';
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

// ── Exportación masiva (.zip) ──────────────────────────────────────────

/**
 * Filtros de la exportación. Son los mismos de la tabla salvo `search` y
 * `document_type`, que el endpoint no acepta: la exportación siempre se lleva
 * todos los participantes activos que caen dentro de preventa, cupo y
 * universidad.
 */
export interface ParticipantExportFilters {
  pre_sale_id?: number;
  quota_type_id?: number;
  university_code?: string;
}

export type ParticipantExportStatus =
  | 'pending'
  | 'processing'
  | 'done'
  | 'error'
  | 'cancelled';

/**
 * Estado de una exportación en curso. Lo devuelven igual el `POST` que la
 * arranca, el `GET` del sondeo y el `DELETE` que la cancela.
 */
export interface ParticipantExportTask {
  task_id: string;
  status: ParticipantExportStatus;
  /** Expedientes ya armados. Avanza de a uno. */
  processed: number;
  total: number;
  /** 0-100. No llega a 100 hasta que `status` es `done`. */
  progress: number;
  /** Texto corto de la etapa actual (`Descargando archivos`). */
  phase: string | null;
  /** Solo con `done` y mientras no venza; `null` si ya expiró. */
  download_url: string | null;
  /** Mensaje del backend en `error` y `cancelled`. */
  detail: string | null;
  filename: string | null;
  file_size: number | null;
  /** ISO 8601: cuándo se borra el `.zip` generado. */
  expires_at: string | null;
  /** Segundos de sondeo que pide el backend. */
  retry_after: number;
}

export interface ParticipantExportDownload {
  /** Cuerpo de la respuesta, para volcarlo a disco sin pasar por memoria. */
  body: ReadableStream<Uint8Array>;
  /** Tamaño total en bytes (`Content-Length`), o `null` si no viene. */
  size: number | null;
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

export type ParticipantListOption = {
  id: number;
  name: string;
  is_default?: boolean;
};

export interface ParticipantListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  pre_sales: ParticipantListOption[];
  quota_types: ParticipantListOption[];
  results: ParticipantTableItem[];
}
