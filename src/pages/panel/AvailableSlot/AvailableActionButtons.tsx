import { useState } from 'react';

import { Plus, Ticket } from 'lucide-react';

import { Button } from '@/components/ui/button';
import ModalForm from '../components/modals/ModalForm';

import { useAvailableSlotStore } from '@/store/useAvailableSlotStore';
import { useQuotaTypeStore } from '@/store/useQuotaTypeStore';

import {
  type AvailableSlotForm,
  type FormErrors,
  type AvailableSlotPayload,
  emptyForm,
} from './availableSlot.types';

import { getAvailableSlotFields } from './fields';
import { validate } from '@/utils/validations';

import { toast } from 'sonner'; // 👈 agregar

const formToPayload = (form: AvailableSlotForm): AvailableSlotPayload => ({
  pre_sale: Number(form.pre_sale),
  quota_type: Number(form.quota_type),
  mount: Number(form.mount),
  amount: Number(form.amount),
});

const AvailableSlotActionButtons = () => {
  const { createAvailableSlot, preSales } = useAvailableSlotStore();

  const { quotaTypes } = useQuotaTypeStore();

  // Modal Crear
  const [createOpen, setCreateOpen] = useState(false);

  const [createForm, setCreateForm] = useState<AvailableSlotForm>(emptyForm);

  const [createErrors, setCreateErrors] = useState<FormErrors>({});

  const [createLoading, setCreateLoading] = useState(false);

  const fields = getAvailableSlotFields(preSales, quotaTypes);

  // Handlers Crear
  const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreateForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setCreateErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleCreateSubmit = async () => {
    if (!validate(createForm, fields, setCreateErrors)) return;
    setCreateLoading(true);
    try {
      await createAvailableSlot(formToPayload(createForm));
      toast.success('Cupo creado correctamente.'); // 👈
      setCreateForm(emptyForm);
      setCreateOpen(false);
    } catch {
      toast.error('Error al crear el cupo. Intenta nuevamente.'); // 👈
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

  const handleCreateSelectChange = (id: string, value: string) => {
    setCreateForm((prev) => ({ ...prev, [id]: value }));
    setCreateErrors((prev) => ({ ...prev, [id]: undefined }));
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
        title='Nuevo Cupo'
        description='Completa los campos.'
        icon={<Ticket className='h-4 w-4 text-black' />}
        onValueChange={handleCreateSelectChange}
      />
    </div>
  );
};

export default AvailableSlotActionButtons;
