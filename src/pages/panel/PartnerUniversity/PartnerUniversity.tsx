import { useEffect, useState } from 'react';

import { University } from 'lucide-react';

import HeaderPanel from '../components/HeaderPanel';
import TablePanel from '../components/TablePanel';
// import FooterPanel from '../components/FooterPanel';
import SearchPanel from '../components/SearchPanel';

import { usePartnerUniversityStore } from '@/store/usePartnerUniversityStore';

import type {
  PartnerUniversities,
  PartnerUniversityDetail,
} from '@/types/partnerUniversties.types';
import {
  type PartnerUniversityForm,
  type FormErrors,
  type PartnerUniversityPayload,
  emptyForm,
} from './partnerUniversity.types';

import PartnerUniversityActionButtons from './PartnerUniversityActionButtons';
import PartnerUniversityTableButtons from './PartnerUniversityTableButtons';

import ModalDelete from '../components/modals/ModalDelete';
import ModalForm from '../components/modals/ModalForm';
import ModalDelegates from './modals/ModalDelegates';
import PartnerUniversityFilters from './PartnerUniversityFilters';

import { columns } from './columns';
import { getAvailableSlotFields } from './fields';
import { validate } from '@/utils/validations';

import { Toaster } from 'sonner'; // 👈 agregar
import { toast } from 'sonner';

type Row = Record<string, unknown>;

const formToPayload = (
  form: PartnerUniversityForm,
): PartnerUniversityPayload => ({
  quota_type: Number(form.quota_type),
  name: form.name,
  abbreviation: form.abbreviation,
  country: form.country,
  region: form.region,
  place: form.place,
});

const PartnerUniversity = () => {
  const {
    universities,
    quotaTypes,
    loading,
    error,
    fetchUniversities,
    removeUniversity,
    updateUniversity,
    meta,
    page,
  } = usePartnerUniversityStore();

  const [search, setSearch] = useState('');

  // --- Modal Eliminar ---
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [rowToDelete, setRowToDelete] = useState<Row | null>(null);

  const [deleting, setDeleting] = useState(false);

  // --- Modal Editar (el padre controla qué fila se edita) ---
  const [editOpen, setEditOpen] = useState(false);

  const [rowToEdit, setRowToEdit] = useState<PartnerUniversityDetail | null>(
    null,
  );

  const [editForm, setEditForm] = useState<PartnerUniversityForm>(emptyForm);

  const [editErrors, setEditErrors] = useState<FormErrors>({});

  const [editLoading, setEditLoading] = useState(false);

  // --- Modal Delegados ---
  const [delegatesOpen, setDelegatesOpen] = useState(false);
  const [delegatesUniversityId, setDelegatesUniversityId] = useState<number | null>(null);
  const [delegatesUniversityName, setDelegatesUniversityName] = useState('');

  const handleViewDelegates = (row: Row) => {
    setDelegatesUniversityId(row.id as number);
    setDelegatesUniversityName(row.name as string);
    setDelegatesOpen(true);
  };

  // --- Filtros ---
  const [selectedQuotaTypeId, setSelectedQuotaTypeId] = useState<
    number | undefined
  >(undefined);

  useEffect(() => {
    const timeout = setTimeout(
      () => {
        fetchUniversities(1, {
          search: search || undefined,
          quota_type_id: selectedQuotaTypeId,
        });
      },
      search ? 400 : 0,
    ); // 👈 debounce solo si hay texto, inmediato si es filtro

    return () => clearTimeout(timeout);
  }, [search, selectedQuotaTypeId]);

  useEffect(() => {
    if (editOpen && rowToEdit) {
      setEditForm({
        quota_type: rowToEdit.quota_type.id.toString(),
        name: rowToEdit.name,
        abbreviation: rowToEdit.abbreviation,
        country: rowToEdit.country,
        region: rowToEdit.region,
        place: rowToEdit.place,
      });
      setEditErrors({});
    }
  }, [editOpen, rowToEdit]);

  const fields = getAvailableSlotFields(quotaTypes);

  const handleEditSelectChange = (id: string, value: string) => {
    setEditForm((prev) => ({ ...prev, [id]: value }));
    setEditErrors((prev) => ({ ...prev, [id]: undefined }));
  };

  // Abre el modal de editar con la fila seleccionada
  const handleEditRequest = (row: Row) => {
    const original = universities.find((d) => d.id === (row.id as number));
    if (original) {
      setRowToEdit(original);
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
      await removeUniversity(rowToDelete.id as number);
      toast.success('Universidad eliminada correctamente.');
      setConfirmOpen(false);
      setRowToDelete(null);
      fetchUniversities(1, {
        search: search || undefined,
        quota_type_id: selectedQuotaTypeId,
      });
    } catch {
      toast.error('Error al eliminar la universidad. Intenta nuevamente.');
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
      await updateUniversity(rowToEdit.id, formToPayload(editForm));
      toast.success('Universidad actualizada correctamente.');
      handleEditOpen(false);
      fetchUniversities(1, {
        search: search || undefined,
        quota_type_id: selectedQuotaTypeId,
      });
    } catch {
      toast.error('Error al actualizar la universidad. Intenta nuevamente.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setConfirmOpen(false);
    setRowToDelete(null);
  };

  if (error) return <p className='text-red-400 p-8'>{error}</p>;

  return (
    <>
      <HeaderPanel
        title='Panel de Control'
        description='Gestión de Universidades'
        icon={<University className='h-5 w-5 text-black' />}
      />

      <div className='rounded-2xl border border-white/10 bg-[#1a1a1a] shadow-xl'>
        <div className='flex flex-col gap-3 border-b border-white/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex flex-wrap items-center gap-2'>
            <PartnerUniversityActionButtons
              onCreated={() =>
                fetchUniversities(1, {
                  search: search || undefined,
                  quota_type_id: selectedQuotaTypeId,
                })
              }
            />
            <PartnerUniversityFilters
              selectedQuotaTypeId={selectedQuotaTypeId}
              onQuotaTypeChange={setSelectedQuotaTypeId}
            />
          </div>
          <SearchPanel
            search={search}
            setSearch={setSearch}
            placeholder='Buscar cupos...'
          />
        </div>

        <TablePanel
          columns={columns}
          data={universities}
          loading={loading}
          pagination={
            meta
              ? {
                  count: meta.count,
                  next: meta.next,
                  previous: meta.previous,
                  page,
                  onPageChange: (p) =>
                    fetchUniversities(p, {
                      search: search || undefined,
                      quota_type_id: selectedQuotaTypeId,
                    }),
                  pageSize: 10,
                }
              : undefined
          }
        >
          {(row) => (
            <PartnerUniversityTableButtons
              row={row as PartnerUniversities}
              onEdit={handleEditRequest}
              onDelete={handleDeleteRequest}
              onViewDelegates={handleViewDelegates}
            />
          )}
        </TablePanel>

        {/* <FooterPanel
          filtered={meta?.count ?? universities.length}
          elements={meta?.count ?? universities.length}
        /> */}
      </div>

      {/* Modal Delegados */}
      <ModalDelegates
        open={delegatesOpen}
        onClose={() => setDelegatesOpen(false)}
        universityId={delegatesUniversityId}
        universityName={delegatesUniversityName}
      />

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
        title='Editar Universidad'
        description='Edita los campos de la universidad.'
        icon={<University className='h-4 w-4 text-black' />}
        onValueChange={handleEditSelectChange}
      />

      <Toaster position='bottom-right' richColors theme='dark' />
    </>
  );
};

export default PartnerUniversity;
