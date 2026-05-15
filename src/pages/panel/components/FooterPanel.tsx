import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface FooterPanelProps {
  filtered: number;
  elements: number;
  page?: number;
  totalPages?: number;
  pageSize?: number;
  hasPrev?: boolean;
  hasNext?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  onGoTo?: (page: number) => void;
}

const getPageNumbers = (page: number, total: number): (number | '…')[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, '…', total];
  if (page >= total - 3)
    return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '…', page - 1, page, page + 1, '…', total];
};

const FooterPanel = ({
  filtered,
  elements,
  page,
  totalPages,
  pageSize = 10,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onGoTo,
}: FooterPanelProps) => {
  const hasPagination =
    page !== undefined && totalPages !== undefined && totalPages > 1;

  const from = hasPagination ? (page - 1) * pageSize + 1 : 1;
  const to = hasPagination ? Math.min(page * pageSize, filtered) : filtered;

  const pageNumbers = hasPagination ? getPageNumbers(page, totalPages) : [];

  return (
    <div className='flex items-center justify-between border-t border-white/10 px-6 py-3 gap-4'>
      <span className='text-xs text-slate-500 shrink-0'>
        {hasPagination && filtered > 0
          ? `${from}–${to} de ${filtered} elemento${filtered !== 1 ? 's' : ''}`
          : `${filtered} de ${elements} elemento${elements !== 1 ? 's' : ''}`}
      </span>

      {hasPagination && (
        <div className='flex items-center gap-1'>
          <button
            onClick={() => onGoTo?.(1)}
            disabled={!hasPrev}
            title='Primera página'
            className='flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer'
          >
            <ChevronFirst className='h-3.5 w-3.5' />
          </button>
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            title='Página anterior'
            className='flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer'
          >
            <ChevronLeft className='h-3.5 w-3.5' />
          </button>

          {pageNumbers.map((p, i) =>
            p === '…' ? (
              <span
                key={`ellipsis-${i}`}
                className='px-1 text-xs text-slate-600'
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onGoTo?.(p)}
                className={[
                  'h-7 min-w-7 rounded-lg px-2 text-xs font-semibold transition',
                  p === page
                    ? 'bg-[#fbba0e] text-black'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white',
                ].join(' ')}
              >
                {p}
              </button>
            ),
          )}

          <button
            onClick={onNext}
            disabled={!hasNext}
            title='Página siguiente'
            className='flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer'
          >
            <ChevronRight className='h-3.5 w-3.5' />
          </button>
          <button
            onClick={() => onGoTo?.(totalPages!)}
            disabled={!hasNext}
            title='Última página'
            className='flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer'
          >
            <ChevronLast className='h-3.5 w-3.5' />
          </button>
        </div>
      )}
    </div>
  );
};

export default FooterPanel;
