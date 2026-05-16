import { useEffect, useState } from 'react';
import { useClientPagination } from '@/hooks/useClientPagination';

import { Brackets } from 'lucide-react';

import HeaderPanel from '../components/HeaderPanel';
import TablePanel from '../components/TablePanel';
import FooterPanel from '../components/FooterPanel';
import SearchPanel from '../components/SearchPanel';
import LoadingControl from '@/components/LoadingControl';

import { useActivityTypeStore } from '@/store/useActivityTypeStore';
import type { ActivityTypes } from '@/types/activityTypes.types';
import type { ActivityTypeForm, FormErrors } from './activityType.types';

import ActivityTypeActionButtons from './ActivityTypeActionButtons';
import ActivityTypeTableButtons from './ActivityTypeTableButtons';

import ModalDelete from '../components/modals/ModalDelete';
import ModalForm from '../components/modals/ModalForm';

import { columns } from './columns';
import { fields } from './fields';
import { validate } from '@/utils/validations';

import { Toaster } from 'sonner'; // 👈 agregar
import { toast } from 'sonner';

type Row = Record<string, unknown>;

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

  // --- Modal Eliminar ---
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState(false);

  // --- Modal Editar (el padre controla qué fila se edita) ---
  const [editOpen, setEditOpen] = useState(false);
  const [rowToEdit, setRowToEdit] = useState<ActivityTypes | null>(null);
  const [editForm, setEditForm] = useState<ActivityTypeForm>({
    name: '',
    logo: '',
  });
  const [editErrors, setEditErrors] = useState<FormErrors>({});
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchActivityTypes();
  }, []);

  useEffect(() => {
    if (editOpen && rowToEdit) {
      setEditForm({
        name: rowToEdit.name,
        logo: rowToEdit.logo,
      });
      setEditErrors({});
    }
  }, [editOpen, rowToEdit]);

  const filtered = activityTypes.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()),
  );
  const { page, totalPages, paginated, pageSize, hasPrev, hasNext, goNext, goPrev, goTo } =
    useClientPagination(filtered);

  // Abre el modal de editar con la fila seleccionada
  const handleEditRequest = (row: Row) => {
    const original = activityTypes.find((d) => d.id === (row.id as number));
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
      await removeActivityType(rowToDelete.id as number);
      toast.success('Tipo de actividad eliminada correctamente.');
      setConfirmOpen(false);
      setRowToDelete(null);
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(detail ?? 'Error al eliminar el tipo de actividad. Intenta nuevamente.');
    } finally {
      setDeleting(false);
    }
  };

  const handleEditOpen = (val: boolean) => {
    setEditOpen(val);
    if (!val) {
      setEditForm({ name: '', logo: '' });
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
      await updateActivityType(rowToEdit.id, {
        name: editForm.name,
        logo: editForm.logo,
      });
      toast.success('Tipo de actividad actualizada correctamente.'); // 👈
      handleEditOpen(false);
    } catch {
      toast.error(
        'Error al actualizar el tipo de actividad. Intenta nuevamente.',
      ); // 👈
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setConfirmOpen(false);
    setRowToDelete(null);
  };

  if (loading) return <LoadingControl />;
  if (error) return <p className='text-red-400 p-8'>{error}</p>;

  return (
    <>
      <HeaderPanel
        title='Panel de Control'
        description='Gestión de Tipos de Actividades'
        icon={<Brackets className='h-5 w-5 text-black' />}
      />

      <div className='rounded-2xl border border-white/10 bg-[#1a1a1a] shadow-xl'>
        <div className='flex flex-col gap-3 border-b border-white/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between'>
          <ActivityTypeActionButtons />
          <SearchPanel
            search={search}
            setSearch={setSearch}
            placeholder='Buscar tipos de actividades...'
          />
        </div>

        <TablePanel columns={columns} data={paginated}>
          {(row) => (
            <ActivityTypeTableButtons
              row={row as ActivityTypes}
              onEdit={handleEditRequest}
              onDelete={handleDeleteRequest}
            />
          )}
        </TablePanel>

        <FooterPanel
          filtered={filtered.length}
          elements={activityTypes.length}
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
        title='Eliminar tipo de actividad'
        description={rowToDelete?.name as string}
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
        title='Editar Tipo de Actividad'
        description='Edita los campos del tipo de actividad.'
        icon={<Brackets className='h-4 w-4 text-black' />}
      />

      <Toaster position='bottom-right' richColors theme='dark' />
    </>
  );
};

export default ActivityType;
