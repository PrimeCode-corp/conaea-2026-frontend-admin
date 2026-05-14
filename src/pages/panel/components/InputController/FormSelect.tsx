import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { List } from 'lucide-react';

interface Option {
  label: string;
  value: string;
}

interface Props {
  label?: string;
  placeholder?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Option[];
  disabled?: boolean;
  error?: string;
}

const FormSelect = ({
  label,
  placeholder = 'Selecciona una opción',
  value,
  onValueChange,
  options,
  disabled,
  error,
}: Props) => {
  return (
    <div className='flex flex-col gap-2 cursor-pointer!'>
      {label && (
        <Label className='text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5'>
          <List className='text-[#fbba0e] h-3 w-3 mb-px' />
          {label}
        </Label>
      )}

      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className='bg-[#111] border-white/10 text-slate-200 focus:ring-[#fbba0e] focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed'>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent className='bg-[#1a1a1a] border-white/10 text-slate-200 hover:ring-[#fbba0e]'>
          {options.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className='hover:bg-[#fbba0e]! cursor-pointer'
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error && <p className='text-xs text-red-400'>{error}</p>}
    </div>
  );
};

export default FormSelect;
