import { useEffect, useState } from 'react';
import { useClientPagination } from '@/hooks/useClientPagination';

import { CalendarDays } from 'lucide-react';

import HeaderPanel from '../components/HeaderPanel';
import TablePanel from '../components/TablePanel';
import FooterPanel from '../components/FooterPanel';
import SearchPanel from '../components/SearchPanel';
import LoadingControl from '@/components/LoadingControl';

import { useDayStore } from '@/store/useDayStore';
import type { Days } from '@/types/days.types';
import type { DaysForm, FormErrors } from './days.types';

import DayActionButtons from './DayActionButtons';
import DayTableButtons from './DayTableButtons';

import ModalDelete from '../components/modals/ModalDelete';
import ModalForm from '../components/modals/ModalForm';

import { getDayColumns } from './columns';
import { fields } from './fields';
import { validate } from '@/utils/validations';

import { Toaster } from 'sonner'; // 👈 agregar
import { toast } from 'sonner';

type Row = Record<string, unknown>;

const Day = () => {
  const { days, loading, error, fetchDays, removeDay, updateDay } =
    useDayStore();
  const [search, setSearch] = useState('');

  // --- Modal Eliminar ---
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState(false);

  // --- Modal Editar (el padre controla qué fila se edita) ---
  const [editOpen, setEditOpen] = useState(false);
  const [rowToEdit, setRowToEdit] = useState<Days | null>(null);
  const [editForm, setEditForm] = useState<DaysForm>({
    title: '',
    date: '',
  });
  const [editErrors, setEditErrors] = useState<FormErrors>({});
  const [editLoading, setEditLoading] = useState(false);

  const columns = getDayColumns();

  useEffect(() => {
    fetchDays();
  }, []);

  useEffect(() => {
    if (editOpen && rowToEdit) {
      setEditForm({
        title: rowToEdit.title,
        date: rowToEdit.date,
      });
      setEditErrors({});
    }
  }, [editOpen, rowToEdit]);

  const filtered = days.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase()),
  );
  const { page, totalPages, paginated, pageSize, hasPrev, hasNext, goNext, goPrev, goTo } =
    useClientPagination(filtered);

  // Abre el modal de editar con la fila seleccionada
  const handleEditRequest = (row: Row) => {
    const original = days.find((d) => d.id === (row.id as number));
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
      await removeDay(rowToDelete.id as number);
      toast.success('Día eliminado correctamente.');
      setConfirmOpen(false);
      setRowToDelete(null);
    } catch {
      toast.error(
        'Error al eliminar el tipo de actividad. Intenta nuevamente.',
      );
    } finally {
      setDeleting(false); // 👈 siempre se ejecuta, salga bien o mal
    }
  };

  const handleEditOpen = (val: boolean) => {
    setEditOpen(val);
    if (!val) {
      setEditForm({ title: '', date: '' });
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
      await updateDay(rowToEdit.id, {
        title: editForm.title,
        date: editForm.date,
      });
      toast.success('Día actualizado correctamente.'); // 👈
      handleEditOpen(false);
    } catch {
      toast.error('Error al actualizar el día. Intenta nuevamente.'); // 👈
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
        description='Gestión de Días'
        icon={<CalendarDays className='h-5 w-5 text-black' />}
      />

      <div className='rounded-2xl border border-white/10 bg-[#1a1a1a] shadow-xl'>
        <div className='flex flex-col gap-3 border-b border-white/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between'>
          <DayActionButtons />
          <SearchPanel
            search={search}
            setSearch={setSearch}
            placeholder='Buscar días...'
          />
        </div>

        <TablePanel columns={columns} data={paginated}>
          {(row) => (
            <DayTableButtons
              row={row as Days}
              onEdit={handleEditRequest}
              onDelete={handleDeleteRequest}
            />
          )}
        </TablePanel>

        <FooterPanel
          filtered={filtered.length}
          elements={days.length}
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
        title='Eliminar día'
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
        title='Editar Día'
        description='Edita los campos del día.'
        icon={<CalendarDays className='h-4 w-4 text-black' />}
      />

      <Toaster position='bottom-right' richColors theme='dark' />
    </>
  );
};

export default Day;
