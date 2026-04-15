export const getParticipantColumns = () => [
  {
    id: 1,
    label: 'E',
    key: 'is_validated',
    render: (value: unknown) => (
      <div className='relative group w-fit'>
        <div
          className={[
            'w-3 h-3 rounded-[2px] cursor-pointer',
            value ? 'bg-green-500' : 'bg-red-500',
          ].join(' ')}
        />
        <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-md text-xs font-semibold whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-[#111] border border-white/10 text-slate-200'>
          {value ? 'Validado' : 'Sin validar'}
        </div>
      </div>
    ),
  },
  {
    id: 2,
    label: 'Documento',
    key: 'identity_document',
    render: (_: unknown, row: unknown) => {
      const r = row as { document_type?: string; identity_document?: string };

      const documentTypeShort = r.document_type
        ? r.document_type.slice(0, 3).toUpperCase()
        : '---';

      return (
        <span className='text-slate-200 text-sm'>
          {documentTypeShort} - {r.identity_document ?? 'Sin documento'}
        </span>
      );
    },
  },
  {
    id: 3,
    label: 'Nombre',
    key: 'full_name',
    render: (_: unknown, row: unknown) => {
      const r = row as { full_name?: string };

      const documentTypeShort = r.full_name ? r.full_name.toUpperCase() : '---';

      return (
        <span className='text-slate-200 text-sm'>{documentTypeShort}</span>
      );
    },
  },
  {
    id: 4,
    label: 'Tipo',
    key: 'university_type',
    render: (value: unknown) => (
      <span
        className={[
          'text-xs font-normal px-2 py-1 rounded-lg text-white',
          value === 'Referido' ? 'bg-green-500/40 ' : 'bg-blue-500/40',
        ].join(' ')}
      >
        {value as string}
      </span>
    ),
  },
  {
    id: 5,
    label: 'Universidad',
    key: 'university_name',
    render: (value: unknown) => {
      const name = (value as string) || '';

      // Elimina la palabra "Universidad" sin importar mayúsculas/minúsculas
      const cleanedName = name
        .replace(/\buniversidad\b/gi, '') // Quita la palabra
        .replace(/\s{2,}/g, ' ') // Elimina espacios dobles
        .trim(); // Quita espacios al inicio y final

      return (
        <span className='text-slate-200 text-sm'>{cleanedName || '—'}</span>
      );
    },
  },
  { id: 6, label: 'Categoría', key: 'quota_type' },
  {
    id: 7,
    label: 'Celular',
    key: 'cellphone',
    render: (value: unknown) => {
      const phone = (value as string) || '';

      // Inserta un espacio después del código de país si no existe
      const formattedPhone = phone.replace(/^(\(\+\d+\))(\d+)/, '$1 $2');

      return (
        <span className='text-slate-200 text-sm'>{formattedPhone || '—'}</span>
      );
    },
  },
  {
    id: 8,
    label: 'Preventa',
    key: 'pre_sale',
    render: (value: unknown) => {
      const preSale = (value as string) || '';

      // Elimina la palabra "Preventa" sin importar mayúsculas/minúsculas
      const cleanedPreSale = preSale
        .replace(/\bpreventa\b/gi, '') // Quita la palabra
        .replace(/\s{2,}/g, ' ') // Elimina espacios dobles
        .trim(); // Quita espacios al inicio y final

      return (
        <span className='text-slate-200 text-sm'>{cleanedPreSale || '—'}</span>
      );
    },
  },
];
