import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
                  <TableCell className='text-right'>{children(row)}</TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      </div>

      {/* Paginación — solo se muestra si se pasa el prop */}
      {pagination && totalPages && totalPages > 1 && (
        <div className='flex items-center justify-between py-4'>
          <span className='text-xs text-slate-500'>
            Página {pagination.page} de {totalPages}
          </span>
          <div className='flex items-center gap-2'>
            <Button
              size='sm'
              variant='outline'
              className='h-8 w-8 p-0 border-white/10 bg-transparent text-slate-400 hover:bg-white/5 hover:text-white transition'
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={!pagination.previous}
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <Button
              size='sm'
              variant='outline'
              className='h-8 w-8 p-0 border-white/10 bg-transparent text-slate-400 hover:bg-white/5 hover:text-white transition'
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={!pagination.next}
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablePanel;
