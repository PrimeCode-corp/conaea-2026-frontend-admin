import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePartnerUniversityStore } from '@/store/usePartnerUniversityStore';

const ALL_VALUE = 'all';

interface PartnerUniversityFiltersProps {
  selectedQuotaTypeId: number | undefined;
  onQuotaTypeChange: (id: number | undefined) => void;
}

const PartnerUniversityFilters = ({
  selectedQuotaTypeId,
  onQuotaTypeChange,
}: PartnerUniversityFiltersProps) => {
  const { quotaTypes } = usePartnerUniversityStore();

  const selectValue =
    selectedQuotaTypeId === undefined
      ? ALL_VALUE
      : selectedQuotaTypeId.toString();

  const handleChange = (val: string) => {
    onQuotaTypeChange(val === ALL_VALUE ? undefined : Number(val));
  };

  return (
    <div className='flex flex-wrap gap-2'>
      <Select value={selectValue} onValueChange={handleChange}>
        <SelectTrigger className='w-44 bg-[#111] border-white/10 text-slate-200 focus:ring-[#fbba0e] focus:ring-offset-0 text-sm'>
          <SelectValue placeholder='Filtrar por tipo de cuota' />
        </SelectTrigger>
        <SelectContent className='bg-[#1a1a1a] border-white/10 text-slate-200'>
          <SelectItem
            value={ALL_VALUE}
            className='focus:bg-white/5 focus:text-slate-100'
          >
            Tipos
          </SelectItem>
          {quotaTypes
            .filter((type) => type.name !== 'General')
            .map((type) => (
              <SelectItem
                key={type.id}
                value={type.id.toString()}
                className='focus:bg-white/5 focus:text-slate-100'
              >
                {type.name}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PartnerUniversityFilters;
