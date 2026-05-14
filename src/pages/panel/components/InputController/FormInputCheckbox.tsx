import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Type } from 'lucide-react';

interface Props {
  id: string;
  label?: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

const FormInputCheckbox = ({
  id,
  label,
  value,
  onValueChange,
  placeholder,
  error,
}: Props) => {
  const [checked, setChecked] = useState(value !== '');

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setChecked(isChecked);
    if (!isChecked) onValueChange('');
  };

  return (
    <div className='flex flex-col gap-1.5'>
      <div className='flex items-center gap-2'>
        <Label
          htmlFor={id}
          className='text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5'
        >
          <Type className='text-[#fbba0e] size-3 mb-px' />
          {label}
        </Label>
        <input
          type='checkbox'
          checked={checked}
          onChange={handleToggle}
          className='accent-[#fbba0e] w-3.5 h-3.5 cursor-pointer'
        />
      </div>

      <textarea
        id={id}
        name={id}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        disabled={!checked}
        rows={3}
        className='w-full bg-[#111] border border-white/10 text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#fbba0e] rounded-md px-3 py-2 text-sm resize-none disabled:opacity-40 disabled:cursor-not-allowed'
      />

      {error && <p className='text-xs text-red-400'>{error}</p>}
    </div>
  );
};

export default FormInputCheckbox;
