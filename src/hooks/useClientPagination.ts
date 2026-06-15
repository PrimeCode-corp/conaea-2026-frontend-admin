import { useState, useMemo } from 'react';

const DEFAULT_PAGE_SIZE = 10;

export function useClientPagination<T>(items: T[], pageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1);

  // Reset a la primera página cuando cambia el tamaño de la lista (filtros,
  // búsqueda, alta/baja). Ajuste de estado durante el render: el patrón
  // recomendado por React en lugar de un useEffect.
  const [prevLength, setPrevLength] = useState(items.length);
  if (items.length !== prevLength) {
    setPrevLength(items.length);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  return {
    page: safePage,
    totalPages,
    paginated,
    pageSize,
    hasPrev: safePage > 1,
    hasNext: safePage < totalPages,
    goNext: () => setPage((p) => Math.min(p + 1, totalPages)),
    goPrev: () => setPage((p) => Math.max(p - 1, 1)),
    goTo: setPage,
  };
}
