export const getSpeakerColumns = (onPhotoClick: (url: string) => void) => [
  { id: 1, label: 'Nombre', key: 'name', centered: true },
  { id: 2, label: 'Título', key: 'title', centered: true },
  { id: 3, label: 'Biografia', key: 'bio', centered: true },
  {
    id: 4,
    label: 'Foto',
    key: 'photo',
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
];
