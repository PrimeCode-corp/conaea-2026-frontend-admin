import { useEffect, useRef, useState } from 'react';
import { useClientPagination } from '@/hooks/useClientPagination';

import { University } from 'lucide-react';

import HeaderPanel from '../components/HeaderPanel';
import TablePanel from '../components/TablePanel';
import FooterPanel from '../components/FooterPanel';
import SearchPanel from '../components/SearchPanel';
import LoadingControl from '@/components/LoadingControl';

import { useAvailableSlotStore } from '@/store/useAvailableSlotStore';
import { useQuotaTypeStore } from '@/store/useQuotaTypeStore';
import { usePreSaleStore } from '@/store/usePreSaleStore';

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
    preSales,
    loading,
    error,
    fetchAvailableSlots,
    removeAvailableSlot,
    updateAvailableSlot,
  } = useAvailableSlotStore();

  const { quotaTypes } = useQuotaTypeStore();
  const { preSales: allPreSales, fetchPreSales } = usePreSaleStore();

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

  const initializedRef = useRef(false);

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchAvailableSlots(), fetchPreSales()]);
      const { preSales } = useAvailableSlotStore.getState();
      const def = preSales.find((p) => p.is_default);
      if (def) setSelectedPreSaleId(def.id);
      initializedRef.current = true;
    };
    init();
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

  const reserved        = rowToEdit?.reserved ?? 0;
  const usedDirect      = (rowToEdit?.used_total ?? 0) - (rowToEdit?.used_reserved ?? 0);
  const editBookingMode = rowToEdit?.pre_sale.booking_mode ?? false;
  const editFields = fields.map((f) =>
    f.id !== 'amount' || !editBookingMode
      ? f
      : {
          ...f,
          hint: (form: Record<string, unknown>) => {
            const amount = Number(form.amount) || 0;
            const direct = amount - reserved;
            const isInvalid = direct < usedDirect;
            return (
              <span className='text-xs text-slate-500'>
                N. Directos ={' '}
                <span className='text-slate-400'>{amount}</span>
                {' − '}
                <span className='text-slate-400'>{reserved}</span>
                {' = '}
                <span className={isInvalid ? 'text-red-400 font-medium' : 'text-slate-200 font-medium'}>
                  {direct}
                </span>
              </span>
            );
          },
        },
  );

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
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(detail ?? 'Error al eliminar el cupo. Intenta nuevamente.');
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
    if (!validate(editForm, editFields, setEditErrors)) return;
    setEditLoading(true);
    try {
      await updateAvailableSlot(rowToEdit.id, formToPayload(editForm));
      toast.success('Cupo actualizado correctamente.');
      handleEditOpen(false);
    } catch (err: unknown) {
      const data = (err as { response?: { data?: Record<string, string> } })?.response?.data;
      if (data && typeof data === 'object') {
        const fieldErrors: FormErrors = {};
        for (const [key, msg] of Object.entries(data)) {
          if (key in emptyForm) fieldErrors[key as keyof FormErrors] = msg;
        }
        if (Object.keys(fieldErrors).length > 0) {
          setEditErrors(fieldErrors);
          return;
        }
      }
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
  const {
    page,
    totalPages,
    paginated,
    pageSize,
    hasPrev,
    hasNext,
    goNext,
    goPrev,
    goTo,
  } = useClientPagination(filtered);

  const totalReserved = filtered.reduce((s, c) => s + (c.reserved ?? 0), 0);
  const totalUsedReserved = filtered.reduce(
    (s, c) => s + (c.used_reserved ?? 0),
    0,
  );
  const totalDirect = filtered.reduce(
    (s, c) => s + (c.amount - (c.reserved ?? 0)),
    0,
  );
  const totalUsedDirect = filtered.reduce(
    (s, c) => s + ((c.used_total ?? 0) - (c.used_reserved ?? 0)),
    0,
  );
  const totalAmount = filtered.reduce((s, c) => s + c.amount, 0);
  const totalUsedTotal = filtered.reduce((s, c) => s + (c.used_total ?? 0), 0);

  const selectedPreSale = selectedPreSaleId
    ? allPreSales.find((p) => p.id === selectedPreSaleId)
    : undefined;
  const isBookingMode = selectedPreSale?.booking_mode ?? false;

  const SlotIndicator = ({
    label,
    max,
    used,
    accent = false,
  }: {
    label: string;
    max: number;
    used: number;
    accent?: boolean;
  }) => (
    <div className='flex flex-col items-center gap-1'>
      <span className='text-[10px] font-semibold uppercase tracking-widest text-slate-500'>
        {label}
      </span>
      <div className='flex flex-col items-center gap-0.5'>
        <span
          className={`font-semibold text-sm ${accent ? 'text-[#fbba0e]' : 'text-slate-200'}`}
        >
          {max}
        </span>
        <div
          className={`w-6 h-px ${accent ? 'bg-[#fbba0e]/30' : 'bg-white/20'}`}
        />
        <span
          className={`text-xs ${accent ? 'text-[#fbba0e]/60' : 'text-slate-400'}`}
        >
          {used}
        </span>
      </div>
    </div>
  );

  if (loading) return <LoadingControl />;
  if (error) return <p className='text-red-400 p-8'>{error}</p>;

  return (
    <>
      <HeaderPanel
        title='Panel de Control'
        description='Gestión de Cupos'
        icon={<University className='h-5 w-5 text-black' />}
        actions={
          <div className='flex items-center gap-6 rounded-xl border border-white/10 bg-[#1a1a1a] px-5 py-2.5'>
            {selectedPreSale && (
              <>
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                    isBookingMode
                      ? 'text-purple-400 border-purple-400/30 bg-purple-400/10'
                      : 'text-sky-400 border-sky-400/30 bg-sky-400/10'
                  }`}
                >
                  {isBookingMode ? 'Reserva' : 'Directo'}
                </span>
                <div className='w-px h-8 bg-white/10' />
              </>
            )}
            <SlotIndicator
              label='Reserva'
              max={totalReserved}
              used={totalUsedReserved}
            />
            <div className='w-px h-8 bg-white/10' />
            <SlotIndicator
              label='Directo'
              max={totalDirect}
              used={totalUsedDirect}
            />
            <div className='w-px h-8 bg-white/10' />
            <SlotIndicator
              label='Total'
              max={totalAmount}
              used={totalUsedTotal}
              accent
            />
          </div>
        }
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
        fields={editFields}
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
