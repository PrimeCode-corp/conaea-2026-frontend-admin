import { Plus, University } from 'lucide-react';

import { Button } from '@/components/ui/button';
import ModalForm from '../components/modals/ModalForm';
import { useResourceForm } from '@/hooks/useResourceForm';

import { usePartnerUniversityStore } from '@/store/usePartnerUniversityStore';

import {
  type PartnerUniversityForm,
  type PartnerUniversityPayload,
  emptyForm,
  formToPayload,
} from './partnerUniversity.types';

import { getAvailableSlotFields } from './fields';

interface PartnerUniversityActionButtonsProps {
  onCreated: () => void;
}

const PartnerUniversityActionButtons = ({
  onCreated,
}: PartnerUniversityActionButtonsProps) => {
  const { createUniversity, quotaTypes } = usePartnerUniversityStore();

  const fields = getAvailableSlotFields(quotaTypes);

  const create = useResourceForm<PartnerUniversityForm, PartnerUniversityPayload>(
    {
      emptyForm,
      fields,
      toPayload: formToPayload,
      submit: createUniversity,
      messages: {
        success: 'Universidad asociada creada correctamente.',
        error: 'Error al crear la universidad asociada. Intenta nuevamente.',
      },
      onSuccess: onCreated,
    },
  );

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
        title='Nueva Universidad Asociada'
        description='Completa los campos.'
        icon={<University className='h-4 w-4 text-black' />}
        onValueChange={create.handleValueChange}
      />
    </div>
  );
};

export default PartnerUniversityActionButtons;
