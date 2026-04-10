export const getParticipantColumns = () => [
  {
    id: 1,
    label: 'Documento',
    key: 'identity_document',
    render: (value: unknown, row: unknown) => {
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
  { id: 2, label: 'Nombre', key: 'full_name' },
  {
    id: 3,
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
    id: 4,
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
  { id: 5, label: 'Categoría', key: 'quota_type' },
  {
    id: 6,
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
    id: 7,
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
