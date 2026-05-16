import type { QuotaTypeOption } from '@/types/individualCups.types';

export const getIndividualCupColumns = (quotaTypes: QuotaTypeOption[]) => [
  {
    id: 1,
    label: 'Preventa',
    key: 'pre_sale',
    render: (value: unknown) => {
      const preSale = value as { name: string };
      return (
        <span className='text-slate-200 text-sm'>{preSale?.name ?? '—'}</span>
      );
    },
  },
  {
    id: 2,
    label: 'Universidad',
    key: 'partner_university',
    render: (value: unknown) => {
      const university = value as { name: string; abbreviation: string };
      return (
        <span className='text-slate-200 text-sm'>
          {university?.name ?? '—'}
          {university?.abbreviation && (
            <span className='ml-1.5 text-xs text-slate-500'>
              ({university.abbreviation})
            </span>
          )}
        </span>
      );
    },
  },
  {
    id: 3,
    label: 'Tipo',
    key: 'partner_university',
    render: (value: unknown) => {
      const university = value as { quota_type: number };
      const qt = quotaTypes.find((q) => q.id === university?.quota_type);
      return <span>{qt?.name ?? '—'}</span>;
    },
  },
  {
    id: 4,
    label: 'Cupos',
    key: 'currency',
    centered: true,
    render: (value: unknown, row: unknown) => {
      const r = row as { used: number };
      return (
        <div className='flex flex-col items-center gap-0.5'>
          <span className='font-semibold text-sm text-[#fbba0e]'>{value as number}</span>
          <div className='w-6 h-px bg-[#fbba0e]/30' />
          <span className='text-xs text-[#fbba0e]/60'>{r.used}</span>
        </div>
      );
    },
  },
];
