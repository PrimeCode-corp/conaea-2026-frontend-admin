import { create } from 'zustand';
import { partnerService } from '@/services/partnerService';
import { partnerNetworkService } from '@/services/partnerNetworkService';
import type { Partner, PartnerType } from '@/types/partners.types';

type PartnerStore = {
  partners: Partner[];
  loading: boolean;
  error: string | null;

  fetchPartners: (type?: PartnerType) => Promise<void>;
  invalidatePartners: () => Promise<void>;
  createPartner: (payload: FormData) => Promise<void>;
  updatePartner: (id: number, payload: FormData) => Promise<void>;
  removePartner: (id: number) => Promise<void>;

  // --- Enlaces a redes sociales del auspiciador ---
  createPartnerLink: (
    partnerId: number,
    networkId: number,
    link: string,
  ) => Promise<void>;
  updatePartnerLink: (
    partnerId: number,
    linkId: number,
    link: string,
  ) => Promise<void>;
  removePartnerLink: (partnerId: number, linkId: number) => Promise<void>;
};

/**
 * Store de auspiciadores. No usa `createCrudActions` porque las respuestas de
 * POST/PATCH no traen `networks`: tras escribir se vuelve a pedir el detalle
 * para no dejar la fila sin sus enlaces.
 *
 * Las acciones dejan propagar el error de la API sin envolverlo, para que la
 * UI pueda leer el `detail` o los errores por campo del backend.
 */
export const usePartnerStore = create<PartnerStore>((set, get) => {
  /** Re-sincroniza los enlaces de un auspiciador tras tocarlos. */
  const syncNetworks = async (partnerId: number) => {
    const networks = await partnerService.getNetworks(partnerId);
    set((state) => ({
      partners: state.partners.map((p) =>
        p.id === partnerId ? { ...p, networks } : p,
      ),
    }));
  };

  const fetchPartners = async (type?: PartnerType) => {
    if (get().partners.length > 0) return;
    set({ loading: true, error: null });
    try {
      set({ partners: await partnerService.getAll(type) });
    } catch {
      set({ error: 'Error al cargar los auspiciadores' });
    } finally {
      set({ loading: false });
    }
  };

  return {
    partners: [],
    loading: false,
    error: null,

    fetchPartners,

    invalidatePartners: async () => {
      set({ partners: [] });
      await fetchPartners();
    },

    createPartner: async (payload) => {
      const created = await partnerService.create(payload);
      const detail = await partnerService
        .getById(created.id)
        .catch(() => ({ ...created, networks: [] }));
      set((state) => ({ partners: [...state.partners, detail] }));
    },

    updatePartner: async (id, payload) => {
      const updated = await partnerService.update(id, payload);
      const detail = await partnerService.getById(id).catch(() => {
        const previous = get().partners.find((p) => p.id === id);
        return { ...updated, networks: previous?.networks ?? [] };
      });
      set((state) => ({
        partners: state.partners.map((p) => (p.id === id ? detail : p)),
      }));
    },

    // Desactivar el auspiciador desactiva sus enlaces en el backend: no hay
    // limpieza que hacer acá.
    removePartner: async (id) => {
      await partnerService.remove(id);
      set((state) => ({
        partners: state.partners.filter((p) => p.id !== id),
      }));
    },

    createPartnerLink: async (partnerId, networkId, link) => {
      await partnerNetworkService.create({
        partner: partnerId,
        network: networkId,
        link,
      });
      await syncNetworks(partnerId);
    },

    updatePartnerLink: async (partnerId, linkId, link) => {
      await partnerNetworkService.update(linkId, { link });
      await syncNetworks(partnerId);
    },

    removePartnerLink: async (partnerId, linkId) => {
      await partnerNetworkService.remove(linkId);
      await syncNetworks(partnerId);
    },
  };
});
