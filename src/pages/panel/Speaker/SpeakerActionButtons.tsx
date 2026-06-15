import { Plus, Mic2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import ModalForm from '../components/modals/ModalForm';
import { useResourceForm } from '@/hooks/useResourceForm';

import { useSpeakerStore } from '@/store/useSpeakerStore';
import { type SpeakerForm, emptyForm, buildFormData } from './speaker.types';

import { fields } from './fields';

const SpeakerActionButtons = () => {
  const { createSpeaker } = useSpeakerStore();

  const create = useResourceForm<SpeakerForm, FormData>({
    emptyForm,
    fields,
    toPayload: buildFormData,
    submit: createSpeaker,
    messages: {
      success: 'Speaker creado correctamente.',
      error: 'Error al crear el speaker. Intenta nuevamente.',
    },
  });

  return (
    <div className='flex flex-wrap gap-2'>
      {/* Botón Nuevo */}
      <Button
        size='sm'
        className='gap-1.5 bg-[#fbba0e] text-black font-semibold hover:bg-[#fbba0e]/90 transition'
        onClick={() => create.setOpen(true)}
      >
        <Plus className='h-4 w-4' />
        Nuevo
      </Button>

      {/* ── Modal Crear ── */}
      <ModalForm
        mode='create'
        open={create.open}
        onOpenChange={create.handleOpenChange}
        fields={fields}
        onFile={create.handleFile}
        form={create.form}
        errors={create.errors}
        onChange={create.handleChange}
        onSubmit={create.handleSubmit}
        loading={create.loading}
        title='Nuevo Speaker'
        description='Completa los campos.'
        icon={<Mic2 className='h-4 w-4 text-black' />}
      />
    </div>
  );
};

export default SpeakerActionButtons;
