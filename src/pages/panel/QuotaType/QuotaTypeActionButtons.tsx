import { Plus, CalendarDays } from 'lucide-react';

import { Button } from '@/components/ui/button';
import ModalForm from '../components/modals/ModalForm';
import { useResourceForm } from '@/hooks/useResourceForm';

import { useQuotaTypeStore } from '@/store/useQuotaTypeStore';
import { type QuotaTypeForm, emptyForm } from './quotaType.types';

import { fields } from './fields';

const QuotaTypeActionButtons = () => {
  const { createQuotaType } = useQuotaTypeStore();

  const create = useResourceForm<QuotaTypeForm, QuotaTypeForm>({
    emptyForm,
    fields,
    toPayload: (f) => ({ name: f.name, currency: f.currency }),
    submit: createQuotaType,
    messages: {
      success: 'Tipo de cuota creado correctamente.',
      error: 'Error al crear el tipo de cuota. Intenta nuevamente.',
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
        title='Nuevo Tipo de Cuota'
        description='Completa los campos.'
        icon={<CalendarDays className='h-4 w-4 text-black' />}
      />
    </div>
  );
};

export default QuotaTypeActionButtons;
