import { useState } from 'react';
import { Contact } from 'lucide-react';
import { Toaster } from 'sonner';

import { useCrudPanel } from '@/hooks/useCrudPanel';
import { useServerTable } from '@/hooks/useServerTable';

import HeaderPanel from '../components/HeaderPanel';
import TablePanel from '../components/TablePanel';
import FooterPanel from '../components/FooterPanel';
import SearchPanel from '../components/SearchPanel';
import ModalDelete from '../components/modals/ModalDelete';
import ModalForm from '../components/modals/ModalForm';
import { getServerFooterProps } from '@/utils/pagination';

import { useDelegateStore } from '@/store/useDelegateStore';
import { getDelegateFields } from './fields';
import { columns } from './columns';
import { type DelegateForm, emptyForm, formToPayload } from './delegate.types';
import type { Delegate, DelegatePayload } from '@/types/delegates.types';

import DelegatesActionButtons from './DelegatesActionButtons';
import DelegatesTableButtons from './DelegatesTableButtons';
import DelegatesFilters from './DelegatesFilters';

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

  // --- Filtros ---
  const [selectedUniversityId, setSelectedUniversityId] = useState<
    number | undefined
  >(undefined);

  const fields = getDelegateFields(universities);

  const params = {
    search: search || undefined,
    partner_university_id: selectedUniversityId,
  };

  const { pagination } = useServerTable({
    fetch: fetchDelegates,
    params,
    meta,
    page,
    search,
  });

  const crud = useCrudPanel<Delegate, DelegateForm, DelegatePayload>({
    items: delegates,
    remove: removeDelegate,
    update: updateDelegate,
    getRowLabel: (row) => row.fullname as string,
    emptyForm,
    fields,
    mapToForm: (d) => ({
      fullname: d.fullname,
      type_delegate: d.type_delegate,
      cellphone: d.cellphone,
      partner_university: d.partner_university.id.toString(),
    }),
    toPayload: formToPayload,
    messages: {
      deleteSuccess: 'Delegado eliminado correctamente.',
      deleteError: 'Error al eliminar el delegado. Intenta nuevamente.',
      editSuccess: 'Delegado actualizado correctamente.',
      editError: 'Error al actualizar el delegado. Intenta nuevamente.',
    },
  });

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
              onCreated={() => fetchDelegates(1, params)}
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
          pagination={pagination}
        >
          {(row) => (
            <DelegatesTableButtons
              row={row as Delegate}
              onEdit={crud.onEdit}
              onDelete={crud.onDelete}
            />
          )}
        </TablePanel>

        <FooterPanel
          {...getServerFooterProps(meta, page, (p) =>
            fetchDelegates(p, params),
          )}
        />
      </div>

      <ModalDelete
        open={crud.deleteModal.open}
        onClose={crud.deleteModal.onClose}
        onConfirm={crud.deleteModal.onConfirm}
        loading={crud.deleteModal.loading}
        title='Eliminar delegado'
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
        title='Editar Delegado'
        description='Edita los campos del delegado.'
        icon={<Contact className='h-4 w-4 text-black' />}
        onValueChange={crud.editModal.onValueChange}
      />

      <Toaster position='bottom-right' richColors theme='dark' />
    </>
  );
};

export default Delegates;
