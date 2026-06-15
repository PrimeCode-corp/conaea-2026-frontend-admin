import { useState } from 'react';
import { useCrudPanel } from '@/hooks/useCrudPanel';
import { useServerTable } from '@/hooks/useServerTable';

import { University } from 'lucide-react';

import HeaderPanel from '../components/HeaderPanel';
import TablePanel from '../components/TablePanel';
import FooterPanel from '../components/FooterPanel';
import SearchPanel from '../components/SearchPanel';
import { getServerFooterProps } from '@/utils/pagination';

import { usePartnerUniversityStore } from '@/store/usePartnerUniversityStore';

import type {
  PartnerUniversities,
  PartnerUniversityDetail,
} from '@/types/partnerUniversties.types';
import {
  type PartnerUniversityForm,
  type PartnerUniversityPayload,
  emptyForm,
  formToPayload,
} from './partnerUniversity.types';

import PartnerUniversityActionButtons from './PartnerUniversityActionButtons';
import PartnerUniversityTableButtons from './PartnerUniversityTableButtons';

import ModalDelete from '../components/modals/ModalDelete';
import ModalForm from '../components/modals/ModalForm';
import ModalDelegates from './modals/ModalDelegates';
import PartnerUniversityFilters from './PartnerUniversityFilters';

import { columns } from './columns';
import { getAvailableSlotFields } from './fields';

import { Toaster } from 'sonner';

type Row = Record<string, unknown>;

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

  // --- Modal Delegados ---
  const [delegatesOpen, setDelegatesOpen] = useState(false);
  const [delegatesUniversityId, setDelegatesUniversityId] = useState<
    number | null
  >(null);
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

  const params = {
    search: search || undefined,
    quota_type_id: selectedQuotaTypeId,
  };

  const { pagination } = useServerTable({
    fetch: fetchUniversities,
    params,
    meta,
    page,
    search,
  });

  const fields = getAvailableSlotFields(quotaTypes);

  const crud = useCrudPanel<
    PartnerUniversityDetail,
    PartnerUniversityForm,
    PartnerUniversityPayload
  >({
    items: universities,
    remove: removeUniversity,
    update: updateUniversity,
    emptyForm,
    fields,
    mapToForm: (u) => ({
      quota_type: u.quota_type.id.toString(),
      name: u.name,
      abbreviation: u.abbreviation,
      country: u.country,
      region: u.region,
      place: u.place,
    }),
    toPayload: formToPayload,
    messages: {
      deleteSuccess: 'Universidad eliminada correctamente.',
      deleteError: 'Error al eliminar la universidad. Intenta nuevamente.',
      editSuccess: 'Universidad actualizada correctamente.',
      editError: 'Error al actualizar la universidad. Intenta nuevamente.',
    },
  });

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
              onCreated={() => fetchUniversities(1, params)}
            />
            <PartnerUniversityFilters
              selectedQuotaTypeId={selectedQuotaTypeId}
              onQuotaTypeChange={setSelectedQuotaTypeId}
            />
          </div>
          <SearchPanel
            search={search}
            setSearch={setSearch}
            placeholder='Buscar universidades...'
          />
        </div>

        <TablePanel
          columns={columns}
          data={universities}
          loading={loading}
          pagination={pagination}
        >
          {(row) => (
            <PartnerUniversityTableButtons
              row={row as PartnerUniversities}
              onEdit={crud.onEdit}
              onDelete={crud.onDelete}
              onViewDelegates={handleViewDelegates}
            />
          )}
        </TablePanel>

        <FooterPanel
          {...getServerFooterProps(meta, page, (p) =>
            fetchUniversities(p, params),
          )}
        />
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
        open={crud.deleteModal.open}
        onClose={crud.deleteModal.onClose}
        onConfirm={crud.deleteModal.onConfirm}
        loading={crud.deleteModal.loading}
        title='Eliminar universidad'
        description={crud.deleteModal.description}
      />

      <ModalForm
        mode='edit'
        open={crud.editModal.open}
        onOpenChange={crud.editModal.onOpenChange}
        fields={fields}
        form={crud.editModal.form}
        errors={crud.editModal.errors}
        onChange={crud.editModal.onChange}
        onSubmit={crud.editModal.onSubmit}
        loading={crud.editModal.loading}
        title='Editar Universidad'
        description='Edita los campos de la universidad.'
        icon={<University className='h-4 w-4 text-black' />}
        onValueChange={crud.editModal.onValueChange}
      />

      <Toaster position='bottom-right' richColors theme='dark' />
    </>
  );
};

export default PartnerUniversity;
