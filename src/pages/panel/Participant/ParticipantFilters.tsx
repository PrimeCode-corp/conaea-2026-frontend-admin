import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useParticipantStore } from '@/store/useParticipantStore';
import UniversitySearchFilter from './UniversitySearchFilter';

interface ParticipantFiltersProps {
  preSaleId: string;
  documentType: string;
  quotaTypeId: string;
  universityCode: string;
  onPreSaleChange: (val: string) => void;
  onDocumentTypeChange: (val: string) => void;
  onQuotaTypeChange: (val: string) => void;
  onUniversityCodeChange: (code: string) => void;
}

const ParticipantFilters = ({
  preSaleId,
  documentType,
  quotaTypeId,
  universityCode,
  onPreSaleChange,
  onDocumentTypeChange,
  onQuotaTypeChange,
  onUniversityCodeChange,
}: ParticipantFiltersProps) => {
  const { preSales, quotaTypes } = useParticipantStore();

  return (
    <div className='flex flex-wrap gap-2'>
      {/* Preventa */}
      <Select
        value={preSaleId || 'all'}
        onValueChange={(val) => onPreSaleChange(val === 'all' ? '' : val)}
      >
        <SelectTrigger className='w-44 bg-[#111] border-white/10 text-slate-200 text-sm'>
          <SelectValue placeholder='Preventa' />
        </SelectTrigger>
        <SelectContent className='bg-[#1a1a1a] border-white/10 text-slate-200'>
          <SelectItem
            value='all'
            className='focus:bg-white/5 focus:text-slate-100'
          >
            Preventas
          </SelectItem>
          {preSales.map((ps) => (
            <SelectItem
              key={ps.id}
              value={ps.id.toString()}
              className='focus:bg-white/5 focus:text-slate-100'
            >
              {ps.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Tipo de documento */}
      <Select
        value={documentType || 'all'}
        onValueChange={(val) => onDocumentTypeChange(val === 'all' ? '' : val)}
      >
        <SelectTrigger className='w-44 bg-[#111] border-white/10 text-slate-200 text-sm'>
          <SelectValue placeholder='Documento' />
        </SelectTrigger>
        <SelectContent className='bg-[#1a1a1a] border-white/10 text-slate-200'>
          <SelectItem
            value='all'
            className='focus:bg-white/5 focus:text-slate-100'
          >
            Documentos
          </SelectItem>
          <SelectItem
            value='DNI'
            className='focus:bg-white/5 focus:text-slate-100'
          >
            DNI
          </SelectItem>
          <SelectItem
            value='PASAPORTE'
            className='focus:bg-white/5 focus:text-slate-100'
          >
            Pasaporte
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Categoría */}
      <Select
        value={quotaTypeId || 'all'}
        onValueChange={(val) => onQuotaTypeChange(val === 'all' ? '' : val)}
      >
        <SelectTrigger className='w-44 bg-[#111] border-white/10 text-slate-200 text-sm'>
          <SelectValue placeholder='Categoría' />
        </SelectTrigger>
        <SelectContent className='bg-[#1a1a1a] border-white/10 text-slate-200'>
          <SelectItem
            value='all'
            className='focus:bg-white/5 focus:text-slate-100'
          >
            Cupos
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

      {/* Universidad (combobox con búsqueda) */}
      <UniversitySearchFilter
        value={universityCode}
        onChange={onUniversityCodeChange}
      />
    </div>
  );
};

export default ParticipantFilters;
