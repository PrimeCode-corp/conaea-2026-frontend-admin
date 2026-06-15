import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect } from 'react';
import { useAvailableSlotStore } from '@/store/useAvailableSlotStore';
import { useQuotaTypeStore } from '@/store/useQuotaTypeStore';

interface AvailableSlotFiltersProps {
  selectedPreSaleId: number | undefined;
  selectedQuotaTypeId: number | undefined;
  onPreSaleChange: (id: number | undefined) => void;
  onQuotaTypeChange: (id: number | undefined) => void;
}

const AvailableSlotFilters = ({
  selectedPreSaleId,
  selectedQuotaTypeId,
  onPreSaleChange,
  onQuotaTypeChange,
}: AvailableSlotFiltersProps) => {
  const { preSales } = useAvailableSlotStore();

  const { quotaTypes, fetchQuotaTypes } = useQuotaTypeStore();

  const ALL_VALUE = 'all';

  useEffect(() => {
    fetchQuotaTypes();
  }, [fetchQuotaTypes]);

  const preSaleSelectValue =
    selectedPreSaleId === undefined ? ALL_VALUE : selectedPreSaleId.toString();

  const handlePreSaleChange = (val: string) => {
    onPreSaleChange(val === ALL_VALUE ? undefined : Number(val));
  };

  return (
    <div className='flex flex-wrap gap-2'>
      <Select value={preSaleSelectValue} onValueChange={handlePreSaleChange}>
        <SelectTrigger className='w-44 bg-[#111] border-white/10 text-slate-200 focus:ring-[#fbba0e] focus:ring-offset-0 text-sm'>
          <SelectValue placeholder='Filtrar por preventa' />
        </SelectTrigger>
        <SelectContent className='bg-[#1a1a1a] border-white/10 text-slate-200'>
          <SelectItem
            value={ALL_VALUE}
            className='focus:bg-white/5 focus:text-slate-100'
          >
            Todas las preventas
          </SelectItem>
          {preSales.map((preSale) => (
            <SelectItem
              key={preSale.id}
              value={preSale.id.toString()}
              className='focus:bg-white/5 focus:text-slate-100'
            >
              {preSale.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedQuotaTypeId?.toString() ?? 'all'}
        onValueChange={(val) =>
          onQuotaTypeChange(val === 'all' ? undefined : Number(val))
        }
      >
        <SelectTrigger className='w-52 bg-[#111] border-white/10 text-slate-200 focus:ring-[#fbba0e] focus:ring-offset-0 text-sm'>
          <SelectValue placeholder='Filtrar por tipo de cuota' />
        </SelectTrigger>
        <SelectContent className='bg-[#1a1a1a] border-white/10 text-slate-200'>
          <SelectItem
            value='all'
            className='focus:bg-white/5 focus:text-slate-100'
          >
            Todos los tipos
          </SelectItem>
          {quotaTypes.map((type) => (
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

export default AvailableSlotFilters;
