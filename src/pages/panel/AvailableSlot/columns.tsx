export const columns = [
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
    label: 'Tipo de Cuota',
    key: 'quota_type',
    render: (value: unknown) => {
      const quotaType = value as { name: string; currency: string };
      return (
        <span className='text-slate-200 text-sm'>
          {quotaType?.name ?? '—'}{' '}
          {quotaType?.currency ? `(${quotaType.currency})` : ''}
        </span>
      );
    },
  },
  {
    id: 3,
    label: 'Monto',
    key: 'mount',
    centered: true,
    render: (value: unknown, row: unknown) => {
      const r = row as { quota_type: { currency: string } };
      const currency = r?.quota_type?.currency ?? 'S/';
      return value !== null && value !== undefined ? (
        <span className='text-slate-200 text-sm'>
          {currency} {Number(value).toFixed(2)}
        </span>
      ) : (
        <span className='text-slate-500 text-xs'>—</span>
      );
    },
  },
  {
    id: 5,
    label: 'Reserva',
    centered: true,
    key: 'reserved',
    render: (value: unknown, row: unknown) => {
      const r = row as { used_reserved: number };
      return (
        <div className='flex flex-col items-center gap-0.5'>
          <span className='font-semibold text-sm text-slate-200'>
            {value as number}
          </span>
          <div className='w-6 h-px bg-white/20' />
          <span className='text-xs text-slate-400'>{r.used_reserved}</span>
        </div>
      );
    },
  },
  {
    id: 6,
    label: '',
    key: 'reserved',
    centered: true,
    render: () => (
      <span className='inline-flex items-center rounded-full px-2.5 py-0.5 font-semibold text-white/30'>
        +
      </span>
    ),
  },
  {
    id: 7,
    label: 'Directo',
    key: 'reserved',
    centered: true,
    render: (value: unknown, row: unknown) => {
      const r = row as {
        amount: number;
        used_total: number;
        used_reserved: number;
      };
      const direct = r.amount - (value as number);
      const usedDirect = r.used_total - r.used_reserved;
      return (
        <div className='flex flex-col items-center gap-0.5'>
          <span className='font-semibold text-sm text-slate-200'>{direct}</span>
          <div className='w-6 h-px bg-white/20' />
          <span className='text-xs text-slate-400'>{usedDirect}</span>
        </div>
      );
    },
  },
  {
    id: 8,
    label: '',
    key: 'amount',
    centered: true,
    render: () => (
      <span className='inline-flex items-center rounded-full px-2.5 py-0.5 font-semibold text-white/30'>
        =
      </span>
    ),
  },
  {
    id: 9,
    label: 'Total',
    centered: true,
    key: 'amount',
    render: (value: unknown, row: unknown) => {
      const r = row as { used_total: number };
      return (
        <div className='flex flex-col items-center gap-0.5'>
          <span className='font-semibold text-sm text-[#fbba0e]'>
            {value as number}
          </span>
          <div className='w-6 h-px bg-[#fbba0e]/30' />
          <span className='text-xs text-[#fbba0e]/60'>{r.used_total}</span>
        </div>
      );
    },
  },
];
