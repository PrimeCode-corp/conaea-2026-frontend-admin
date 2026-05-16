const formatDateTime = (value: unknown) => {
  if (!value) return <span className='text-slate-500 text-xs'>—</span>;
  const normalized = (value as string).replace('Z', '');
  const date = new Date(normalized);
  return (
    <span className='text-slate-200 text-sm'>
      {date.toLocaleDateString('es-PE')}{' '}
      {date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
    </span>
  );
};

export const columns = [
  {
    id: 1,
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
    id: 2,
    label: 'Estado',
    key: 'status',
    centered: true,
    render: (value: unknown) => {
      const status = value as string;
      const color =
        status === 'available'
          ? 'text-green-400'
          : status === 'used'
            ? 'text-red-400'
            : 'text-slate-400';
      return <span className={`text-sm font-medium ${color}`}>{status}</span>;
    },
  },
  {
    id: 3,
    label: 'Fecha de creación',
    key: 'created_at',
    render: formatDateTime,
  },
  {
    id: 4,
    label: 'Fecha de uso',
    key: 'used_at',
    render: (value: unknown) =>
      value ? (
        formatDateTime(value)
      ) : (
        <span className='text-slate-500 text-xs'>Sin uso</span>
      ),
  },
];
