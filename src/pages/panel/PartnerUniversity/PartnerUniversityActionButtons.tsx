import { useState } from 'react';

import { Plus, University } from 'lucide-react';

import { Button } from '@/components/ui/button';
import ModalForm from '../components/modals/ModalForm';

import { usePartnerUniversityStore } from '@/store/usePartnerUniversityStore';

import {
  type PartnerUniversityForm,
  type FormErrors,
  type PartnerUniversityPayload,
  emptyForm,
} from './partnerUniversity.types';

import { getAvailableSlotFields } from './fields';
import { validate } from '@/utils/validations';

import { toast } from 'sonner'; // 👈 agregar

const formToPayload = (
  form: PartnerUniversityForm,
): PartnerUniversityPayload => ({
  quota_type: Number(form.quota_type),
  name: form.name,
  abbreviation: form.abbreviation,
  country: form.country,
  region: form.region,
  place: form.place,
});

interface PartnerUniversityActionButtonsProps {
  onCreated: () => void;
}

const PartnerUniversityActionButtons = ({
  onCreated,
}: PartnerUniversityActionButtonsProps) => {
  const { createUniversity, quotaTypes } = usePartnerUniversityStore();

  // Modal Crear
  const [createOpen, setCreateOpen] = useState(false);

  const [createForm, setCreateForm] =
    useState<PartnerUniversityForm>(emptyForm);

  const [createErrors, setCreateErrors] = useState<FormErrors>({});

  const [createLoading, setCreateLoading] = useState(false);

  const fields = getAvailableSlotFields(quotaTypes);

  // Handlers Crear
  const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreateForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setCreateErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleCreateSubmit = async () => {
    if (!validate(createForm, fields, setCreateErrors)) return;
    setCreateLoading(true);
    try {
      await createUniversity(formToPayload(createForm));
      toast.success('Universidad asociada creada correctamente.'); // 👈
      setCreateForm(emptyForm);
      setCreateOpen(false);
      onCreated?.();
    } catch {
      toast.error(
        'Error al crear la universidad asociada. Intenta nuevamente.',
      ); // 👈
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
        title='Nueva Universidad Asociada'
        description='Completa los campos.'
        icon={<University className='h-4 w-4 text-black' />}
        onValueChange={handleCreateSelectChange}
      />
    </div>
  );
};

export default PartnerUniversityActionButtons;
