import { useEffect, useRef, useState } from 'react';
import { useClientPagination } from '@/hooks/useClientPagination';
import { useCrudPanel } from '@/hooks/useCrudPanel';

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
  type AvailableSlotPayload,
  emptyForm,
  formToPayload,
} from './availableSlot.types';

import SlotIndicator from '../components/SlotIndicator';
import AvailableSlotActionButtons from './AvailableActionButtons';
import AvailableSlotTableButtons from './AvailableSlotTableButtons';

import ModalDelete from '../components/modals/ModalDelete';
import ModalForm from '../components/modals/ModalForm';
import AvailableSlotFilters from './AvailableSlotFilters';

import { columns } from './columns';
import { getAvailableSlotFields } from './fields';

import { Toaster } from 'sonner';

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
  }, [fetchAvailableSlots, fetchPreSales]);

  const fields = getAvailableSlotFields(preSales, quotaTypes);

  const crud = useCrudPanel<
    AvailableSlotDetail,
    AvailableSlotForm,
    AvailableSlotPayload
  >({
    items: availableSlots,
    remove: removeAvailableSlot,
    update: updateAvailableSlot,
    getRowLabel: (row) => (row.pre_sale as { name?: string })?.name,
    emptyForm,
    fields,
    // Añade el hint dinámico al campo 'amount' según la fila en edición.
    getEditFields: (item) => {
      const reserved = item.reserved ?? 0;
      const usedDirect = (item.used_total ?? 0) - (item.used_reserved ?? 0);
      const editBookingMode = item.pre_sale.booking_mode ?? false;
      return fields.map((f) =>
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
                    <span
                      className={
                        isInvalid
                          ? 'text-red-400 font-medium'
                          : 'text-slate-200 font-medium'
                      }
                    >
                      {direct}
                    </span>
                  </span>
                );
              },
            },
      );
    },
    mapToForm: (s) => ({
      pre_sale: s.pre_sale.id.toString(),
      quota_type: s.quota_type.id.toString(),
      mount: s.mount.toString(),
      amount: s.amount.toString(),
    }),
    toPayload: formToPayload,
    fieldErrors: true,
    messages: {
      deleteSuccess: 'Cupo eliminado correctamente.',
      deleteError: 'Error al eliminar el cupo. Intenta nuevamente.',
      editSuccess: 'Cupo actualizado correctamente.',
      editError: 'Error al actualizar el cupo. Intenta nuevamente.',
    },
  });

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
              onEdit={crud.onEdit}
              onDelete={crud.onDelete}
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
        open={crud.deleteModal.open}
        onClose={crud.deleteModal.onClose}
        onConfirm={crud.deleteModal.onConfirm}
        loading={crud.deleteModal.loading}
        title='Eliminar cupo'
        description={crud.deleteModal.description}
      />

      <ModalForm
        mode='edit'
        open={crud.editModal.open}
        onOpenChange={crud.editModal.onOpenChange}
        fields={crud.editFields}
        form={crud.editModal.form}
        errors={crud.editModal.errors}
        onChange={crud.editModal.onChange}
        onSubmit={crud.editModal.onSubmit}
        loading={crud.editModal.loading}
        title='Editar Cupo'
        description='Edita los campos del cupo.'
        icon={<University className='h-4 w-4 text-black' />}
        onValueChange={crud.editModal.onValueChange}
      />

      <Toaster position='bottom-right' richColors theme='dark' />
    </>
  );
};

export default AvailableSlot;
