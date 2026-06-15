import { Plus, Contact } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ModalForm from '../components/modals/ModalForm';
import { useResourceForm } from '@/hooks/useResourceForm';
import { useDelegateStore } from '@/store/useDelegateStore';
import { getDelegateFields } from './fields';
import { type DelegateForm, emptyForm, formToPayload } from './delegate.types';
import type { DelegatePayload } from '@/types/delegates.types';

interface DelegatesActionButtonsProps {
  onCreated: () => void;
}

const DelegatesActionButtons = ({ onCreated }: DelegatesActionButtonsProps) => {
  const { createDelegate, universities } = useDelegateStore();

  const fields = getDelegateFields(universities);

  const create = useResourceForm<DelegateForm, DelegatePayload>({
    emptyForm,
    fields,
    toPayload: formToPayload,
    submit: createDelegate,
    messages: {
      success: 'Delegado creado correctamente.',
      error: 'Error al crear el delegado. Intenta nuevamente.',
    },
    onSuccess: onCreated,
  });

  return (
    <div className='flex flex-wrap gap-2'>
      <Button
        size='sm'
        className='gap-1.5 bg-[#fbba0e] text-black font-semibold hover:bg-[#fbba0e]/90 transition'
        onClick={() => create.setOpen(true)}
      >
        <Plus className='h-4 w-4' />
        Nuevo
      </Button>

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
        title='Nuevo Delegado'
        description='Completa los campos del delegado.'
        icon={<Contact className='h-4 w-4 text-black' />}
        onValueChange={create.handleValueChange}
      />
    </div>
  );
};

export default DelegatesActionButtons;
