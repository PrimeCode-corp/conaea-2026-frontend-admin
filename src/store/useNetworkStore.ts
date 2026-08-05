import { create } from 'zustand';
import { networkService } from '@/services/networkService';
import { createCrudActions } from './createCrudActions';
import type { Network, NetworkPayload } from '@/types/partners.types';

type NetworkStore = {
  networks: Network[];
  loading: boolean;
  error: string | null;

  fetchNetworks: () => Promise<void>;
  createNetwork: (payload: NetworkPayload) => Promise<void>;
  updateNetwork: (id: number, payload: Partial<NetworkPayload>) => Promise<void>;
  removeNetwork: (id: number) => Promise<void>;
  invalidateNetworks: () => Promise<void>;
};

export const useNetworkStore = create<NetworkStore>((set, get) => {
  const crud = createCrudActions<NetworkStore, Network, NetworkPayload>(
    set,
    get,
    {
      key: 'networks',
      service: networkService,
      loadError: 'Error al cargar las redes sociales',
      createError: 'Error al crear la red social',
      updateError: 'Error al actualizar la red social',
    },
  );

  return {
    networks: [],
    loading: false,
    error: null,
    fetchNetworks: crud.fetch,
    createNetwork: crud.create,
    updateNetwork: crud.update,
    // `remove` deja propagar el error tal cual: el backend responde 400 con el
    // `detail` de "tiene N enlaces asociados" y la UI lo muestra.
    removeNetwork: crud.remove,
    invalidateNetworks: crud.invalidate,
  };
});
