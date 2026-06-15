import { Plus, Ticket } from 'lucide-react';

import { Button } from '@/components/ui/button';
import ModalForm from '../components/modals/ModalForm';
import { useResourceForm } from '@/hooks/useResourceForm';

import { useAvailableSlotStore } from '@/store/useAvailableSlotStore';
import { useQuotaTypeStore } from '@/store/useQuotaTypeStore';

import {
  type AvailableSlotForm,
  type AvailableSlotPayload,
  emptyForm,
  formToPayload,
} from './availableSlot.types';

import { getAvailableSlotFields } from './fields';

const AvailableSlotActionButtons = () => {
  const { createAvailableSlot, preSales } = useAvailableSlotStore();
  const { quotaTypes } = useQuotaTypeStore();

  const fields = getAvailableSlotFields(preSales, quotaTypes);

  const create = useResourceForm<AvailableSlotForm, AvailableSlotPayload>({
    emptyForm,
    fields,
    toPayload: formToPayload,
    submit: createAvailableSlot,
    messages: {
      success: 'Cupo creado correctamente.',
      error: 'Error al crear el cupo. Intenta nuevamente.',
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
        title='Nuevo Cupo'
        description='Completa los campos.'
        icon={<Ticket className='h-4 w-4 text-black' />}
        onValueChange={create.handleValueChange}
      />
    </div>
  );
};

export default AvailableSlotActionButtons;
