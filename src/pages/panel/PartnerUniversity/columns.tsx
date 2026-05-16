export const columns = [
  {
    id: 1,
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
    id: 2,
    label: 'Código',
    key: 'code',
    centered: true,
    render: (value: unknown) => (
      <span className='font-mono text-[#fbba0e] text-sm'>
        {value as string}
      </span>
    ),
  },
  {
    id: 3,
    label: 'Nombre',
    key: 'name',
    render: (value: unknown) => (
      <span className='text-slate-200 text-sm'>{value as string}</span>
    ),
  },
  {
    id: 4,
    label: 'Abreviación',
    key: 'abbreviation',
    centered: true,
    render: (value: unknown) => (
      <span className='text-slate-200 text-sm'>{value as string}</span>
    ),
  },
  {
    id: 5,
    label: 'País',
    key: 'country',
    centered: true,
    render: (value: unknown) => (
      <span className='text-slate-200 text-sm'>{value as string}</span>
    ),
  },
  {
    id: 6,
    label: 'Región',
    key: 'region',
    centered: true,
    render: (value: unknown) => (
      <span className='text-slate-200 text-sm'>{value as string}</span>
    ),
  },
  {
    id: 7,
    label: 'Ciudad',
    key: 'place',
    centered: true,
    render: (value: unknown) => (
      <span className='text-slate-200 text-sm'>{value as string}</span>
    ),
  },
];
