import { useEffect, useState } from 'react';
import { useClientPagination } from '@/hooks/useClientPagination';
import { useCrudPanel } from '@/hooks/useCrudPanel';

import { Zap } from 'lucide-react';

import LoadingControl from '@/components/LoadingControl';
import CrudPanelLayout from '../components/CrudPanelLayout';

import { useActivityStore } from '@/store/useActivityStore';
import { useDayStore } from '@/store/useDayStore';
import { useActivityTypeStore } from '@/store/useActivityTypeStore';
import { useSpeakerStore } from '@/store/useSpeakerStore';

import type { Activities, ActivityDetail } from '@/types/activities.types';
import {
  type ActivityForm,
  type ActivityPayload,
  emptyForm,
  formToPayload,
} from './activity.types';

import ActivityActionButtons from './ActivityActionButtons';
import ActivityTableButtons from './ActivityTableButtons';
import ActivityFilters from './ActivityFilters';

import { getActivityColumns } from './columns';
import { getActivityFields } from './fields';

const Activity = () => {
  const {
    activities,
    loading,
    error,
    fetchActivities,
    removeActivity,
    updateActivity,
  } = useActivityStore();

  const { days } = useDayStore();
  const { activityTypes } = useActivityTypeStore();
  const { speakers } = useSpeakerStore();

  const [search, setSearch] = useState('');

  // --- Filtros ---
  const [selectedDayId, setSelectedDayId] = useState<number | undefined>(
    undefined,
  );
  const [selectedActivityTypeId, setSelectedActivityTypeId] = useState<
    number | undefined
  >(undefined);
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<
    number | undefined
  >(undefined);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const columns = getActivityColumns();
  const fields = getActivityFields(days, speakers, activityTypes);

  const filtered = activities.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
    const matchDay = selectedDayId ? d.day.id === selectedDayId : true;
    const matchType = selectedActivityTypeId
      ? d.activity_type.id === selectedActivityTypeId
      : true;
    const matchSpeaker = selectedSpeakerId
      ? d.speaker.id === selectedSpeakerId
      : true;
    return matchSearch && matchDay && matchType && matchSpeaker;
  });
  const pagination = useClientPagination(filtered);

  const crud = useCrudPanel<ActivityDetail, ActivityForm, ActivityPayload>({
    items: activities,
    remove: removeActivity,
    update: updateActivity,
    emptyForm,
    fields,
    mapToForm: (a) => ({
      name: a.name,
      order: a.order.toString(),
      start_date: a.start_date?.slice(0, 16) ?? '',
      duration: a.duration.toString(),
      location: a.location,
      capacity: a.capacity.toString(),
      day: a.day.id.toString(),
      activity_type: a.activity_type.id.toString(),
      speaker: a.speaker.id.toString(),
    }),
    toPayload: formToPayload,
    messages: {
      deleteSuccess: 'Actividad eliminada correctamente.',
      deleteError: 'Error al eliminar la actividad. Intenta nuevamente.',
      editSuccess: 'Actividad actualizada correctamente.',
      editError: 'Error al actualizar la actividad. Intenta nuevamente.',
    },
  });

  if (loading) return <LoadingControl />;
  if (error) return <p className='text-red-400 p-8'>{error}</p>;

  return (
    <CrudPanelLayout
      description='Gestión de Actividades'
      icon={<Zap className='h-5 w-5 text-black' />}
      toolbar={
        <>
          <ActivityActionButtons />
          <ActivityFilters
            selectedDayId={selectedDayId}
            selectedActivityTypeId={selectedActivityTypeId}
            onDayChange={setSelectedDayId}
            onActivityTypeChange={setSelectedActivityTypeId}
            selectedSpeakerId={selectedSpeakerId}
            onSpeakerChange={setSelectedSpeakerId}
          />
        </>
      }
      search={search}
      setSearch={setSearch}
      searchPlaceholder='Buscar actividades...'
      columns={columns}
      data={pagination.paginated}
      renderRowActions={(row) => (
        <ActivityTableButtons
          row={row as Activities}
          onEdit={crud.onEdit}
          onDelete={crud.onDelete}
        />
      )}
      filtered={filtered.length}
      total={activities.length}
      pagination={pagination}
      deleteModal={crud.deleteModal}
      deleteTitle='Eliminar actividad'
      editModal={crud.editModal}
      editTitle='Editar Actividad'
      editDescription='Edita los campos de la actividad.'
      editIcon={<Zap className='h-4 w-4 text-black' />}
      editFields={fields}
    />
  );
};

export default Activity;
