import api from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';
import type {
  ParticipantTableFilters,
  ParticipantTableItem,
  ParticipantListResponse,
  ParticipantExportFilters,
  ParticipantExportTask,
  ParticipantExportDownload,
} from '@/types/participants.types';

/**
 * Descarga autenticada con `fetch`. La usamos solo para el `.zip`: necesitamos
 * el `ReadableStream` de la respuesta para escribirlo directo a disco, cosa que
 * axios con `responseType: 'blob'` no permite (dejaría el archivo entero en
 * memoria). El precio es reintentar el `401` a mano, porque no pasa por el
 * interceptor.
 */
const authorizedFetch = async (url: string, signal?: AbortSignal) => {
  const request = (token?: string) =>
    fetch(url, {
      signal,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

  const res = await request(useAuthStore.getState().authTokens?.access);
  if (res.status !== 401) return res;

  const refreshed = await useAuthStore.getState().refreshToken();
  if (!refreshed) {
    // El store solo borra los tokens cuando el rechazo es definitivo; si
    // siguen ahí, fue un fallo transitorio y la sesión no se perdió.
    throw new Error(
      useAuthStore.getState().authTokens
        ? 'No se pudo renovar la sesión. Revisa tu conexión e intenta de nuevo.'
        : 'Tu sesión expiró. Vuelve a iniciar sesión.',
    );
  }

  return request(useAuthStore.getState().authTokens?.access);
};

export const participantService = {
  getTable: (filters: ParticipantTableFilters = {}) => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(
        ([, v]) => v !== undefined && v !== null && v !== '',
      ),
    );
    return api
      .get<ParticipantListResponse>('/participants/table/', { params })
      .then((res) => res.data);
  },

  update: (id: number, formData: FormData) =>
    api
      .patch<ParticipantTableItem>(`/participants/participant/${id}/update/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data),

  remove: (id: number) =>
    api
      .patch(`/participants/participant/${id}/deactivate/`)
      .then((res) => res.data),

  getStats: () =>
    api
      .get<{
        total: number;
        validated: number;
        pending: number;
      }>('/participants/stats/')
      .then((res) => res.data),

  /**
   * Arranca la exportación en `.zip` de los participantes activos que cumplen
   * los filtros. El trabajo corre en el servidor: esta llamada responde al
   * instante con la tarea a sondear.
   *
   * Devuelve `null` cuando el filtro no arroja participantes (`204`).
   */
  startExport: async (
    filters: ParticipantExportFilters = {},
  ): Promise<ParticipantExportTask | null> => {
    const body = Object.fromEntries(
      Object.entries(filters).filter(
        ([, v]) => v !== undefined && v !== null && v !== '',
      ),
    );
    const res = await api.post<ParticipantExportTask>(
      '/participants/export/',
      body,
    );
    return res.status === 204 ? null : res.data;
  },

  /** Avance de una exportación en curso. */
  getExportStatus: (taskId: string) =>
    api
      .get<ParticipantExportTask>(`/participants/export/${taskId}/`)
      .then((res) => res.data),

  /**
   * Cancela la exportación. No es inmediato: el backend revisa la cancelación
   * al inicio de cada tanda de 25 expedientes, así que puede tardar unos
   * segundos en detenerse. El `.zip` a medio escribir se borra solo.
   */
  cancelExport: (taskId: string) =>
    api
      .delete<ParticipantExportTask>(`/participants/export/${taskId}/`)
      .then((res) => res.data),

  /**
   * Descarga el `.zip` ya generado. `url` es la `download_url` absoluta que
   * trae la tarea al terminar.
   */
  downloadExport: async (
    url: string,
    signal?: AbortSignal,
  ): Promise<ParticipantExportDownload> => {
    const res = await authorizedFetch(url, signal);

    if (res.status === 410) {
      throw new Error(
        'El archivo generado ya venció (se conserva 1 hora). Vuelve a exportar.',
      );
    }

    if (!res.ok || !res.body) {
      throw new Error('No se pudo descargar la exportación.');
    }

    const length = res.headers.get('content-length');

    return { body: res.body, size: length ? Number(length) : null };
  },
};
