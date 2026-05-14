import { useState } from 'react';
import { Plus, Contact } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ModalForm from '../components/modals/ModalForm';
import { useDelegateStore } from '@/store/useDelegateStore';
import { getDelegateFields } from './fields';
import { validate } from '@/utils/validations';
import { toast } from 'sonner';
import type { DelegateForm, FormErrors } from './delegate.types';
import { emptyForm } from './delegate.types';
import type { DelegatePayload } from '@/types/delegates.types';

const formToPayload = (form: DelegateForm): DelegatePayload => ({
  fullname: form.fullname,
  type_delegate: form.type_delegate as 'Titular' | 'Alterno',
  cellphone: form.cellphone,
  partner_university: Number(form.partner_university),
});

interface DelegatesActionButtonsProps {
  onCreated: () => void;
}

const DelegatesActionButtons = ({ onCreated }: DelegatesActionButtonsProps) => {
  const { createDelegate, universities } = useDelegateStore();

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<DelegateForm>(emptyForm);
  const [createErrors, setCreateErrors] = useState<FormErrors>({});
  const [createLoading, setCreateLoading] = useState(false);

  const fields = getDelegateFields(universities);

  const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreateForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setCreateErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleCreateSelectChange = (id: string, value: string) => {
    setCreateForm((prev) => ({ ...prev, [id]: value }));
    setCreateErrors((prev) => ({ ...prev, [id]: undefined }));
  };

  const handleCreateOpenChange = (val: boolean) => {
    setCreateOpen(val);
    if (!val) {
      setCreateForm(emptyForm);
      setCreateErrors({});
    }
  };

  const handleCreateSubmit = async () => {
    if (!validate(createForm, fields, setCreateErrors)) return;
    setCreateLoading(true);
    try {
      await createDelegate(formToPayload(createForm));
      toast.success('Delegado creado correctamente.');
      setCreateForm(emptyForm);
      setCreateOpen(false);
      onCreated();
    } catch {
      toast.error('Error al crear el delegado. Intenta nuevamente.');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className='flex flex-wrap gap-2'>
      <Button
        size='sm'
        className='gap-1.5 bg-[#fbba0e] text-black font-semibold hover:bg-[#fbba0e]/90 transition'
        onClick={() => setCreateOpen(true)}
      >
        <Plus className='h-4 w-4' />
        Nuevo
      </Button>

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
        title='Nuevo Delegado'
        description='Completa los campos del delegado.'
        icon={<Contact className='h-4 w-4 text-black' />}
        onValueChange={handleCreateSelectChange}
      />
    </div>
  );
};

export default DelegatesActionButtons;
