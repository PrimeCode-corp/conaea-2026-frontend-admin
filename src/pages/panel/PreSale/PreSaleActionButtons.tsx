import { useState } from 'react';

import { Plus, ChartSpline } from 'lucide-react';

import { Button } from '@/components/ui/button';
import ModalForm from '../components/modals/ModalForm';

import { usePreSaleStore } from '@/store/usePreSaleStore';
import { type PreSaleForm, type FormErrors, emptyForm } from './preSale.types';

import { fields } from './fields';
import { validate } from '@/utils/validations';

import { toast } from 'sonner';
import { isAxiosError } from 'axios';

const PreSaleActionButtons = () => {
  const { createPreSale } = usePreSaleStore();

  // Modal Crear
  const [createOpen, setCreateOpen] = useState(false);

  const [createForm, setCreateForm] = useState<PreSaleForm>(emptyForm);

  const [createErrors, setCreateErrors] = useState<FormErrors>({});

  const [createLoading, setCreateLoading] = useState(false);

  // Handlers Crear
  const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreateForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setCreateErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleCreateSubmit = async () => {
    if (!validate(createForm, fields, setCreateErrors)) return;
    setCreateLoading(true);
    try {
      await createPreSale({
        name: createForm.name,
        start_date: createForm.start_date,
        end_date: createForm.end_date,
      });
      toast.success('Preventa creada correctamente.'); // 👈
      setCreateForm(emptyForm);
      setCreateOpen(false);
    } catch (err) {
      const msg =
        isAxiosError(err) && err.response?.data?.non_field_errors?.[0]
          ? err.response.data.non_field_errors[0]
          : 'Error al crear la preventa. Intenta nuevamente.';
      toast.error(msg);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCreateOpenChange = (val: boolean) => {
    setCreateOpen(val);
    if (!val) {
      setCreateForm(emptyForm);
      setCreateErrors({});
    }
  };

  return (
    <div className='flex flex-wrap gap-2'>
      {/* Botón Nuevo */}
      <Button
        size='sm'
        className='gap-1.5 bg-[#fbba0e] text-black font-semibold hover:bg-[#fbba0e]/90 transition'
        onClick={() => setCreateOpen(true)}
      >
        <Plus className='h-4 w-4' />
        Nuevo
      </Button>

      {/* ── Modal Crear ── */}
      <ModalForm
        mode='create'
        open={createOpen}
        onOpenChange={handleCreateOpenChange}
        fields={fields}
        form={createForm}
        errors={createErrors}
        onChange={handleCreateChange}
        onSubmit={handleCreateSubmit}
        loading={createLoading}
        title='Nueva Preventa'
        description='Completa los campos.'
        icon={<ChartSpline className='h-4 w-4 text-black' />}
      />
    </div>
  );
};

export default PreSaleActionButtons;
