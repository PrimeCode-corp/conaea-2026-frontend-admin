import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIndividualCupStore } from '@/store/useIndividualCupStore';

const ALL_VALUE = 'all';

interface IndividualCupFiltersProps {
  selectedPreSaleId: number | undefined;
  selectedQuotaTypeId: number | undefined;
  onPreSaleChange: (id: number | undefined) => void;
  onQuotaTypeChange: (id: number | undefined) => void;
}

const IndividualCupFilters = ({
  selectedPreSaleId,
  selectedQuotaTypeId,
  onPreSaleChange,
  onQuotaTypeChange,
}: IndividualCupFiltersProps) => {
  const { preSales, quotaTypes } = useIndividualCupStore();

  const preSaleValue =
    selectedPreSaleId === undefined ? ALL_VALUE : selectedPreSaleId.toString();

  const quotaTypeValue =
    selectedQuotaTypeId === undefined
      ? ALL_VALUE
      : selectedQuotaTypeId.toString();

  return (
    <div className='flex flex-wrap gap-2'>
      <Select
        value={preSaleValue}
        onValueChange={(val) =>
          onPreSaleChange(val === ALL_VALUE ? undefined : Number(val))
        }
      >
        <SelectTrigger className='w-48 bg-[#111] border-white/10 text-slate-200 focus:ring-[#fbba0e] focus:ring-offset-0 text-sm'>
          <SelectValue placeholder='Filtrar por preventa' />
        </SelectTrigger>
        <SelectContent className='bg-[#1a1a1a] border-white/10 text-slate-200'>
          <SelectItem
            value={ALL_VALUE}
            className='focus:bg-white/5 focus:text-slate-100'
          >
            Todas las preventas
          </SelectItem>
          {preSales.map((p) => (
            <SelectItem
              key={p.id}
              value={p.id.toString()}
              className='focus:bg-white/5 focus:text-slate-100'
            >
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={quotaTypeValue}
        onValueChange={(val) =>
          onQuotaTypeChange(val === ALL_VALUE ? undefined : Number(val))
        }
      >
        <SelectTrigger className='w-44 bg-[#111] border-white/10 text-slate-200 focus:ring-[#fbba0e] focus:ring-offset-0 text-sm'>
          <SelectValue placeholder='Filtrar por tipo' />
        </SelectTrigger>
        <SelectContent className='bg-[#1a1a1a] border-white/10 text-slate-200'>
          <SelectItem
            value={ALL_VALUE}
            className='focus:bg-white/5 focus:text-slate-100'
          >
            Todos los tipos
          </SelectItem>
          {quotaTypes.map((qt) => (
            <SelectItem
              key={qt.id}
              value={qt.id.toString()}
              className='focus:bg-white/5 focus:text-slate-100'
            >
              {qt.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default IndividualCupFilters;
