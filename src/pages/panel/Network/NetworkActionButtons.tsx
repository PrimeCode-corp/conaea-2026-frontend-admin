import { Plus, Share2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import ModalForm from '../components/modals/ModalForm';
import { useResourceForm } from '@/hooks/useResourceForm';

import { useNetworkStore } from '@/store/useNetworkStore';
import type { NetworkPayload } from '@/types/partners.types';
import { type NetworkForm, emptyForm, formToPayload } from './network.types';

import { fields } from './fields';

const NetworkActionButtons = () => {
  const { createNetwork } = useNetworkStore();

  const create = useResourceForm<NetworkForm, NetworkPayload>({
    emptyForm,
    fields,
    toPayload: formToPayload,
    submit: createNetwork,
    messages: {
      success: 'Red social creada correctamente.',
      error: 'Error al crear la red social. Intenta nuevamente.',
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
        Nueva
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
        onSubmit={create.handleSubmit}
        loading={create.loading}
        title='Nueva Red Social'
        description='Completa los campos.'
        icon={<Share2 className='h-4 w-4 text-black' />}
      />
    </div>
  );
};

export default NetworkActionButtons;
