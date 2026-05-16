export const getActivityColumns = () => [
  { id: 1, label: 'Nombre', key: 'name' },
  {
    id: 2,
    label: 'Día',
    key: 'day',
    centered: true,
    render: (value: unknown) => {
      const day = value as { title: string };
      return (
        <span className='text-slate-200 text-sm'>{day?.title ?? '—'}</span>
      );
    },
  },
  {
    id: 3,
    label: 'Inicio',
    key: 'start_date',
    centered: true,
    render: (value: unknown) => {
      if (!value) return <span className='text-slate-500 text-xs'>—</span>;
      const time = (value as string).slice(0, 5);
      return <span className='text-slate-200 text-sm'>{time}</span>;
    },
  },
  {
    id: 4,
    label: 'Tipo',
    key: 'activity_type',
    centered: true,
    render: (value: unknown) => {
      const type = value as { name: string };
      return (
        <span className='text-slate-200 text-sm'>{type?.name ?? '—'}</span>
      );
    },
  },
  {
    id: 5,
    label: 'Speaker',
    key: 'speaker',
    centered: true,
    render: (value: unknown) => {
      const speaker = value as { name: string };
      return speaker ? (
        <div className='flex items-center gap-2'>
          <span className='text-slate-200 text-sm'>{speaker.name}</span>
        </div>
      ) : (
        <span className='text-slate-500 text-xs'>Sin speaker</span>
      );
    },
  },
  {
    id: 6,
    label: 'Duración',
    key: 'duration',
    centered: true,
    render: (value: unknown) => {
      const minutes = value as number;
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      const formatted =
        h > 0 ? `${h}h ${m > 0 ? `${m}min` : ''}`.trim() : `${m}min`;
      return <span className='text-slate-200 text-sm'>{formatted}</span>;
    },
  },
  { id: 7, label: 'Ubicación', key: 'location', centered: true },
  { id: 8, label: 'Capacidad', key: 'capacity', centered: true },
];
