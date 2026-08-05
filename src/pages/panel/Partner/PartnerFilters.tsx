import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PARTNER_TYPES, type PartnerType } from '@/types/partners.types';

interface PartnerFiltersProps {
  selectedType: PartnerType | undefined;
  onTypeChange: (type: PartnerType | undefined) => void;
}

const PartnerFilters = ({
  selectedType,
  onTypeChange,
}: PartnerFiltersProps) => {
  return (
    <div className='flex flex-wrap gap-2'>
      <Select
        value={selectedType ?? 'all'}
        onValueChange={(val) =>
          onTypeChange(val === 'all' ? undefined : (val as PartnerType))
        }
      >
        <SelectTrigger className='w-48 bg-[#111] border-white/10 text-slate-200 focus:ring-[#fbba0e] focus:ring-offset-0 text-sm cursor-pointer'>
          <SelectValue placeholder='Filtrar por tipo' />
        </SelectTrigger>
        <SelectContent className='bg-[#1a1a1a] border-white/10 text-slate-200'>
          <SelectItem
            value='all'
            className='focus:bg-white/5 focus:text-slate-100 cursor-pointer'
          >
            Todos los tipos
          </SelectItem>
          {PARTNER_TYPES.map((type) => (
            <SelectItem
              key={type}
              value={type}
              className='focus:bg-white/5 focus:text-slate-100 cursor-pointer'
            >
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PartnerFilters;
