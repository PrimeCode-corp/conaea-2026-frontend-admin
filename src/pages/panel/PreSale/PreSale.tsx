import { useEffect, useState } from 'react';

import { ChartSpline } from 'lucide-react';

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

  const handleToggleBookingMode = async (row: Row) => {
    const original = preSales.find((d) => d.id === (row.id as number));
    if (!original) return;
    try {
      await toggleBookingMode(original.id, !original.booking_mode);
      toast.success(
        !original.booking_mode
          ? 'Modo reserva activado.'
          : 'Modo reserva desactivado.',
      );
    } catch {
      toast.error('Error al cambiar el modo de reserva. Intenta nuevamente.');
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

        <TablePanel columns={columns} data={filtered}>
          {(row) => (
            <PreSaleTableButtons
              row={row as PreSales}
              onEdit={handleEditRequest}
              onDelete={handleDeleteRequest}
              onToggleBookingMode={handleToggleBookingMode}
            />
          )}
        </TablePanel>

        <FooterPanel filtered={filtered.length} elements={preSales.length} />
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

      <Toaster position='bottom-right' richColors theme='dark' />
    </>
  );
};

export default PreSale;
