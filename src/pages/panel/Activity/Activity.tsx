import { useEffect, useState } from 'react';
import { useClientPagination } from '@/hooks/useClientPagination';

import { Zap } from 'lucide-react';

import HeaderPanel from '../components/HeaderPanel';
import TablePanel from '../components/TablePanel';
import FooterPanel from '../components/FooterPanel';
import SearchPanel from '../components/SearchPanel';
import LoadingControl from '@/components/LoadingControl';

import { useActivityStore } from '@/store/useActivityStore';
import { useDayStore } from '@/store/useDayStore';
import { useActivityTypeStore } from '@/store/useActivityTypeStore';
import { useSpeakerStore } from '@/store/useSpeakerStore';

import type { Activities, ActivityDetail } from '@/types/activities.types';
import {
  type ActivityForm,
  type FormErrors,
  type ActivityPayload,
  emptyForm,
} from './activity.types';

import ActivityActionButtons from './ActivityActionButtons';
import ActivityTableButtons from './ActivityTableButtons';

import ModalDelete from '../components/modals/ModalDelete';
import ModalForm from '../components/modals/ModalForm';
import ActivityFilters from './ActivityFilters';

import { getActivityColumns } from './columns';
import { getActivityFields } from './fields';
import { validate } from '@/utils/validations';

import { Toaster } from 'sonner'; // 👈 agregar
import { toast } from 'sonner';

type Row = Record<string, unknown>;

const formToPayload = (form: ActivityForm): ActivityPayload => ({
  name: form.name,
  order: Number(form.order),
  start_date: form.start_date,
  duration: Number(form.duration),
  location: form.location,
  capacity: Number(form.capacity),
  day: Number(form.day),
  activity_type: Number(form.activity_type),
  speaker: Number(form.speaker),
});

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

  // --- Modal Eliminar ---
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [rowToDelete, setRowToDelete] = useState<Row | null>(null);

  const [deleting, setDeleting] = useState(false);

  // --- Modal Editar (el padre controla qué fila se edita) ---
  const [editOpen, setEditOpen] = useState(false);

  const [rowToEdit, setRowToEdit] = useState<ActivityDetail | null>(null);

  const [editForm, setEditForm] = useState<ActivityForm>(emptyForm);

  const [editErrors, setEditErrors] = useState<FormErrors>({});

  const [editLoading, setEditLoading] = useState(false);

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
  }, []);

  useEffect(() => {
    if (editOpen && rowToEdit) {
      setEditForm({
        name: rowToEdit.name,
        order: rowToEdit.order.toString(),
        start_date: rowToEdit.start_date?.slice(0, 16) ?? '',
        duration: rowToEdit.duration.toString(),
        location: rowToEdit.location,
        capacity: rowToEdit.capacity.toString(),
        day: rowToEdit.day.id.toString(), // 👈 .id porque ahora es objeto
        activity_type: rowToEdit.activity_type.id.toString(), // 👈 .id
        speaker: rowToEdit.speaker.id.toString(), // 👈 .id
      });
      setEditErrors({});
    }
  }, [editOpen, rowToEdit]);

  const columns = getActivityColumns();

  const fields = getActivityFields(days, speakers, activityTypes);

  const handleEditSelectChange = (id: string, value: string) => {
    setEditForm((prev) => ({ ...prev, [id]: value }));
    setEditErrors((prev) => ({ ...prev, [id]: undefined }));
  };

  // Abre el modal de editar con la fila seleccionada
  const handleEditRequest = (row: Row) => {
    const original = activities.find((d) => d.id === (row.id as number));
    if (original) {
      setRowToEdit(original); // usa los datos originales (no formateados)
      setEditOpen(true);
    }
  };

  // Handlers eliminar
  const handleDeleteRequest = (row: Row) => {
    setRowToDelete(row);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!rowToDelete) return;
    setDeleting(true);
    try {
      await removeActivity(rowToDelete.id as number);
      toast.success('Actividad eliminada correctamente.');
      setConfirmOpen(false);
      setRowToDelete(null);
    } catch {
      toast.error('Error al eliminar la actividad. Intenta nuevamente.');
    } finally {
      setDeleting(false);
    }
  };

  const handleEditOpen = (val: boolean) => {
    setEditOpen(val);
    if (!val) {
      setEditForm(emptyForm);
      setEditErrors({});
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setEditErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleEditSubmit = async () => {
    if (!rowToEdit) return;
    if (!validate(editForm, fields, setEditErrors)) return;
    setEditLoading(true);
    try {
      await updateActivity(rowToEdit.id, formToPayload(editForm));
      toast.success('Actividad actualizada correctamente.');
      handleEditOpen(false);
    } catch {
      toast.error('Error al actualizar la actividad. Intenta nuevamente.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setConfirmOpen(false);
    setRowToDelete(null);
  };

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
  const { page, totalPages, paginated, pageSize, hasPrev, hasNext, goNext, goPrev, goTo } =
    useClientPagination(filtered);

  if (loading) return <LoadingControl />;
  if (error) return <p className='text-red-400 p-8'>{error}</p>;

  return (
    <>
      <HeaderPanel
        title='Panel de Control'
        description='Gestión de Actividades'
        icon={<Zap className='h-5 w-5 text-black' />}
      />

      <div className='rounded-2xl border border-white/10 bg-[#1a1a1a] shadow-xl'>
        <div className='flex flex-col gap-3 border-b border-white/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex flex-wrap items-center gap-2'>
            <ActivityActionButtons />
            <ActivityFilters
              selectedDayId={selectedDayId}
              selectedActivityTypeId={selectedActivityTypeId}
              onDayChange={setSelectedDayId}
              onActivityTypeChange={setSelectedActivityTypeId}
              selectedSpeakerId={selectedSpeakerId}
              onSpeakerChange={setSelectedSpeakerId}
            />
          </div>
          <SearchPanel
            search={search}
            setSearch={setSearch}
            placeholder='Buscar actividades...'
          />
        </div>

        <TablePanel columns={columns} data={paginated}>
          {(row) => (
            <ActivityTableButtons
              row={row as Activities}
              onEdit={handleEditRequest}
              onDelete={handleDeleteRequest}
            />
          )}
        </TablePanel>

        <FooterPanel
          filtered={filtered.length}
          elements={activities.length}
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          hasPrev={hasPrev}
          hasNext={hasNext}
          onPrev={goPrev}
          onNext={goNext}
          onGoTo={goTo}
        />
      </div>

      {/* Modal Eliminar */}
      <ModalDelete
        open={confirmOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title='Eliminar actividad'
        description={rowToDelete?.title as string}
      />

      <ModalForm
        mode='edit'
        open={editOpen}
        onOpenChange={handleEditOpen}
        fields={fields}
        form={editForm}
        errors={editErrors}
        onChange={handleEditChange}
        onSubmit={handleEditSubmit}
        loading={editLoading}
        title='Editar Actividad'
        description='Edita los campos de la actividad.'
        icon={<Zap className='h-4 w-4 text-black' />}
        onValueChange={handleEditSelectChange}
      />

      <Toaster position='bottom-right' richColors theme='dark' />
    </>
  );
};

export default Activity;
