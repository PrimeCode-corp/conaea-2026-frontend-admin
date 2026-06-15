import { useEffect, useState } from 'react';
import { useClientPagination } from '@/hooks/useClientPagination';
import { useCrudPanel } from '@/hooks/useCrudPanel';

import { Brackets } from 'lucide-react';

import LoadingControl from '@/components/LoadingControl';
import CrudPanelLayout from '../components/CrudPanelLayout';

import { useActivityTypeStore } from '@/store/useActivityTypeStore';
import type { ActivityTypes } from '@/types/activityTypes.types';
import { type ActivityTypeForm, emptyForm } from './activityType.types';

import ActivityTypeActionButtons from './ActivityTypeActionButtons';
import ActivityTypeTableButtons from './ActivityTypeTableButtons';

import { columns } from './columns';
import { fields } from './fields';

const ActivityType = () => {
  const {
    activityTypes,
    loading,
    error,
    fetchActivityTypes,
    removeActivityType,
    updateActivityType,
  } = useActivityTypeStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchActivityTypes();
  }, [fetchActivityTypes]);

  const filtered = activityTypes.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()),
  );
  const pagination = useClientPagination(filtered);

  const crud = useCrudPanel<ActivityTypes, ActivityTypeForm, ActivityTypeForm>({
    items: activityTypes,
    remove: removeActivityType,
    update: updateActivityType,
    emptyForm,
    fields,
    mapToForm: (a) => ({ name: a.name, logo: a.logo }),
    toPayload: (f) => ({ name: f.name, logo: f.logo }),
    messages: {
      deleteSuccess: 'Tipo de actividad eliminada correctamente.',
      deleteError: 'Error al eliminar el tipo de actividad. Intenta nuevamente.',
      editSuccess: 'Tipo de actividad actualizada correctamente.',
      editError: 'Error al actualizar el tipo de actividad. Intenta nuevamente.',
    },
  });

  if (loading) return <LoadingControl />;
  if (error) return <p className='text-red-400 p-8'>{error}</p>;

  return (
    <CrudPanelLayout
      description='Gestión de Tipos de Actividades'
      icon={<Brackets className='h-5 w-5 text-black' />}
      toolbar={<ActivityTypeActionButtons />}
      search={search}
      setSearch={setSearch}
      searchPlaceholder='Buscar tipos de actividades...'
      columns={columns}
      data={pagination.paginated}
      renderRowActions={(row) => (
        <ActivityTypeTableButtons
          row={row as ActivityTypes}
          onEdit={crud.onEdit}
          onDelete={crud.onDelete}
        />
      )}
      filtered={filtered.length}
      total={activityTypes.length}
      pagination={pagination}
      deleteModal={crud.deleteModal}
      deleteTitle='Eliminar tipo de actividad'
      editModal={crud.editModal}
      editTitle='Editar Tipo de Actividad'
      editDescription='Edita los campos del tipo de actividad.'
      editIcon={<Brackets className='h-4 w-4 text-black' />}
      editFields={fields}
    />
  );
};

export default ActivityType;
