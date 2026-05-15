import { useEffect, useState } from 'react';
import { useClientPagination } from '@/hooks/useClientPagination';

import { ChartSpline, BookMarked } from 'lucide-react';

import HeaderPanel from '../components/HeaderPanel';
import TablePanel from '../components/TablePanel';
import FooterPanel from '../components/FooterPanel';
import SearchPanel from '../components/SearchPanel';
import LoadingControl from '@/components/LoadingControl';

import { usePreSaleStore } from '@/store/usePreSaleStore';
import type { PreSales } from '@/types/preSales.types';
import { type PreSaleForm, type FormErrors, emptyForm } from './preSale.types';

import PreSaleActionButtons from './PreSaleActionButtons';
import PreSaleTableButtons from './PreSaleTableButtons';

import ModalDelete from '../components/modals/ModalDelete';
import ModalForm from '../components/modals/ModalForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import { getPreSaleColumns } from './columns';
import { fields } from './fields';
import { validate } from '@/utils/validations';

import { Toaster } from 'sonner'; // 👈 agregar
import { toast } from 'sonner';
import { isAxiosError } from 'axios';

type Row = Record<string, unknown>;

const PreSale = () => {
  const {
    preSales,
    loading,
    error,
    fetchPreSales,
    removePreSale,
    updatePreSale,
    toggleBookingMode,
  } = usePreSaleStore();
  const [search, setSearch] = useState('');

  // --- Modal Eliminar ---
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState(false);

  // --- Modal Booking Mode ---
  const [bookingConfirmOpen, setBookingConfirmOpen] = useState(false);
  const [rowToToggle, setRowToToggle] = useState<PreSales | null>(null);
  const [togglingBooking, setTogglingBooking] = useState(false);

  // --- Modal Editar (el padre controla qué fila se edita) ---
  const [editOpen, setEditOpen] = useState(false);
  const [rowToEdit, setRowToEdit] = useState<PreSales | null>(null);
  const [editForm, setEditForm] = useState<PreSaleForm>(emptyForm);
  const [editErrors, setEditErrors] = useState<FormErrors>({});
  const [editLoading, setEditLoading] = useState(false);

  const columns = getPreSaleColumns();

  useEffect(() => {
    fetchPreSales();
  }, []);

  useEffect(() => {
    if (editOpen && rowToEdit) {
      setEditForm({
        name: rowToEdit.name,
        start_date: rowToEdit.start_date,
        end_date: rowToEdit.end_date,
      });
      setEditErrors({});
    }
  }, [editOpen, rowToEdit]);

  const filtered = preSales.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()),
  );
  const { page, totalPages, paginated, pageSize, hasPrev, hasNext, goNext, goPrev, goTo } =
    useClientPagination(filtered);

  // Abre el modal de editar con la fila seleccionada
  const handleEditRequest = (row: Row) => {
    const original = preSales.find((d) => d.id === (row.id as number));
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
      await removePreSale(rowToDelete.id as number);
      toast.success('Preventa eliminada correctamente.');
      setConfirmOpen(false);
      setRowToDelete(null);
    } catch {
      toast.error('Error al eliminar la preventa. Intenta nuevamente.');
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
      await updatePreSale(rowToEdit.id, {
        name: editForm.name,
        start_date: editForm.start_date,
        end_date: editForm.end_date,
      });
      toast.success('Preventa actualizada correctamente.'); // 👈
      handleEditOpen(false);
    } catch (err) {
      const msg =
        isAxiosError(err) && err.response?.data?.non_field_errors?.[0]
          ? err.response.data.non_field_errors[0]
          : 'Error al actualizar la preventa. Intenta nuevamente.';
      toast.error(msg);
    } finally {
      setEditLoading(false);
    }
  };

  const handleToggleBookingRequest = (row: Row) => {
    const original = preSales.find((d) => d.id === (row.id as number));
    if (!original) return;
    setRowToToggle(original);
    setBookingConfirmOpen(true);
  };

  const handleToggleBookingConfirm = async () => {
    if (!rowToToggle) return;
    setTogglingBooking(true);
    try {
      await toggleBookingMode(rowToToggle.id, !rowToToggle.booking_mode);
      toast.success(
        !rowToToggle.booking_mode
          ? 'Modo reserva activado.'
          : 'Modo reserva desactivado.',
      );
      setBookingConfirmOpen(false);
      setRowToToggle(null);
    } catch {
      toast.error('Error al cambiar el modo de reserva. Intenta nuevamente.');
    } finally {
      setTogglingBooking(false);
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
        description='Gestión de Preventas'
        icon={<ChartSpline className='h-5 w-5 text-black' />}
      />

      <div className='rounded-2xl border border-white/10 bg-[#1a1a1a] shadow-xl'>
        <div className='flex flex-col gap-3 border-b border-white/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between'>
          <PreSaleActionButtons />
          <SearchPanel
            search={search}
            setSearch={setSearch}
            placeholder='Buscar días...'
          />
        </div>

        <TablePanel columns={columns} data={paginated}>
          {(row) => (
            <PreSaleTableButtons
              row={row as PreSales}
              onEdit={handleEditRequest}
              onDelete={handleDeleteRequest}
              onToggleBookingMode={handleToggleBookingRequest}
            />
          )}
        </TablePanel>

        <FooterPanel
          filtered={filtered.length}
          elements={preSales.length}
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
        title='Editar Preventa'
        description='Edita los campos de la preventa.'
        icon={<ChartSpline className='h-4 w-4 text-black' />}
      />

      {/* Modal Confirmar Booking Mode */}
      <Dialog
        open={bookingConfirmOpen}
        onOpenChange={(val) => {
          if (!val) {
            setBookingConfirmOpen(false);
            setRowToToggle(null);
          }
        }}
      >
        <DialogContent className='bg-[#1a1a1a] border border-white/10 text-slate-200 sm:max-w-sm'>
          <DialogHeader>
            <div className='flex items-center gap-3 mb-1'>
              <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20'>
                <BookMarked className='h-4 w-4 text-amber-400' />
              </div>
              <DialogTitle className='text-slate-100 text-lg font-semibold'>
                {rowToToggle?.booking_mode
                  ? 'Desactivar modo reserva'
                  : 'Activar modo reserva'}
              </DialogTitle>
            </div>
            <p className='text-sm text-slate-400 pl-12'>
              {rowToToggle?.booking_mode
                ? 'Las nuevas inscripciones se procesarán directamente, sin aprobación manual.'
                : 'Las nuevas inscripciones quedarán en estado reserva hasta ser aprobadas manualmente.'}
            </p>
          </DialogHeader>
          <DialogFooter className='gap-2 pt-2'>
            <Button
              variant='outline'
              size='sm'
              className='border-white/10 bg-transparent text-slate-400 hover:bg-white/5 hover:text-white transition'
              onClick={() => {
                setBookingConfirmOpen(false);
                setRowToToggle(null);
              }}
              disabled={togglingBooking}
            >
              Cancelar
            </Button>
            <Button
              size='sm'
              className='bg-amber-500 text-black font-semibold hover:bg-amber-400 transition min-w-24'
              onClick={handleToggleBookingConfirm}
              disabled={togglingBooking}
            >
              {togglingBooking ? 'Guardando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster position='bottom-right' richColors theme='dark' />
    </>
  );
};

export default PreSale;
