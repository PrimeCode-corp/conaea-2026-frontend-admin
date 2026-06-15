import { Plus, Brackets } from 'lucide-react';

import { Button } from '@/components/ui/button';
import ModalForm from '../components/modals/ModalForm';
import { useResourceForm } from '@/hooks/useResourceForm';

import { useActivityTypeStore } from '@/store/useActivityTypeStore';
import { type ActivityTypeForm, emptyForm } from './activityType.types';

import { fields } from './fields';

const ActivityTypeActionButtons = () => {
  const { createActivityType } = useActivityTypeStore();

  const create = useResourceForm<ActivityTypeForm, ActivityTypeForm>({
    emptyForm,
    fields,
    toPayload: (f) => ({ name: f.name, logo: f.logo }),
    submit: createActivityType,
    messages: {
      success: 'Tipo de actividad creada correctamente.',
      error: 'Error al crear el tipo de actividad. Intenta nuevamente.',
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
        title='Nuevo Tipo'
        description='Completa los campos.'
        icon={<Brackets className='h-4 w-4 text-black' />}
      />
    </div>
  );
};

export default ActivityTypeActionButtons;
