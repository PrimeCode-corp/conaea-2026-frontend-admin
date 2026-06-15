interface ServerMeta {
  count: number;
  next: string | null;
  previous: string | null;
}

/**
 * Construye las props de `FooterPanel` (paginación numerada) a partir de los
 * metadatos de paginación de servidor, para que las tablas server-side usen la
 * misma UI de paginación que las client-side.
 */
export function getServerFooterProps(
  meta: ServerMeta | null,
  page: number,
  onPageChange: (page: number) => void,
  pageSize = 10,
) {
  const count = meta?.count ?? 0;
  return {
    filtered: count,
    elements: count,
    page,
    totalPages: Math.max(1, Math.ceil(count / pageSize)),
    pageSize,
    hasPrev: !!meta?.previous,
    hasNext: !!meta?.next,
    onPrev: () => onPageChange(page - 1),
    onNext: () => onPageChange(page + 1),
    onGoTo: onPageChange,
  };
}
