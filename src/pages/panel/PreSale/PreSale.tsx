import { useEffect, useState } from 'react';
import { useClientPagination } from '@/hooks/useClientPagination';
import { useCrudPanel } from '@/hooks/useCrudPanel';
import { useDisclosure } from '@/hooks/useDisclosure';

import { ChartSpline, BookMarked } from 'lucide-react';

import LoadingControl from '@/components/LoadingControl';
import CrudPanelLayout from '../components/CrudPanelLayout';

import { usePreSaleStore } from '@/store/usePreSaleStore';
import type { PreSales } from '@/types/preSales.types';
import { type PreSaleForm, emptyForm } from './preSale.types';

import PreSaleActionButtons from './PreSaleActionButtons';
import PreSaleTableButtons from './PreSaleTableButtons';

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

import { toast } from 'sonner';

type Row = Record<string, unknown>;
type PreSaleUpdatePayload = Pick<PreSaleForm, 'name' | 'start_date' | 'end_date'>;

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

  // --- Modal Booking Mode ---
  const booking = useDisclosure<PreSales>();
  const [togglingBooking, setTogglingBooking] = useState(false);

  const columns = getPreSaleColumns();

  useEffect(() => {
    fetchPreSales();
  }, [fetchPreSales]);

  const filtered = preSales.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()),
  );
  const pagination = useClientPagination(filtered);

  const crud = useCrudPanel<PreSales, PreSaleForm, PreSaleUpdatePayload>({
    items: preSales,
    remove: removePreSale,
    update: updatePreSale,
    emptyForm,
    fields,
    mapToForm: (p) => ({
      name: p.name,
      start_date: p.start_date,
      end_date: p.end_date,
    }),
    toPayload: (f) => ({
      name: f.name,
      start_date: f.start_date,
      end_date: f.end_date,
    }),
    messages: {
      deleteSuccess: 'Preventa eliminada correctamente.',
      deleteError: 'Error al eliminar la preventa. Intenta nuevamente.',
      editSuccess: 'Preventa actualizada correctamente.',
      editError: 'Error al actualizar la preventa. Intenta nuevamente.',
    },
  });

  const handleToggleBookingRequest = (row: Row) => {
    const original = preSales.find((d) => d.id === (row.id as number));
    if (original) booking.show(original);
  };

  const handleToggleBookingConfirm = async () => {
    if (!booking.data) return;
    setTogglingBooking(true);
    try {
      await toggleBookingMode(booking.data.id, !booking.data.booking_mode);
      toast.success(
        !booking.data.booking_mode
          ? 'Modo reserva activado.'
          : 'Modo reserva desactivado.',
      );
      booking.hide();
    } catch {
      toast.error('Error al cambiar el modo de reserva. Intenta nuevamente.');
    } finally {
      setTogglingBooking(false);
    }
  };

  if (loading) return <LoadingControl />;
  if (error) return <p className='text-red-400 p-8'>{error}</p>;

  return (
    <CrudPanelLayout
      description='Gestión de Preventas'
      icon={<ChartSpline className='h-5 w-5 text-black' />}
      toolbar={<PreSaleActionButtons />}
      search={search}
      setSearch={setSearch}
      searchPlaceholder='Buscar preventas...'
      columns={columns}
      data={pagination.paginated}
      renderRowActions={(row) => (
        <PreSaleTableButtons
          row={row as PreSales}
          onEdit={crud.onEdit}
          onDelete={crud.onDelete}
          onToggleBookingMode={handleToggleBookingRequest}
        />
      )}
      filtered={filtered.length}
      total={preSales.length}
      pagination={pagination}
      deleteModal={crud.deleteModal}
      deleteTitle='Eliminar preventa'
      editModal={crud.editModal}
      editTitle='Editar Preventa'
      editDescription='Edita los campos de la preventa.'
      editIcon={<ChartSpline className='h-4 w-4 text-black' />}
      editFields={fields}
    >
      {/* Modal Confirmar Booking Mode */}
      <Dialog
        open={booking.open}
        onOpenChange={(val) => {
          if (!val) booking.hide();
        }}
      >
        <DialogContent className='bg-[#1a1a1a] border border-white/10 text-slate-200 sm:max-w-sm'>
          <DialogHeader>
            <div className='flex items-center gap-3 mb-1'>
              <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20'>
                <BookMarked className='h-4 w-4 text-amber-400' />
              </div>
              <DialogTitle className='text-slate-100 text-lg font-semibold'>
                {booking.data?.booking_mode
                  ? 'Desactivar modo reserva'
                  : 'Activar modo reserva'}
              </DialogTitle>
            </div>
            <p className='text-sm text-slate-400 pl-12'>
              {booking.data?.booking_mode
                ? 'Las nuevas inscripciones se procesarán directamente, sin aprobación manual.'
                : 'Las nuevas inscripciones quedarán en estado reserva hasta ser aprobadas manualmente.'}
            </p>
          </DialogHeader>
          <DialogFooter className='gap-2 pt-2'>
            <Button
              variant='outline'
              size='sm'
              className='border-white/10 bg-transparent text-slate-400 hover:bg-white/5 hover:text-white transition'
              onClick={booking.hide}
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
    </CrudPanelLayout>
  );
};

export default PreSale;
