export const getDayColumns = () => [
  { id: 1, label: 'Título', key: 'title', centered: true },
  {
    id: 2,
    label: 'Fecha',
    key: 'date',
    centered: true,
    render: (value: unknown) => {
      if (!value)
        return <span className='text-slate-500 text-xs'>Sin fecha</span>;
      const [year, month, day] = (value as string).split('T')[0].split('-');
      return `${day}/${month}/${year}`;
    },
  },
];
