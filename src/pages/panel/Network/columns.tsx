import NetworkIcon from '../components/NetworkIcon';

export const getNetworkColumns = () => [
  {
    id: 1,
    label: 'Icono',
    key: 'logo',
    centered: true,
    render: (value: unknown) => (
      <div className='flex justify-center'>
        <div className='flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300'>
          <NetworkIcon logo={value as string | null} />
        </div>
      </div>
    ),
  },
  { id: 2, label: 'Nombre', key: 'name' },
  {
    id: 3,
    label: 'Identificador',
    key: 'logo',
    render: (value: unknown) =>
      value ? (
        <span className='font-mono text-xs text-slate-400'>
          {value as string}
        </span>
      ) : (
        <span className='text-xs text-slate-500'>Sin icono</span>
      ),
  },
];
