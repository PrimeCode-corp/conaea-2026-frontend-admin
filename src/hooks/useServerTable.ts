import { useEffect } from 'react';
import type { PaginationMeta } from '@/pages/panel/components/TablePanel';

interface ServerMeta {
  count: number;
  next: string | null;
  previous: string | null;
}

interface UseServerTableOptions<P extends Record<string, unknown>> {
  /** Acción del store que carga una página con los filtros dados. */
  fetch: (page: number, params: P) => unknown;
  /** Filtros + búsqueda actuales (objeto recreado en cada render: OK). */
  params: P;
  /** Metadatos de paginación del store (`count`/`next`/`previous`). */
  meta: ServerMeta | null;
  /** Página actual (del store). */
  page: number;
  /** Texto de búsqueda: si está vacío el refetch es inmediato, si no se aplica debounce. */
  search?: string;
  /** Milisegundos de debounce cuando hay texto de búsqueda. */
  debounceMs?: number;
  pageSize?: number;
  /** Si es `false`, no dispara el refetch automático (p. ej. hasta inicializar). */
  enabled?: boolean;
}

/**
 * Encapsula el patrón de tabla con paginación de servidor: refetch con debounce
 * cuando cambian los filtros/búsqueda y la construcción del objeto `pagination`
 * que consume `TablePanel`. Usado en páginas como PartnerUniversity y Delegates.
 */
export function useServerTable<P extends Record<string, unknown>>({
  fetch,
  params,
  meta,
  page,
  search = '',
  debounceMs = 400,
  pageSize = 10,
  enabled = true,
}: UseServerTableOptions<P>) {
  // `params` se recrea en cada render, así que disparamos el efecto por su
  // contenido serializado (`paramsKey`) en lugar de su identidad. El cierre
  // captura el `params` del render actual, que siempre coincide con paramsKey.
  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    if (!enabled) return;
    const timeout = setTimeout(() => fetch(1, params), search ? debounceMs : 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, search, debounceMs, paramsKey, fetch]);

  const pagination: PaginationMeta | undefined = meta
    ? {
        count: meta.count,
        next: meta.next,
        previous: meta.previous,
        page,
        onPageChange: (p) => fetch(p, params),
        pageSize,
      }
    : undefined;

  return { pagination };
}
