import { useState, useRef, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Search, X } from 'lucide-react';

interface Option {
  label: string;
  value: string;
}

interface Props {
  value: string;
  options: Option[];
  onValueChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

const FormSearchSelect = ({
  value,
  options,
  onValueChange,
  label,
  placeholder = 'Buscar...',
  disabled,
  error,
}: Props) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);
  const filtered = query
    ? options.filter((o) =>
        o.label.toLowerCase().includes(query.toLowerCase()),
      )
    : options;

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

  const handleOpen = () => {
    setOpen(true);
    setQuery('');
  };

  const handleSelect = (opt: Option) => {
    onValueChange(opt.value);
    setOpen(false);
    setQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange('');
  };

  return (
    <div ref={containerRef} className='flex flex-col gap-1.5 relative'>
      {label && (
        <Label className='text-xs font-semibold uppercase tracking-wider text-slate-400'>
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
          <span className={selected ? 'text-slate-200' : 'text-slate-500'}>
            {selected ? selected.label : placeholder}
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
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Escribe para buscar…'
          className='w-full bg-[#111] border border-[#fbba0e]/60 text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#fbba0e] rounded-md px-3 py-2 text-sm'
        />
      )}

      {open && (
        <div className='absolute top-full left-0 right-0 z-50 mt-1 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl max-h-52 overflow-y-auto'>
          {filtered.length === 0 ? (
            <p className='text-xs text-slate-500 text-center py-4'>
              Sin resultados
            </p>
          ) : (
            filtered.map((opt) => (
              <button
                key={opt.value}
                type='button'
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(opt);
                }}
                className='w-full text-left px-3 py-2.5 text-sm hover:bg-[#fbba0e]/10 transition-colors border-b border-white/5 last:border-0 text-slate-200'
              >
                {opt.label}
              </button>
            ))
          )}
        </div>
      )}

      {error && <p className='text-xs text-red-400'>{error}</p>}
    </div>
  );
};

export default FormSearchSelect;
