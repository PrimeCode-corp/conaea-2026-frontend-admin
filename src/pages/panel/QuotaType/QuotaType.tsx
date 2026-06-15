import { useEffect, useState } from 'react';
import { useClientPagination } from '@/hooks/useClientPagination';
import { useCrudPanel } from '@/hooks/useCrudPanel';

import { DollarSign } from 'lucide-react';

import LoadingControl from '@/components/LoadingControl';
import CrudPanelLayout from '../components/CrudPanelLayout';

import { useQuotaTypeStore } from '@/store/useQuotaTypeStore';
import type { QuotaTypes } from '@/types/quotaTypes.types';
import { type QuotaTypeForm, emptyForm } from './quotaType.types';

import QuotaTypeActionButtons from './QuotaTypeActionButtons';
import QuotaTypeTableButtons from './QuotaTypeTableButtons';

import { columns } from './columns';
import { fields } from './fields';

const QuotaType = () => {
  const {
    quotaTypes,
    loading,
    error,
    fetchQuotaTypes,
    removeQuotaType,
    updateQuotaType,
  } = useQuotaTypeStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchQuotaTypes();
  }, [fetchQuotaTypes]);

  const filtered = quotaTypes.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()),
  );
  const pagination = useClientPagination(filtered);

  const crud = useCrudPanel<QuotaTypes, QuotaTypeForm, QuotaTypeForm>({
    items: quotaTypes,
    remove: removeQuotaType,
    update: updateQuotaType,
    emptyForm,
    fields,
    mapToForm: (q) => ({ name: q.name, currency: q.currency }),
    toPayload: (f) => ({ name: f.name, currency: f.currency }),
    messages: {
      deleteSuccess: 'Tipo de cuota eliminado correctamente.',
      deleteError: 'Error al eliminar el tipo de cuota. Intenta nuevamente.',
      editSuccess: 'Tipo de cuota actualizado correctamente.',
      editError: 'Error al actualizar el tipo de cuota. Intenta nuevamente.',
    },
  });

  if (loading) return <LoadingControl />;
  if (error) return <p className='text-red-400 p-8'>{error}</p>;

  return (
    <CrudPanelLayout
      description='Gestión de Tipos de Cuota'
      icon={<DollarSign className='h-5 w-5 text-black' />}
      toolbar={<QuotaTypeActionButtons />}
      search={search}
      setSearch={setSearch}
      searchPlaceholder='Buscar días...'
      columns={columns}
      data={pagination.paginated}
      renderRowActions={(row) => (
        <QuotaTypeTableButtons
          row={row as QuotaTypes}
          onEdit={crud.onEdit}
          onDelete={crud.onDelete}
        />
      )}
      filtered={filtered.length}
      total={quotaTypes.length}
      pagination={pagination}
      deleteModal={crud.deleteModal}
      deleteTitle='Eliminar tipo de cuota'
      editModal={crud.editModal}
      editTitle='Editar tipo de cuota'
      editDescription='Edita los campos del tipo de cuota.'
      editIcon={<DollarSign className='h-4 w-4 text-black' />}
      editFields={fields}
    />
  );
};

export default QuotaType;
