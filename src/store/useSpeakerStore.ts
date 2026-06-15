import { create } from 'zustand';
import { speakerService } from '@/services/speakerService';
import { createCrudActions } from './createCrudActions';
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

export const useSpeakerStore = create<SpeakerStore>((set, get) => {
  const crud = createCrudActions<SpeakerStore, Speakers, FormData, FormData>(
    set,
    get,
    {
      key: 'speakers',
      service: speakerService,
      loadError: 'Error al cargar los speakers',
      createError: 'Error al crear el speaker',
      updateError: 'Error al actualizar el speaker',
    },
  );

  return {
    speakers: [],
    loading: false,
    error: null,
    fetchSpeakers: crud.fetch,
    createSpeaker: crud.create,
    updateSpeaker: crud.update,
    removeSpeaker: crud.remove,
    invalidateSpeaker: crud.invalidate,
  };
});
