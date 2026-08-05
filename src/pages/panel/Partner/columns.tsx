import type { PartnerNetworkNested, PartnerType } from '@/types/partners.types';
import NetworkIcon from '../components/NetworkIcon';

const typeClass: Record<PartnerType, string> = {
  Patrocinador: 'bg-[#fbba0e]/10 text-[#fbba0e] border-[#fbba0e]/20',
  Colaborador: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  Socio: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
};

export const getPartnerColumns = (onLogoClick: (url: string) => void) => [
  {
    id: 1,
    label: 'Logo',
    key: 'logo',
    centered: true,
    render: (value: unknown) =>
      value ? (
        <div className='flex justify-center'>
          <img
            src={value as string}
            alt='logo'
            loading='lazy'
            onClick={() => onLogoClick(value as string)}
            className='h-10 w-10 rounded-sm border border-white/10 object-contain cursor-pointer hover:scale-110 transition'
          />
        </div>
      ) : (
        <span className='text-xs text-slate-500'>Sin logo</span>
      ),
  },
  { id: 2, label: 'Nombre', key: 'name' },
  {
    id: 3,
    label: 'Tipo',
    key: 'type',
    centered: true,
    render: (value: unknown) => (
      <span
        className={`inline-block rounded-md border px-2 py-0.5 text-xs font-semibold ${
          typeClass[value as PartnerType] ?? typeClass.Socio
        }`}
      >
        {value as string}
      </span>
    ),
  },
  {
    id: 4,
    label: 'Descripción',
    key: 'description',
    render: (value: unknown) => (
      <span className='block max-w-xs truncate text-slate-300'>
        {(value as string) || '—'}
      </span>
    ),
  },
  {
    id: 5,
    label: 'Redes',
    key: 'networks',
    centered: true,
    render: (value: unknown) => {
      const networks = (value as PartnerNetworkNested[]) ?? [];

      if (networks.length === 0)
        return <span className='text-xs text-slate-500'>Sin redes</span>;

      return (
        <div className='flex items-center justify-center gap-1.5 text-slate-400'>
          {networks.map((n) => (
            <span key={n.id} title={n.name}>
              <NetworkIcon logo={n.logo} className='h-3.5 w-3.5' />
            </span>
          ))}
        </div>
      );
    },
  },
];
