import { Plus, CalendarDays } from 'lucide-react';

import { Button } from '@/components/ui/button';
import ModalForm from '../components/modals/ModalForm';
import { useResourceForm } from '@/hooks/useResourceForm';

import { useDayStore } from '@/store/useDayStore';
import { type DaysForm, emptyForm } from './days.types';

import { fields } from './fields';

const DayActionButtons = () => {
  const { createDay } = useDayStore();

  const create = useResourceForm<DaysForm, DaysForm>({
    emptyForm,
    fields,
    toPayload: (f) => ({ title: f.title, date: f.date }),
    submit: createDay,
    messages: {
      success: 'Día creado correctamente.',
      error: 'Error al crear el día. Intenta nuevamente.',
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
        title='Nuevo Día'
        description='Completa los campos.'
        icon={<CalendarDays className='h-4 w-4 text-black' />}
      />
    </div>
  );
};

export default DayActionButtons;
