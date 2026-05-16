import { useEffect, useRef, useState } from 'react';
import { useClientPagination } from '@/hooks/useClientPagination';

import { Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

import HeaderPanel from '../components/HeaderPanel';
import TablePanel from '../components/TablePanel';
import FooterPanel from '../components/FooterPanel';
import SearchPanel from '../components/SearchPanel';
import LoadingControl from '@/components/LoadingControl';

import { useIndividualCupStore } from '@/store/useIndividualCupStore';
import { usePreSaleStore } from '@/store/usePreSaleStore';

import type { IndividualCup } from '@/types/individualCups.types';
import {
  type IndividualCupForm,
  type FormErrors,
  type IndividualCupPayload,
  emptyForm,
} from './individualCup.types';

import IndividualCupActionButtons from './IndividualCupActionButtons';
import IndividualCupTableButtons from './IndividualCupTableButtons';
import IndividualCupFilters from './IndividualCupFilters';

import ModalDelete from '../components/modals/ModalDelete';
import ModalForm from '../components/modals/ModalForm';

import { getIndividualCupColumns } from './columns';
import { getIndividualCupFields } from './fields';
import { validate } from '@/utils/validations';

import { Toaster, toast } from 'sonner';

type Row = Record<string, unknown>;

const formToPayload = (form: IndividualCupForm): IndividualCupPayload => ({
  pre_sale: Number(form.pre_sale),
  partner_university: Number(form.partner_university),
  currency: Number(form.currency),
});

const IndividualCupPage = () => {
  const {
    individualCups,
    universities,
    preSales,
    quotaTypes,
    fetchIndividualCups,
    removeIndividualCup,
    updateIndividualCup,
    loading,
    error,
  } = useIndividualCupStore();

  const [search, setSearch] = useState('');
  const [selectedPreSaleId, setSelectedPreSaleId] = useState<
    number | undefined
  >(undefined);
  const [selectedQuotaTypeId, setSelectedQuotaTypeId] = useState<
    number | undefined
  >(undefined);

  const [enablingBookingMode, setEnablingBookingMode] = useState(false);

  const handleEnableBookingMode = async () => {
    if (!selectedPreSaleId) return;
    setEnablingBookingMode(true);
    try {
      await toggleBookingMode(selectedPreSaleId, true);
      toast.success('Cupos individuales activados.');
    } catch {
      toast.error('Error al activar los cupos individuales.');
    } finally {
      setEnablingBookingMode(false);
    }
  };

  // --- Modal Eliminar ---
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState(false);

  // --- Modal Editar ---
  const [editOpen, setEditOpen] = useState(false);
  const [rowToEdit, setRowToEdit] = useState<IndividualCup | null>(null);
  const [editForm, setEditForm] = useState<IndividualCupForm>(emptyForm);
  const [editErrors, setEditErrors] = useState<FormErrors>({});
  const [editLoading, setEditLoading] = useState(false);

  const {
    preSales: allPreSales,
    fetchPreSales,
    toggleBookingMode,
  } = usePreSaleStore();

  const initializedRef = useRef(false);

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchIndividualCups(), fetchPreSales()]);
      const { preSales, quotaTypes } = useIndividualCupStore.getState();
      const def = preSales.find((p) => p.is_default);
      if (def) setSelectedPreSaleId(def.id);
      const nacional = quotaTypes.find((q) => q.name === 'Nacional');
      if (nacional) setSelectedQuotaTypeId(nacional.id);
      initializedRef.current = true;
    };
    init();
  }, []);

  useEffect(() => {
    if (editOpen && rowToEdit) {
      setEditForm({
        pre_sale: rowToEdit.pre_sale.id.toString(),
        partner_university: rowToEdit.partner_university.id.toString(),
        currency: rowToEdit.currency.toString(),
      });
      setEditErrors({});
    }
  }, [editOpen, rowToEdit]);

  const columns = getIndividualCupColumns(quotaTypes);
  const fields = getIndividualCupFields(preSales, universities);

  const editTotalAmount = rowToEdit?.total_amount ?? 0;
  const editUsedReserved = rowToEdit?.used ?? 0;

  // Suma de 'used' de todos los individual cups del mismo (pre_sale, quota_type)
  const totalUsedReserved = rowToEdit
    ? individualCups
        .filter(
          (c) =>
            c.pre_sale.id === rowToEdit.pre_sale.id &&
            c.partner_university.quota_type ===
              rowToEdit.partner_university.quota_type,
        )
        .reduce((s, c) => s + (c.used ?? 0), 0)
    : 0;
  const editUsedDirect = (rowToEdit?.used_total ?? 0) - totalUsedReserved;

  const otherReserved = rowToEdit
    ? individualCups
        .filter(
          (c) =>
            c.id !== rowToEdit.id &&
            c.pre_sale.id === rowToEdit.pre_sale.id &&
            c.partner_university.quota_type ===
              rowToEdit.partner_university.quota_type,
        )
        .reduce((s, c) => s + c.currency, 0)
    : 0;

  const editFields = fields.map((f) =>
    f.id !== 'currency'
      ? f
      : {
          ...f,
          hint: (form: Record<string, unknown>) => {
            const currency = Number(form.currency) || 0;
            const direct = editTotalAmount - (otherReserved + currency);
            const isInvalid =
              currency < editUsedReserved || direct < editUsedDirect;
            return (
              <span className='text-xs text-slate-500'>
                N. Directo ={' '}
                <span className='text-slate-400'>{editTotalAmount}</span>
                {' − '}
                <span className='text-slate-400'>
                  ({otherReserved} + {currency})
                </span>
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

  const filtered = individualCups.filter((c) => {
    const matchSearch =
      c.partner_university.name.toLowerCase().includes(search.toLowerCase()) ||
      c.pre_sale.name.toLowerCase().includes(search.toLowerCase()) ||
      c.partner_university.abbreviation
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchPreSale = selectedPreSaleId
      ? c.pre_sale.id === selectedPreSaleId
      : true;
    const matchQuotaType = selectedQuotaTypeId
      ? c.partner_university.quota_type === selectedQuotaTypeId
      : true;
    return matchSearch && matchPreSale && matchQuotaType;
  });

  const totalCurrency = filtered.reduce((s, c) => s + c.currency, 0);
  const totalUsed = filtered.reduce((s, c) => s + (c.used ?? 0), 0);

  // total_amount y used_total son iguales para todas las filas del mismo (pre_sale, quota_type)
  // — se deduplicam para no contar doble
  const seenCategories = new Set<string>();
  let totalAmount = 0;
  let totalUsedTotal = 0;
  for (const c of filtered) {
    const key = `${c.pre_sale.id}-${c.partner_university.quota_type}`;
    if (!seenCategories.has(key)) {
      seenCategories.add(key);
      totalAmount += c.total_amount ?? 0;
      totalUsedTotal += c.used_total ?? 0;
    }
  }
  const totalDirect = totalAmount - totalCurrency;
  const totalUsedDirect = totalUsedTotal - totalUsed;

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

  const handleEditRequest = (row: Row) => {
    const original = individualCups.find((c) => c.id === (row.id as number));
    if (original) {
      setRowToEdit(original);
      setEditOpen(true);
    }
  };

  const handleDeleteRequest = (row: Row) => {
    setRowToDelete(row);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!rowToDelete) return;
    setDeleting(true);
    try {
      await removeIndividualCup(rowToDelete.id as number);
      toast.success('Cupo individual eliminado correctamente.');
      setConfirmOpen(false);
      setRowToDelete(null);
    } catch {
      toast.error('Error al eliminar el cupo individual. Intenta nuevamente.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setConfirmOpen(false);
    setRowToDelete(null);
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

  const handleEditSelectChange = (id: string, value: string) => {
    setEditForm((prev) => ({ ...prev, [id]: value }));
    setEditErrors((prev) => ({ ...prev, [id]: undefined }));
  };

  const handleEditSubmit = async () => {
    if (!rowToEdit) return;
    if (!validate(editForm, editFields, setEditErrors)) return;
    setEditLoading(true);
    try {
      await updateIndividualCup(rowToEdit.id, formToPayload(editForm));
      toast.success('Cupo individual actualizado correctamente.');
      handleEditOpen(false);
    } catch (err: unknown) {
      const data = (err as { response?: { data?: Record<string, string> } })
        ?.response?.data;
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
      toast.error(
        'Error al actualizar el cupo individual. Intenta nuevamente.',
      );
    } finally {
      setEditLoading(false);
    }
  };

  const isBookingMode = selectedPreSaleId
    ? (allPreSales.find((p) => p.id === selectedPreSaleId)?.booking_mode ??
      true)
    : true;

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
        description='Gestión de Cupos Individuales'
        icon={<Trophy className='h-5 w-5 text-black' />}
        actions={
          <div className='flex items-center gap-6 rounded-xl border border-white/10 bg-[#1a1a1a] px-5 py-2.5'>
            <SlotIndicator
              label='Reserva'
              max={totalCurrency}
              used={totalUsed}
            />
            <div className='w-px h-8 bg-white/10' />
            <SlotIndicator
              label='Directo'
              max={totalDirect}
              used={totalUsedDirect}
            />
            <div className='w-px h-8 bg-white/10' />
            <SlotIndicator
              label='Cantidad'
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
            <div className={!isBookingMode ? 'opacity-40 pointer-events-none select-none' : ''}>
              <IndividualCupActionButtons
                selectedPreSaleId={selectedPreSaleId}
                selectedQuotaTypeId={selectedQuotaTypeId}
              />
            </div>
            <IndividualCupFilters
              selectedPreSaleId={selectedPreSaleId}
              selectedQuotaTypeId={selectedQuotaTypeId}
              onPreSaleChange={setSelectedPreSaleId}
              onQuotaTypeChange={setSelectedQuotaTypeId}
              disabled={!isBookingMode}
            />
          </div>
          <div className={!isBookingMode ? 'opacity-40 pointer-events-none select-none' : ''}>
            <SearchPanel
              search={search}
              setSearch={setSearch}
              placeholder='Buscar por universidad...'
            />
          </div>
        </div>

        <div className='relative'>
          {!isBookingMode && selectedPreSaleId && (
            <div className='absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/60 backdrop-blur-[2px]'>
              <p className='text-sm font-medium text-slate-300'>
                Los cupos individuales están deshabilitados
              </p>
              <Button
                size='sm'
                className='bg-[#fbba0e] text-black font-semibold hover:bg-[#fbba0e]/90 transition'
                onClick={handleEnableBookingMode}
                disabled={enablingBookingMode}
              >
                {enablingBookingMode ? 'Activando...' : 'Activar cupos individuales'}
              </Button>
            </div>
          )}
          <div className={!isBookingMode ? 'opacity-40 pointer-events-none select-none' : ''}>
            <TablePanel columns={columns} data={paginated}>
              {(row) => (
                <IndividualCupTableButtons
                  row={row as IndividualCup}
                  onEdit={handleEditRequest}
                  onDelete={handleDeleteRequest}
                />
              )}
            </TablePanel>

            <FooterPanel
              filtered={filtered.length}
              elements={individualCups.length}
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
        </div>
      </div>

      <ModalDelete
        open={confirmOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title='Eliminar cupo individual'
        description={
          rowToDelete
            ? `${(rowToDelete.partner_university as { name: string })?.name} — ${(rowToDelete.pre_sale as { name: string })?.name}`
            : ''
        }
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
        title='Editar Cupo Individual'
        description='Modifica el límite de inscripciones para esta universidad.'
        icon={<Trophy className='h-4 w-4 text-black' />}
        onValueChange={handleEditSelectChange}
      />

      <Toaster position='bottom-right' richColors theme='dark' />
    </>
  );
};

export default IndividualCupPage;
