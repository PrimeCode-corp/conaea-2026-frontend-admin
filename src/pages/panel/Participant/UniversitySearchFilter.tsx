import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { partnerUniversityService } from '@/services/partnerUniversityService';

type UniversityOption = { code: string; name: string; abbreviation: string };

interface UniversitySearchFilterProps {
  value: string;
  onChange: (code: string) => void;
}

const UniversitySearchFilter = ({
  value,
  onChange,
}: UniversitySearchFilterProps) => {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<UniversityOption[]>([]);
  const [open, setOpen] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(
      async () => {
        setFetching(true);
        try {
          const results = await partnerUniversityService.search(
            query || undefined,
          );
          setOptions(results);
        } catch {
          setOptions([]);
        } finally {
          setFetching(false);
        }
      },
      query ? 300 : 0,
    );
    return () => clearTimeout(timeout);
  }, [query, open]);

  const handleOpen = () => {
    setOptions([]);
    setOpen(true);
  };

  const handleSelect = (opt: UniversityOption) => {
    onChange(opt.code);
    setSelectedLabel(opt.abbreviation || opt.name);
    setOpen(false);
    setQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSelectedLabel('');
    setQuery('');
  };

  return (
    <div ref={containerRef} className='relative'>
      <button
        onClick={value ? undefined : handleOpen}
        className='flex items-center gap-1.5 h-9 px-3 text-sm rounded-md border border-white/10 bg-[#111] text-slate-200 hover:bg-white/5 transition min-w-36'
      >
        <Search className='h-3.5 w-3.5 shrink-0 text-slate-400' />
        {value ? (
          <>
            <span className='max-w-28 truncate text-slate-200'>
              {selectedLabel}
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

      {open && (
        <div className='absolute top-10 left-0 z-50 w-64 rounded-md border border-white/10 bg-[#1a1a1a] shadow-xl'>
          <div className='p-2 border-b border-white/10'>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Buscar universidad...'
              className='w-full bg-[#111] text-slate-200 text-sm px-2 py-1.5 rounded border border-white/10 outline-none focus:border-[#fbba0e]/50 placeholder:text-slate-500'
            />
          </div>
          <div className='max-h-52 overflow-y-auto'>
            {fetching ? (
              <p className='px-3 py-3 text-xs text-slate-500'>Buscando...</p>
            ) : options.length === 0 ? (
              <p className='px-3 py-3 text-xs text-slate-500'>
                Sin resultados.
              </p>
            ) : (
              options.map((opt) => (
                <button
                  key={opt.code}
                  onClick={() => handleSelect(opt)}
                  className='w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-white/5 transition flex items-baseline gap-2'
                >
                  <span className='text-[#fbba0e] text-xs font-mono shrink-0'>
                    {opt.abbreviation}
                  </span>
                  <span className='truncate'>{opt.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversitySearchFilter;
