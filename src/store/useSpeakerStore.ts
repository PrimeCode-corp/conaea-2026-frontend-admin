import { create } from 'zustand';
import { speakerService } from '@/services/speakerService';
import type { Speakers } from '@/types/speakers.types';

type SpeakerStore = {
  speakers: Speakers[];
  loading: boolean;
  error: string | null;

  fetchSpeakers: () => Promise<void>;
  createSpeaker: (payload: FormData) => Promise<void>; // 👈 FormData
  updateSpeaker: (id: number, payload: FormData) => Promise<void>; // 👈 FormData
  removeSpeaker: (id: number) => Promise<void>;
  invalidateSpeaker: () => Promise<void>;
};

export const useSpeakerStore = create<SpeakerStore>((set, get) => ({
  speakers: [],
  loading: false,
  error: null,

  fetchSpeakers: async () => {
    const { speakers } = get();
    if (speakers.length > 0) return;

    set({ loading: true, error: null });
    try {
      const speakers = await speakerService.getAll();
      set({ speakers });
    } catch {
      set({ error: 'Error al cargar los speakers' });
    } finally {
      set({ loading: false });
    }
  },

  createSpeaker: async (payload) => {
    try {
      const newActivityType = await speakerService.create(payload);
      set((state) => ({
        speakers: [...state.speakers, newActivityType],
      }));
    } catch {
      throw new Error('Error al crear el speaker');
    }
  },

  updateSpeaker: async (id, payload) => {
    try {
      const updated = await speakerService.update(id, payload);
      set((state) => ({
        speakers: state.speakers.map((at) => (at.id === id ? updated : at)),
      }));
    } catch {
      throw new Error('Error al actualizar el speaker');
    }
  },

  removeSpeaker: async (id) => {
    await speakerService.remove(id);
    set((state) => ({
      speakers: state.speakers.filter((at) => at.id !== id),
    }));
  },

  invalidateSpeaker: async () => {
    set({ speakers: [] });
    await get().fetchSpeakers();
  },
}));
