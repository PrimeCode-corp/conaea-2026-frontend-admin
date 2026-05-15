import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// --- Tipos ---
type Column = {
  id: number;
  label: string;
  key: string;
  render?: (value: unknown, row: Row) => React.ReactNode;
};

type Row = Record<string, unknown>;

export type PaginationMeta = {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
};

interface TablePanelProps {
  columns: Column[];
  data: Row[];
  children?: (row: Row) => React.ReactNode;
  pagination?: PaginationMeta;
  loading?: boolean;
}

const TablePanel = ({
  columns,
  data,
  children,
  pagination,
  loading = false,
}: TablePanelProps) => {
  const totalPages = pagination
    ? Math.ceil(pagination.count / (pagination.pageSize ?? 10))
    : null;

  return (
    <div className='px-6 py-2'>
      <div className='mb-2 flex items-center justify-between py-2'>
        <span className='text-xs font-semibold uppercase tracking-widest text-[#fbba0e]'>
          Registros
        </span>
        <Badge className='bg-[#fbba0e]/10 text-[#fbba0e] border border-[#fbba0e]/20 text-xs'>
          {pagination ? pagination.count : data.length} registro
          {(pagination ? pagination.count : data.length) !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow className='border-white/10 hover:bg-transparent'>
              <TableHead className='text-xs font-semibold uppercase tracking-wider text-slate-500 w-8'>
                #
              </TableHead>
              {columns.map((col) => (
                <TableHead
                  key={col.id}
                  className='text-xs font-semibold uppercase tracking-wider text-slate-500'
                >
                  {col.label}
                </TableHead>
              ))}
              {children && (
                <TableHead className='text-xs font-semibold uppercase tracking-wider text-slate-500 text-right'>
                  Acciones
                </TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx} className='border-white/10'>
                  <TableCell>
                    <Skeleton className='h-4 w-6 bg-white/10' />
                  </TableCell>
                  {columns.map((col) => (
                    <TableCell key={col.id}>
                      <Skeleton className='h-4 w-full bg-white/10' />
                    </TableCell>
                  ))}
                  {children && (
                    <TableCell>
                      <Skeleton className='h-4 w-16 ml-auto bg-white/10' />
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow className='hover:bg-transparent'>
                <TableCell
                  colSpan={columns.length + 2}
                  className='py-12 text-center text-sm text-slate-500'
                >
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, idx) => (
                <TableRow
                  key={idx}
                  className='border-white/10 hover:bg-white/5 transition-colors'
                >
                  <TableCell className='text-xs text-slate-500 font-mono'>
                    {String(
                      pagination
                        ? (pagination.page - 1) * (pagination.pageSize ?? 10) +
                            idx +
                            1
                        : idx + 1,
                    ).padStart(2, '0')}
                  </TableCell>
                  {columns.map((col) => (
                    <TableCell key={col.id} className='text-sm text-slate-200'>
                      {col.render
                        ? col.render(row[col.key], row)
                        : String(row[col.key] ?? '—')}
                    </TableCell>
                  ))}
                  {children && (
                    <TableCell className='text-right'>
                      {children(row)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación — solo se muestra si se pasa el prop */}
      {pagination && totalPages && totalPages > 1 && (
        <div className='flex items-center justify-between border-t border-white/10 py-3'>
          <span className='text-xs text-slate-500'>
            {(pagination.page - 1) * (pagination.pageSize ?? 10) + 1}–
            {Math.min(
              pagination.page * (pagination.pageSize ?? 10),
              pagination.count,
            )}{' '}
            de {pagination.count} elemento{pagination.count !== 1 ? 's' : ''}
          </span>
          <div className='flex items-center gap-1'>
            <button
              onClick={() => pagination.onPageChange(1)}
              disabled={!pagination.previous}
              title='Primera página'
              className='flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer'
            >
              <ChevronFirst className='h-3.5 w-3.5' />
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={!pagination.previous}
              title='Página anterior'
              className='flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer'
            >
              <ChevronLeft className='h-3.5 w-3.5' />
            </button>
            <span className='px-2 text-xs text-slate-500'>
              {pagination.page} / {totalPages}
            </span>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={!pagination.next}
              title='Página siguiente'
              className='flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer'
            >
              <ChevronRight className='h-3.5 w-3.5' />
            </button>
            <button
              onClick={() => pagination.onPageChange(totalPages)}
              disabled={!pagination.next}
              title='Última página'
              className='flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer'
            >
              <ChevronLast className='h-3.5 w-3.5' />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablePanel;
