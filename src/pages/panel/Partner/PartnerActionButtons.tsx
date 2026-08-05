import { Handshake, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import ModalForm from '../components/modals/ModalForm';
import { useResourceForm } from '@/hooks/useResourceForm';

import { usePartnerStore } from '@/store/usePartnerStore';
import type { Partner } from '@/types/partners.types';
import { type PartnerForm, emptyForm, buildFormData } from './partner.types';

import { getPartnerFields } from './fields';

interface PartnerActionButtonsProps {
  /** Se dispara con el auspiciador recién creado, para encadenar sus redes. */
  onCreated?: (partner: Partner) => void;
}

const PartnerActionButtons = ({ onCreated }: PartnerActionButtonsProps) => {
  const { partners, createPartner } = usePartnerStore();

  const fields = getPartnerFields(partners.map((p) => p.name));

  const create = useResourceForm<PartnerForm, FormData>({
    emptyForm,
    fields,
    toPayload: buildFormData,
    submit: createPartner,
    fieldErrors: true,
    messages: {
      success: 'Auspiciador creado correctamente.',
      error: 'Error al crear el auspiciador. Intenta nuevamente.',
    },
    onSuccess: () => {
      // El auspiciador y sus enlaces se guardan por separado: en cuanto existe
      // el registro se abre la sección de redes para completarlo. `createPartner`
      // añade el nuevo al final de la lista.
      const created = usePartnerStore.getState().partners.at(-1);
      if (created) onCreated?.(created);
    },
  });

  return (
    <div className='flex flex-wrap gap-2'>
      <Button
        size='sm'
        className='gap-1.5 bg-[#fbba0e] text-black font-semibold hover:bg-[#fbba0e]/90 transition cursor-pointer'
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
        onValueChange={create.handleValueChange}
        onFile={create.handleFile}
        onSubmit={create.handleSubmit}
        loading={create.loading}
        title='Nuevo Auspiciador'
        description='Completa los campos. Las redes se agregan después.'
        icon={<Handshake className='h-4 w-4 text-black' />}
      />
    </div>
  );
};

export default PartnerActionButtons;
