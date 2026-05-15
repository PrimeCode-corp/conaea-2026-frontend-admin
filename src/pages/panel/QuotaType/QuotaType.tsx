import { useEffect, useState } from 'react';
import { useClientPagination } from '@/hooks/useClientPagination';

import { DollarSign } from 'lucide-react';

import HeaderPanel from '../components/HeaderPanel';
import TablePanel from '../components/TablePanel';
import FooterPanel from '../components/FooterPanel';
import SearchPanel from '../components/SearchPanel';
import LoadingControl from '@/components/LoadingControl';

import { useQuotaTypeStore } from '@/store/useQuotaTypeStore';
import type { QuotaTypes } from '@/types/quotaTypes.types';
import {
  type QuotaTypeForm,
  type FormErrors,
  emptyForm,
} from './quotaType.types';

import QuotaTypeActionButtons from './QuotaTypeActionButtons';
import QuotaTypeTableButtons from './QuotaTypeTableButtons';

import ModalDelete from '../components/modals/ModalDelete';
import ModalForm from '../components/modals/ModalForm';

import { columns } from './columns';
import { fields } from './fields';
import { validate } from '@/utils/validations';

import { Toaster } from 'sonner'; // 👈 agregar
import { toast } from 'sonner';

type Row = Record<string, unknown>;

const QuotaType = () => {
  const {
    quotaTypes,
    loading,
    error,
    fetchQuotaTypes,
    removeQuotaType,
    updateQuotaType,
  } = useQuotaTypeStore();
  const [search, setSearch] = useState('');

  // --- Modal Eliminar ---
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState(false);

  // --- Modal Editar (el padre controla qué fila se edita) ---
  const [editOpen, setEditOpen] = useState(false);
  const [rowToEdit, setRowToEdit] = useState<QuotaTypes | null>(null);
  const [editForm, setEditForm] = useState<QuotaTypeForm>(emptyForm);
  const [editErrors, setEditErrors] = useState<FormErrors>({});
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchQuotaTypes();
  }, []);

  useEffect(() => {
    if (editOpen && rowToEdit) {
      setEditForm({
        name: rowToEdit.name,
        currency: rowToEdit.currency,
      });
      setEditErrors({});
    }
  }, [editOpen, rowToEdit]);

  const filtered = quotaTypes.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()),
  );
  const { page, totalPages, paginated, pageSize, hasPrev, hasNext, goNext, goPrev, goTo } =
    useClientPagination(filtered);

  // Abre el modal de editar con la fila seleccionada
  const handleEditRequest = (row: Row) => {
    const original = quotaTypes.find((d) => d.id === (row.id as number));
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
      await removeQuotaType(rowToDelete.id as number);
      toast.success('Tipo de cuota eliminado correctamente.');
      setConfirmOpen(false);
      setRowToDelete(null);
    } catch {
      toast.error('Error al eliminar el tipo de cuota. Intenta nuevamente.');
    } finally {
      setDeleting(false); // 👈 siempre se ejecuta, salga bien o mal
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
      await updateQuotaType(rowToEdit.id, {
        name: editForm.name,
        currency: editForm.currency,
      });
      toast.success('Tipo de cuota actualizado correctamente.'); // 👈
      handleEditOpen(false);
    } catch {
      toast.error('Error al actualizar el tipo de cuota. Intenta nuevamente.'); // 👈
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
        description='Gestión de Tipos de Cuota'
        icon={<DollarSign className='h-5 w-5 text-black' />}
      />

      <div className='rounded-2xl border border-white/10 bg-[#1a1a1a] shadow-xl'>
        <div className='flex flex-col gap-3 border-b border-white/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between'>
          <QuotaTypeActionButtons />
          <SearchPanel
            search={search}
            setSearch={setSearch}
            placeholder='Buscar días...'
          />
        </div>

        <TablePanel columns={columns} data={paginated}>
          {(row) => (
            <QuotaTypeTableButtons
              row={row as QuotaTypes}
              onEdit={handleEditRequest}
              onDelete={handleDeleteRequest}
            />
          )}
        </TablePanel>

        <FooterPanel
          filtered={filtered.length}
          elements={quotaTypes.length}
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
        title='Eliminar tipo de cuota'
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
        title='Editar tipo de cuota'
        description='Edita los campos del tipo de cuota.'
        icon={<DollarSign className='h-4 w-4 text-black' />}
      />

      <Toaster position='bottom-right' richColors theme='dark' />
    </>
  );
};

export default QuotaType;
