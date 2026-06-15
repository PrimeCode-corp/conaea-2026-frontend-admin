import { useEffect, useState } from 'react';
import { useClientPagination } from '@/hooks/useClientPagination';
import { useCrudPanel } from '@/hooks/useCrudPanel';

import { CalendarDays } from 'lucide-react';

import LoadingControl from '@/components/LoadingControl';
import CrudPanelLayout from '../components/CrudPanelLayout';

import { useDayStore } from '@/store/useDayStore';
import type { Days } from '@/types/days.types';
import { type DaysForm, emptyForm } from './days.types';

import DayActionButtons from './DayActionButtons';
import DayTableButtons from './DayTableButtons';

import { getDayColumns } from './columns';
import { fields } from './fields';

const Day = () => {
  const { days, loading, error, fetchDays, removeDay, updateDay } =
    useDayStore();
  const [search, setSearch] = useState('');

  const columns = getDayColumns();

  useEffect(() => {
    fetchDays();
  }, [fetchDays]);

  const filtered = days.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase()),
  );
  const pagination = useClientPagination(filtered);

  const crud = useCrudPanel<Days, DaysForm, DaysForm>({
    items: days,
    remove: removeDay,
    update: updateDay,
    getRowLabel: (row) => row.title as string,
    emptyForm,
    fields,
    mapToForm: (d) => ({ title: d.title, date: d.date }),
    toPayload: (f) => ({ title: f.title, date: f.date }),
    messages: {
      deleteSuccess: 'Día eliminado correctamente.',
      deleteError: 'Error al eliminar el día. Intenta nuevamente.',
      editSuccess: 'Día actualizado correctamente.',
      editError: 'Error al actualizar el día. Intenta nuevamente.',
    },
  });

  if (loading) return <LoadingControl />;
  if (error) return <p className='text-red-400 p-8'>{error}</p>;

  return (
    <CrudPanelLayout
      description='Gestión de Días'
      icon={<CalendarDays className='h-5 w-5 text-black' />}
      toolbar={<DayActionButtons />}
      search={search}
      setSearch={setSearch}
      searchPlaceholder='Buscar días...'
      columns={columns}
      data={pagination.paginated}
      renderRowActions={(row) => (
        <DayTableButtons
          row={row as Days}
          onEdit={crud.onEdit}
          onDelete={crud.onDelete}
        />
      )}
      filtered={filtered.length}
      total={days.length}
      pagination={pagination}
      deleteModal={crud.deleteModal}
      deleteTitle='Eliminar día'
      editModal={crud.editModal}
      editTitle='Editar Día'
      editDescription='Edita los campos del día.'
      editIcon={<CalendarDays className='h-4 w-4 text-black' />}
      editFields={fields}
    />
  );
};

export default Day;
