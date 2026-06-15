import { Plus, ChartSpline } from 'lucide-react';

import { Button } from '@/components/ui/button';
import ModalForm from '../components/modals/ModalForm';
import { useResourceForm } from '@/hooks/useResourceForm';

import { usePreSaleStore } from '@/store/usePreSaleStore';
import type { PreSales } from '@/types/preSales.types';
import { type PreSaleForm, emptyForm } from './preSale.types';

import { fields } from './fields';

type PreSalePayload = Omit<PreSales, 'id' | 'is_active'>;

const PreSaleActionButtons = () => {
  const { createPreSale } = usePreSaleStore();

  const create = useResourceForm<PreSaleForm, PreSalePayload>({
    emptyForm,
    fields,
    toPayload: (f) => ({
      name: f.name,
      start_date: f.start_date,
      end_date: f.end_date,
      booking_mode: false,
    }),
    submit: createPreSale,
    messages: {
      success: 'Preventa creada correctamente.',
      error: 'Error al crear la preventa. Intenta nuevamente.',
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
        title='Nueva Preventa'
        description='Completa los campos.'
        icon={<ChartSpline className='h-4 w-4 text-black' />}
      />
    </div>
  );
};

export default PreSaleActionButtons;
