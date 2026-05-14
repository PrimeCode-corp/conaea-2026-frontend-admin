import { useState, useRef, useEffect, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Building2, Search, Loader2, X } from 'lucide-react';
import { partnerUniversityService } from '@/services/partnerUniversityService';

interface University {
  code: string;
  name: string;
  abbreviation: string;
}

interface Props {
  value: string;
  initialName?: string;
  onValueChange: (code: string) => void;
  label?: string;
  disabled?: boolean;
  error?: string;
}

const FormUniversitySelect = ({
  value,
  initialName,
  onValueChange,
  label,
  disabled,
  error,
}: Props) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState(initialName ?? value);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

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

  const search = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const data = await partnerUniversityService.search(q || undefined);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOpen = () => {
    setOpen(true);
    search('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(q), 300);
  };

  const handleSelect = (uni: University) => {
    setDisplayName(`${uni.name} (${uni.abbreviation})`);
    onValueChange(uni.code);
    setOpen(false);
    setQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDisplayName('');
    onValueChange('');
  };

  return (
    <div ref={containerRef} className='flex flex-col gap-1.5 relative'>
      {label && (
        <Label className='text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5'>
          <Building2 className='text-[#fbba0e] size-3 mb-px' />
          {label}
        </Label>
      )}

      {!open ? (
        <button
          type='button'
          onClick={disabled ? undefined : handleOpen}
          disabled={disabled}
          className='flex items-center justify-between w-full bg-[#111] border border-white/10 text-sm rounded-md px-3 py-2 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:border-white/20'
        >
          <span className={displayName ? 'text-slate-200' : 'text-slate-500'}>
            {displayName || 'Buscar universidad…'}
          </span>
          <div className='flex items-center gap-1.5 shrink-0'>
            {value && !disabled && (
              <X
                className='w-3 h-3 text-slate-500 hover:text-slate-300'
                onClick={handleClear}
              />
            )}
            <Search className='w-3.5 h-3.5 text-slate-500' />
          </div>
        </button>
      ) : (
        <input
          autoFocus
          type='text'
          value={query}
          onChange={handleInputChange}
          placeholder='Escribe para buscar…'
          className='w-full bg-[#111] border border-[#fbba0e]/60 text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#fbba0e] rounded-md px-3 py-2 text-sm'
        />
      )}

      {open && (
        <div className='absolute top-full left-0 right-0 z-50 mt-1 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl max-h-48 overflow-y-auto'>
          {loading && (
            <div className='flex items-center justify-center py-4'>
              <Loader2 className='w-4 h-4 animate-spin text-slate-400' />
            </div>
          )}
          {!loading && results.length === 0 && (
            <p className='text-xs text-slate-500 text-center py-4'>
              Sin resultados
            </p>
          )}
          {!loading &&
            results.map((uni) => (
              <button
                key={uni.code}
                type='button'
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(uni);
                }}
                className='w-full text-left px-3 py-2.5 text-sm hover:bg-[#fbba0e]/10 transition-colors border-b border-white/5 last:border-0'
              >
                <span className='text-slate-200 font-medium'>{uni.name}</span>
                <span className='ml-2 text-xs text-slate-500'>
                  ({uni.abbreviation})
                </span>
              </button>
            ))}
        </div>
      )}

      {error && <p className='text-xs text-red-400'>{error}</p>}
    </div>
  );
};

export default FormUniversitySelect;
