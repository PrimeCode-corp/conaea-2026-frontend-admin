import { useEffect, useState } from 'react';
import { useClientPagination } from '@/hooks/useClientPagination';

import { University } from 'lucide-react';

import HeaderPanel from '../components/HeaderPanel';
import TablePanel from '../components/TablePanel';
import FooterPanel from '../components/FooterPanel';
import SearchPanel from '../components/SearchPanel';
import LoadingControl from '@/components/LoadingControl';

import { useAvailableSlotStore } from '@/store/useAvailableSlotStore';
import { usePreSaleStore } from '@/store/usePreSaleStore';
import { useQuotaTypeStore } from '@/store/useQuotaTypeStore';

import type {
  AvailableSlots,
  AvailableSlotDetail,
} from '@/types/availableSlots.types';
import {
  type AvailableSlotForm,
  type FormErrors,
  type AvailableSlotPayload,
  emptyForm,
} from './availableSlot.types';

import AvailableSlotActionButtons from './AvailableActionButtons';
import AvailableSlotTableButtons from './AvailableSlotTableButtons';

import ModalDelete from '../components/modals/ModalDelete';
import ModalForm from '../components/modals/ModalForm';
import AvailableSlotFilters from './AvailableSlotFilters';

import { columns } from './columns';
import { getAvailableSlotFields } from './fields';
import { validate } from '@/utils/validations';

import { Toaster } from 'sonner'; // 👈 agregar
import { toast } from 'sonner';

type Row = Record<string, unknown>;

const formToPayload = (form: AvailableSlotForm): AvailableSlotPayload => ({
  pre_sale: Number(form.pre_sale),
  quota_type: Number(form.quota_type),
  mount: Number(form.mount),
  amount: Number(form.amount),
});

const AvailableSlot = () => {
  const {
    availableSlots,
    loading,
    error,
    fetchAvailableSlots,
    removeAvailableSlot,
    updateAvailableSlot,
  } = useAvailableSlotStore();

  const { preSales } = usePreSaleStore();

  const { quotaTypes } = useQuotaTypeStore();

  const [search, setSearch] = useState('');

  // --- Modal Eliminar ---
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [rowToDelete, setRowToDelete] = useState<Row | null>(null);

  const [deleting, setDeleting] = useState(false);

  // --- Modal Editar (el padre controla qué fila se edita) ---
  const [editOpen, setEditOpen] = useState(false);

  const [rowToEdit, setRowToEdit] = useState<AvailableSlotDetail | null>(null);

  const [editForm, setEditForm] = useState<AvailableSlotForm>(emptyForm);

  const [editErrors, setEditErrors] = useState<FormErrors>({});

  const [editLoading, setEditLoading] = useState(false);

  // --- Filtros ---
  const [selectedPreSaleId, setSelectedPreSaleId] = useState<
    number | undefined
  >(undefined);

  const [selectedQuotaTypeId, setSelectedQuotaTypeId] = useState<
    number | undefined
  >(undefined);

  useEffect(() => {
    fetchAvailableSlots();
  }, []);

  useEffect(() => {
    if (editOpen && rowToEdit) {
      setEditForm({
        pre_sale: rowToEdit.pre_sale.id.toString(),
        quota_type: rowToEdit.quota_type.id.toString(),
        mount: rowToEdit.mount.toString(),
        amount: rowToEdit.amount.toString(),
      });
      setEditErrors({});
    }
  }, [editOpen, rowToEdit]);

  const fields = getAvailableSlotFields(preSales, quotaTypes);

  const handleEditSelectChange = (id: string, value: string) => {
    setEditForm((prev) => ({ ...prev, [id]: value }));
    setEditErrors((prev) => ({ ...prev, [id]: undefined }));
  };

  // Abre el modal de editar con la fila seleccionada
  const handleEditRequest = (row: Row) => {
    const original = availableSlots.find((d) => d.id === (row.id as number));
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
      await removeAvailableSlot(rowToDelete.id as number);
      toast.success('Cupo eliminado correctamente.');
      setConfirmOpen(false);
      setRowToDelete(null);
    } catch {
      toast.error('Error al eliminar el cupo. Intenta nuevamente.');
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
      await updateAvailableSlot(rowToEdit.id, formToPayload(editForm));
      toast.success('Cupo actualizado correctamente.');
      handleEditOpen(false);
    } catch {
      toast.error('Error al actualizar el cupo. Intenta nuevamente.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setConfirmOpen(false);
    setRowToDelete(null);
  };

  const filtered = availableSlots.filter((d) => {
    const matchSearch = d.pre_sale.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchDay = selectedPreSaleId
      ? d.pre_sale.id === selectedPreSaleId
      : true;
    const matchType = selectedQuotaTypeId
      ? d.quota_type.id === selectedQuotaTypeId
      : true;
    return matchSearch && matchDay && matchType;
  });
  const { page, totalPages, paginated, pageSize, hasPrev, hasNext, goNext, goPrev, goTo } =
    useClientPagination(filtered);

  if (loading) return <LoadingControl />;
  if (error) return <p className='text-red-400 p-8'>{error}</p>;

  return (
    <>
      <HeaderPanel
        title='Panel de Control'
        description='Gestión de Cupos'
        icon={<University className='h-5 w-5 text-black' />}
      />

      <div className='rounded-2xl border border-white/10 bg-[#1a1a1a] shadow-xl'>
        <div className='flex flex-col gap-3 border-b border-white/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex flex-wrap items-center gap-2'>
            <AvailableSlotActionButtons />
            <AvailableSlotFilters
              selectedPreSaleId={selectedPreSaleId}
              selectedQuotaTypeId={selectedQuotaTypeId}
              onPreSaleChange={setSelectedPreSaleId}
              onQuotaTypeChange={setSelectedQuotaTypeId}
            />
          </div>
          <SearchPanel
            search={search}
            setSearch={setSearch}
            placeholder='Buscar cupos...'
          />
        </div>

        <TablePanel columns={columns} data={paginated}>
          {(row) => (
            <AvailableSlotTableButtons
              row={row as AvailableSlots}
              onEdit={handleEditRequest}
              onDelete={handleDeleteRequest}
            />
          )}
        </TablePanel>

        <FooterPanel
          filtered={filtered.length}
          elements={availableSlots.length}
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
        title='Eliminar cupo'
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
        title='Editar Cupo'
        description='Edita los campos del cupo.'
        icon={<University className='h-4 w-4 text-black' />}
        onValueChange={handleEditSelectChange}
      />

      <Toaster position='bottom-right' richColors theme='dark' />
    </>
  );
};

export default AvailableSlot;
