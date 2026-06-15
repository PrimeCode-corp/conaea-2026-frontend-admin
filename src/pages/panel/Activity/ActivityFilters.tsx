import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect } from 'react';
import { useDayStore } from '@/store/useDayStore';
import { useActivityTypeStore } from '@/store/useActivityTypeStore';
import { useSpeakerStore } from '@/store/useSpeakerStore';

interface ActivityFiltersProps {
  selectedDayId: number | undefined;
  selectedActivityTypeId: number | undefined;
  selectedSpeakerId: number | undefined;
  onDayChange: (id: number | undefined) => void;
  onActivityTypeChange: (id: number | undefined) => void;
  onSpeakerChange: (id: number | undefined) => void;
}

const ActivityFilters = ({
  selectedDayId,
  selectedActivityTypeId,
  selectedSpeakerId,
  onDayChange,
  onActivityTypeChange,
  onSpeakerChange,
}: ActivityFiltersProps) => {
  const { days, fetchDays } = useDayStore();
  const { activityTypes, fetchActivityTypes } = useActivityTypeStore();
  const { speakers, fetchSpeakers } = useSpeakerStore();

  useEffect(() => {
    fetchDays();
    fetchActivityTypes();
    fetchSpeakers();
  }, [fetchDays, fetchActivityTypes, fetchSpeakers]);

  useEffect(() => {
    if (days.length > 0 && selectedDayId === undefined) {
      onDayChange(days[0].id);
    }
  }, [days, selectedDayId, onDayChange]);

  return (
    <div className='flex flex-wrap gap-2'>
      <Select
        value={selectedDayId?.toString()}
        onValueChange={(val) => onDayChange(Number(val))}
      >
        <SelectTrigger className='w-44 bg-[#111] border-white/10 text-slate-200 focus:ring-[#fbba0e] focus:ring-offset-0 text-sm'>
          <SelectValue placeholder='Filtrar por día' />
        </SelectTrigger>
        <SelectContent className='bg-[#1a1a1a] border-white/10 text-slate-200'>
          {days.map((day) => (
            <SelectItem
              key={day.id}
              value={day.id.toString()}
              className='focus:bg-white/5 focus:text-slate-100'
            >
              {day.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedActivityTypeId?.toString() ?? 'all'}
        onValueChange={(val) =>
          onActivityTypeChange(val === 'all' ? undefined : Number(val))
        }
      >
        <SelectTrigger className='w-52 bg-[#111] border-white/10 text-slate-200 focus:ring-[#fbba0e] focus:ring-offset-0 text-sm'>
          <SelectValue placeholder='Filtrar por tipo' />
        </SelectTrigger>
        <SelectContent className='bg-[#1a1a1a] border-white/10 text-slate-200'>
          <SelectItem
            value='all'
            className='focus:bg-white/5 focus:text-slate-100'
          >
            Todos los tipos
          </SelectItem>
          {activityTypes.map((type) => (
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

      <Select
        value={selectedSpeakerId?.toString() ?? 'all'}
        onValueChange={(val) =>
          onSpeakerChange(val === 'all' ? undefined : Number(val))
        }
      >
        <SelectTrigger className='w-52 bg-[#111] border-white/10 text-slate-200 focus:ring-[#fbba0e] focus:ring-offset-0 text-sm'>
          <SelectValue placeholder='Filtrar por speaker' />
        </SelectTrigger>
        <SelectContent className='bg-[#1a1a1a] border-white/10 text-slate-200'>
          <SelectItem
            value='all'
            className='focus:bg-white/5 focus:text-slate-100'
          >
            Todos los speakers
          </SelectItem>
          {speakers.map((speaker) => (
            <SelectItem
              key={speaker.id}
              value={speaker.id.toString()}
              className='focus:bg-white/5 focus:text-slate-100'
            >
              {speaker.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ActivityFilters;
