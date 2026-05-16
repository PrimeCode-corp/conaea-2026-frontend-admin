export const getParticipantColumns = (onPhotoClick: (url: string) => void) => [
  {
    id: 1,
    label: 'E',
    key: 'is_validated',
    render: (value: unknown) => (
      <div className='relative group w-fit'>
        <div
          className={[
            'w-3 h-3 rounded-xs cursor-pointer',
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
    label: 'Foto',
    key: 'photograph',
    render: (value: unknown) =>
      value ? (
        <img
          src={value as string}
          alt='foto'
          onClick={() => onPhotoClick(value as string)}
          className='w-10 h-10 rounded-sm object-cover object-top border border-white/10 cursor-pointer hover:scale-110 transition'
        />
      ) : (
        <span className='text-slate-500 text-xs'>Sin foto</span>
      ),
  },
  {
    id: 3,
    label: 'Documento',
    key: 'identity_document',
    render: (_: unknown, row: unknown) => {
      const r = row as { document_type?: string; identity_document?: string };

      const documentTypeShort = r.document_type
        ? r.document_type.slice(0, 3).toUpperCase()
        : '---';

      return (
        <div>
          <p className='text-slate-200 text-sm leading-tight font-mono'>
            {r.identity_document || '—'}
          </p>
          {documentTypeShort && (
            <p className='text-slate-500 text-xs leading-tight mt-0.5'>
              {documentTypeShort}
            </p>
          )}
        </div>
      );
    },
  },
  {
    id: 4,
    label: 'Nombre',
    key: 'full_name',
    render: (_: unknown, row: unknown) => {
      const r = row as { full_name?: string };

      const documentTypeShort = r.full_name ? r.full_name.toUpperCase() : '---';

      return (
        <div className='max-w-48'>
          <span className='text-slate-200 text-xs text-wrap'>
            {documentTypeShort}
          </span>
        </div>
      );
    },
  },
  {
    id: 5,
    label: 'Institución',
    key: 'university_name',
    render: (value: unknown, row: unknown) => {
      const r = row as {
        university_name?: string;
        university_abbreviation?: string;
        quota_type?: string;
      };
      const raw = !value || value === 0 || value === '0' ? '' : String(value);
      const cleanedName = raw
        .replace(/\buniversidad\b/gi, '')
        .replace(/\s{2,}/g, ' ')
        .trim();

      const quotaType = r.quota_type || '';
      const code = r.university_abbreviation || '';

      if (!cleanedName && !code) {
        return <span className='text-slate-500 text-sm'>—</span>;
      }

      return (
        <div>
          <p className='text-slate-200 text-sm leading-tight'>
            <span className=' font-mono'>{code || '—'}</span> -{' '}
            {quotaType || '—'}
          </p>
          {cleanedName && (
            <p className='text-slate-500 text-xs leading-tight mt-0.5'>
              {cleanedName}
            </p>
          )}
        </div>
      );
    },
  },
  {
    id: 6,
    label: 'Contacto',
    key: 'email',
    render: (value: unknown, row: unknown) => {
      const r = row as {
        email?: string;
        cellphone?: string;
      };

      const email =
        !value || value === 0 || value === '0' ? '' : String(value).trim();

      const cellphone = r.cellphone || '';

      if (!email && !cellphone) {
        return <span className='text-slate-500 text-sm'>—</span>;
      }

      const formattedPhone = cellphone.replace(/^(\(\+\d+\))(\d+)/, '$1 $2');

      return (
        <div>
          <p className='text-slate-200 text-sm leading-tight'>{email || '—'}</p>

          {formattedPhone && (
            <p className='text-slate-500 text-xs leading-tight mt-0.5'>
              {formattedPhone}
            </p>
          )}
        </div>
      );
    },
  },
  {
    id: 7,
    label: 'Fecha',
    key: 'fecha',
    render: (_: unknown, row: unknown) => {
      const r = row as { fecha?: string; hora?: string };
      if (!r.fecha && !r.hora)
        return <span className='text-slate-500 text-xs'>—</span>;
      return (
        <div>
          <p className='text-slate-200 text-sm leading-tight'>
            {r.fecha || '—'}
          </p>
          <p className='text-slate-500 text-xs leading-tight mt-0.5'>
            {r.hora || '—'}
          </p>
        </div>
      );
    },
  },
  // {
  //   id: 8,
  //   label: 'Preventa',
  //   key: 'pre_sale',
  //   render: (value: unknown) => {
  //     const preSale = (value as string) || '';

  //     // Elimina la palabra "Preventa" sin importar mayúsculas/minúsculas
  //     const cleanedPreSale = preSale
  //       .replace(/\bpreventa\b/gi, '') // Quita la palabra
  //       .replace(/\s{2,}/g, ' ') // Elimina espacios dobles
  //       .trim(); // Quita espacios al inicio y final

  //     return (
  //       <div className='w-full flex justify-center'>
  //         <span className='text-slate-200 text-xs'>
  //           {cleanedPreSale || '—'}
  //         </span>
  //       </div>
  //     );
  //   },
  // },
];
