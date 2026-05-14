import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useDelegateStore } from '@/store/useDelegateStore';

interface DelegatesFiltersProps {
  selectedUniversityId: number | undefined;
  onUniversityChange: (id: number | undefined) => void;
}

const DelegatesFilters = ({
  selectedUniversityId,
  onUniversityChange,
}: DelegatesFiltersProps) => {
  const { universities } = useDelegateStore();

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = universities.find((u) => u.id === selectedUniversityId);
  const filtered = query
    ? universities.filter(
        (u) =>
          u.name.toLowerCase().includes(query.toLowerCase()) ||
          u.abbreviation.toLowerCase().includes(query.toLowerCase()),
      )
    : universities;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (id: number) => {
    onUniversityChange(id);
    setOpen(false);
    setQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUniversityChange(undefined);
  };

  return (
    <div ref={containerRef} className='relative'>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className='flex items-center gap-1.5 h-9 px-3 text-sm rounded-md border border-white/10 bg-[#111] text-slate-200 hover:bg-white/5 transition min-w-44'
        >
          <Search className='h-3.5 w-3.5 shrink-0 text-slate-400' />
          {selected ? (
            <>
              <span className='max-w-36 truncate text-slate-200 flex-1 text-left'>
                {selected.abbreviation}
              </span>
              <X
                className='h-3.5 w-3.5 shrink-0 text-slate-400 hover:text-white ml-auto'
                onClick={handleClear}
              />
            </>
          ) : (
            <span className='text-slate-500'>Universidad</span>
          )}
        </button>
      ) : (
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Buscar universidad...'
          className='h-9 px-3 text-sm rounded-md border border-[#fbba0e]/60 bg-[#111] text-slate-200 outline-none focus:ring-1 focus:ring-[#fbba0e] min-w-44 w-56'
        />
      )}

      {open && (
        <div className='absolute top-10 left-0 z-50 w-72 rounded-md border border-white/10 bg-[#1a1a1a] shadow-xl max-h-56 overflow-y-auto'>
          {filtered.length === 0 ? (
            <p className='px-3 py-3 text-xs text-slate-500'>Sin resultados.</p>
          ) : (
            filtered.map((u) => (
              <button
                key={u.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(u.id);
                }}
                className='w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-white/5 transition flex items-baseline gap-2 border-b border-white/5 last:border-0'
              >
                <span className='text-[#fbba0e] text-xs font-mono shrink-0'>
                  {u.abbreviation}
                </span>
                <span className='truncate'>{u.name}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default DelegatesFilters;
