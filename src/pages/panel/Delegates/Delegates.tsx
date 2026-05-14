import { useEffect, useState } from 'react';
import { Contact } from 'lucide-react';
import { toast, Toaster } from 'sonner';

import HeaderPanel from '../components/HeaderPanel';
import TablePanel from '../components/TablePanel';
import SearchPanel from '../components/SearchPanel';
import ModalDelete from '../components/modals/ModalDelete';
import ModalForm from '../components/modals/ModalForm';

import { useDelegateStore } from '@/store/useDelegateStore';
import { getDelegateFields } from './fields';
import { validate } from '@/utils/validations';
import { columns } from './columns';
import { emptyForm } from './delegate.types';
import type { DelegateForm, FormErrors } from './delegate.types';
import type { Delegate, DelegatePayload } from '@/types/delegates.types';

import DelegatesActionButtons from './DelegatesActionButtons';
import DelegatesTableButtons from './DelegatesTableButtons';
import DelegatesFilters from './DelegatesFilters';

type Row = Record<string, unknown>;

const formToPayload = (form: DelegateForm): DelegatePayload => ({
  fullname: form.fullname,
  type_delegate: form.type_delegate as 'Titular' | 'Alterno',
  cellphone: form.cellphone,
  partner_university: Number(form.partner_university),
});

const Delegates = () => {
  const {
    delegates,
    universities,
    loading,
    error,
    fetchDelegates,
    updateDelegate,
    removeDelegate,
    meta,
    page,
  } = useDelegateStore();

  const [search, setSearch] = useState('');

  // --- Modal Eliminar ---
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState(false);

  // --- Modal Editar ---
  const [editOpen, setEditOpen] = useState(false);
  const [rowToEdit, setRowToEdit] = useState<Delegate | null>(null);
  const [editForm, setEditForm] = useState<DelegateForm>(emptyForm);
  const [editErrors, setEditErrors] = useState<FormErrors>({});
  const [editLoading, setEditLoading] = useState(false);

  // --- Filtros ---
  const [selectedUniversityId, setSelectedUniversityId] = useState<
    number | undefined
  >(undefined);

  const fields = getDelegateFields(universities);

  useEffect(() => {
    const t = setTimeout(
      () => {
        fetchDelegates(1, {
          search: search || undefined,
          partner_university_id: selectedUniversityId,
        });
      },
      search ? 400 : 0,
    );
    return () => clearTimeout(t);
  }, [search, selectedUniversityId]);

  useEffect(() => {
    if (editOpen && rowToEdit) {
      setEditForm({
        fullname: rowToEdit.fullname,
        type_delegate: rowToEdit.type_delegate,
        cellphone: rowToEdit.cellphone,
        partner_university: rowToEdit.partner_university.id.toString(),
      });
      setEditErrors({});
    }
  }, [editOpen, rowToEdit]);

  const handleEditRequest = (row: Row) => {
    const original = delegates.find((d) => d.id === (row.id as number));
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
      await removeDelegate(rowToDelete.id as number);
      toast.success('Delegado eliminado correctamente.');
      setConfirmOpen(false);
      setRowToDelete(null);
      fetchDelegates(1, {
        search: search || undefined,
        partner_university_id: selectedUniversityId,
      });
    } catch {
      toast.error('Error al eliminar el delegado. Intenta nuevamente.');
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
    if (!validate(editForm, fields, setEditErrors)) return;
    setEditLoading(true);
    try {
      await updateDelegate(rowToEdit.id, formToPayload(editForm));
      toast.success('Delegado actualizado correctamente.');
      handleEditOpen(false);
      fetchDelegates(page, {
        search: search || undefined,
        partner_university_id: selectedUniversityId,
      });
    } catch {
      toast.error('Error al actualizar el delegado. Intenta nuevamente.');
    } finally {
      setEditLoading(false);
    }
  };

  if (error) return <p className='text-red-400 p-8'>{error}</p>;

  return (
    <>
      <HeaderPanel
        title='Panel de Control'
        description='Gestión de Delegados'
        icon={<Contact className='h-5 w-5 text-black' />}
      />

      <div className='rounded-2xl border border-white/10 bg-[#1a1a1a] shadow-xl'>
        <div className='flex flex-col gap-3 border-b border-white/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex flex-wrap items-center gap-2'>
            <DelegatesActionButtons
              onCreated={() =>
                fetchDelegates(1, {
                  search: search || undefined,
                  partner_university_id: selectedUniversityId,
                })
              }
            />
            <DelegatesFilters
              selectedUniversityId={selectedUniversityId}
              onUniversityChange={setSelectedUniversityId}
            />
          </div>
          <SearchPanel
            search={search}
            setSearch={setSearch}
            placeholder='Buscar delegado o universidad...'
          />
        </div>

        <TablePanel
          columns={columns}
          data={delegates}
          loading={loading}
          pagination={
            meta
              ? {
                  count: meta.count,
                  next: meta.next,
                  previous: meta.previous,
                  page,
                  onPageChange: (p) =>
                    fetchDelegates(p, {
                      search: search || undefined,
                      partner_university_id: selectedUniversityId,
                    }),
                  pageSize: 10,
                }
              : undefined
          }
        >
          {(row) => (
            <DelegatesTableButtons
              row={row as Delegate}
              onEdit={handleEditRequest}
              onDelete={handleDeleteRequest}
            />
          )}
        </TablePanel>
      </div>

      <ModalDelete
        open={confirmOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title='Eliminar delegado'
        description={rowToDelete?.fullname as string}
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
        title='Editar Delegado'
        description='Edita los campos del delegado.'
        icon={<Contact className='h-4 w-4 text-black' />}
        onValueChange={handleEditSelectChange}
      />

      <Toaster position='bottom-right' richColors theme='dark' />
    </>
  );
};

export default Delegates;
