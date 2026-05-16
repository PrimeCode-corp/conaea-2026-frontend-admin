export const columns = [
  {
    id: 1,
    label: 'Nombre',
    key: 'fullname',
    render: (value: unknown) => (
      <span className='text-slate-200 text-sm '>{value as string}</span>
    ),
  },
  {
    id: 2,
    label: 'Tipo',
    key: 'type_delegate',
    centered: true,
    render: (value: unknown) => {
      const isTitular = value === 'Titular';
      return (
        <span
          className={[
            'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ',
            isTitular
              ? 'text-green-400 '
              : 'text-blue-400 bg-blue-500/10 border-blue-500/20',
          ].join(' ')}
        >
          {value as string}
        </span>
      );
    },
  },
  {
    id: 3,
    label: 'Teléfono',
    key: 'cellphone',
    centered: true,
    render: (value: unknown) => (
      <span className='text-slate-400 text-sm font-mono'>
        {value as string}
      </span>
    ),
  },
  {
    id: 4,
    label: 'Universidad',
    key: 'partner_university',
    render: (value: unknown) => {
      const uni = value as { name: string; abbreviation: string };
      return (
        <div>
          <p className='text-slate-200 text-sm leading-tight'>
            {uni?.abbreviation ?? '—'}
          </p>
          <p className='text-slate-500 text-xs leading-tight'>{uni?.name}</p>
        </div>
      );
    },
  },
];
