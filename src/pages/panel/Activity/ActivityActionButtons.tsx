import { Plus, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import ModalForm from '../components/modals/ModalForm';
import { useResourceForm } from '@/hooks/useResourceForm';

import { useActivityStore } from '@/store/useActivityStore';
import { useDayStore } from '@/store/useDayStore';
import { useActivityTypeStore } from '@/store/useActivityTypeStore';
import { useSpeakerStore } from '@/store/useSpeakerStore';

import {
  type ActivityForm,
  type ActivityPayload,
  emptyForm,
  formToPayload,
} from './activity.types';

import { getActivityFields } from './fields';

const ActivityActionButtons = () => {
  const { createActivity } = useActivityStore();
  const { days } = useDayStore();
  const { activityTypes } = useActivityTypeStore();
  const { speakers } = useSpeakerStore();

  const fields = getActivityFields(days, speakers, activityTypes);

  const create = useResourceForm<ActivityForm, ActivityPayload>({
    emptyForm,
    fields,
    toPayload: formToPayload,
    submit: createActivity,
    messages: {
      success: 'Actividad creada correctamente.',
      error: 'Error al crear la actividad. Intenta nuevamente.',
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
        form={create.form}
        errors={create.errors}
        onChange={create.handleChange}
        onSubmit={create.handleSubmit}
        loading={create.loading}
        title='Nueva Actividad'
        description='Completa los campos.'
        icon={<Zap className='h-4 w-4 text-black' />}
        onValueChange={create.handleValueChange}
      />
    </div>
  );
};

export default ActivityActionButtons;
