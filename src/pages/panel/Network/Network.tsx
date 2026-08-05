import { useEffect, useState } from 'react';
import { Share2 } from 'lucide-react';

import { useClientPagination } from '@/hooks/useClientPagination';
import { useCrudPanel } from '@/hooks/useCrudPanel';

import LoadingControl from '@/components/LoadingControl';
import CrudPanelLayout from '../components/CrudPanelLayout';

import { useNetworkStore } from '@/store/useNetworkStore';
import type { Network as NetworkEntity, NetworkPayload } from '@/types/partners.types';
import { type NetworkForm, emptyForm, formToPayload } from './network.types';

import NetworkActionButtons from './NetworkActionButtons';
import NetworkTableButtons from './NetworkTableButtons';

import { getNetworkColumns } from './columns';
import { fields } from './fields';

const Network = () => {
  const {
    networks,
    loading,
    error,
    fetchNetworks,
    removeNetwork,
    updateNetwork,
  } = useNetworkStore();

  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchNetworks();
  }, [fetchNetworks]);

  const columns = getNetworkColumns();

  const filtered = networks.filter((n) =>
    n.name.toLowerCase().includes(search.toLowerCase()),
  );
  const pagination = useClientPagination(filtered);

  const crud = useCrudPanel<NetworkEntity, NetworkForm, Partial<NetworkPayload>>({
    items: networks,
    remove: removeNetwork,
    update: updateNetwork,
    emptyForm,
    fields,
    mapToForm: (n) => ({ name: n.name, logo: n.logo ?? '' }),
    toPayload: formToPayload,
    messages: {
      deleteSuccess: 'Red social eliminada correctamente.',
      // Si la red todavía tiene enlaces activos el backend responde 400 con el
      // motivo; `useCrudPanel` muestra ese `detail` en lugar de este texto.
      deleteError: 'Error al eliminar la red social. Intenta nuevamente.',
      editSuccess: 'Red social actualizada correctamente.',
      editError: 'Error al actualizar la red social. Intenta nuevamente.',
    },
  });

  if (loading) return <LoadingControl />;
  if (error) return <p className='text-red-400 p-8'>{error}</p>;

  return (
    <CrudPanelLayout
      description='Gestión de Redes Sociales'
      icon={<Share2 className='h-5 w-5 text-black' />}
      toolbar={<NetworkActionButtons />}
      search={search}
      setSearch={setSearch}
      searchPlaceholder='Buscar red social...'
      columns={columns}
      data={pagination.paginated}
      renderRowActions={(row) => (
        <NetworkTableButtons
          row={row as NetworkEntity}
          onEdit={crud.onEdit}
          onDelete={crud.onDelete}
        />
      )}
      filtered={filtered.length}
      total={networks.length}
      pagination={pagination}
      deleteModal={crud.deleteModal}
      deleteTitle='Eliminar red social'
      editModal={crud.editModal}
      editTitle='Editar Red Social'
      editDescription='Edita los campos de la red social.'
      editIcon={<Share2 className='h-4 w-4 text-black' />}
      editFields={fields}
    />
  );
};

export default Network;
