import { useState } from 'react';

import { Plus, Trophy } from 'lucide-react';

import { Button } from '@/components/ui/button';
import ModalForm from '../components/modals/ModalForm';

import { useIndividualCupStore } from '@/store/useIndividualCupStore';
import { individualCupService } from '@/services/individualCupService';

import {
  type IndividualCupForm,
  type FormErrors,
  type IndividualCupPayload,
  emptyForm,
} from './individualCup.types';
import type { UniversityOption } from '@/types/individualCups.types';

import { getIndividualCupFields } from './fields';
import { validate } from '@/utils/validations';
import { toast } from 'sonner';

const formToPayload = (form: IndividualCupForm): IndividualCupPayload => ({
  pre_sale: Number(form.pre_sale),
  partner_university: Number(form.partner_university),
  currency: Number(form.currency),
});

interface Props {
  selectedPreSaleId?: number;
  selectedQuotaTypeId?: number;
}

const IndividualCupActionButtons = ({ selectedPreSaleId, selectedQuotaTypeId }: Props) => {
  const { createIndividualCup, individualCups, preSales } = useIndividualCupStore();

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<IndividualCupForm>(emptyForm);
  const [createErrors, setCreateErrors] = useState<FormErrors>({});
  const [createLoading, setCreateLoading] = useState(false);
  const [formUniversities, setFormUniversities] = useState<UniversityOption[]>([]);

  const openModal = async () => {
    setCreateForm({ ...emptyForm, pre_sale: selectedPreSaleId?.toString() ?? '' });
    setCreateErrors({});
    setCreateOpen(true);
    try {
      const data = await individualCupService.getAll({
        pre_sale_id:   selectedPreSaleId,
        quota_type_id: selectedQuotaTypeId,
      });
      setFormUniversities(data.universities);
    } catch {
      // mantiene la lista vacía si falla
    }
  };

  // Calculado en render con los filtros activos del panel (siempre conocidos)
  const sameCups = selectedPreSaleId && selectedQuotaTypeId
    ? individualCups.filter(
        (c) =>
          c.pre_sale.id === selectedPreSaleId &&
          c.partner_university.quota_type === selectedQuotaTypeId,
      )
    : [];
  const totalAmountForCreate  = sameCups[0]?.total_amount ?? 0;
  const usedTotalForCreate    = sameCups[0]?.used_total   ?? 0;
  const sumCurrentForCreate   = sameCups.reduce((s, c) => s + c.currency, 0);
  const totalUsedReserved     = sameCups.reduce((s, c) => s + (c.used ?? 0), 0);
  const usedDirectForCreate   = usedTotalForCreate - totalUsedReserved;

  const baseFields = getIndividualCupFields(preSales, formUniversities);

  const fields = baseFields.map((f) =>
    f.id !== 'currency'
      ? f
      : {
          ...f,
          hint: (form: Record<string, unknown>) => {
            const currency = Number(form.currency) || 0;
            const result   = totalAmountForCreate - (sumCurrentForCreate + currency);
            return (
              <span className='text-xs text-slate-500'>
                N. Reserva ={' '}
                <span className='text-slate-400'>{totalAmountForCreate}</span>
                {' − ('}
                <span className='text-slate-400'>{sumCurrentForCreate}</span>
                {' + '}
                <span className='text-slate-400'>{currency}</span>
                {') = '}
                <span className={result < 0 || result < usedDirectForCreate ? 'text-red-400 font-medium' : 'text-slate-200 font-medium'}>
                  {result}
                </span>
              </span>
            );
          },
        },
  );

  const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreateForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setCreateErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleCreateSelectChange = (id: string, value: string) => {
    setCreateForm((prev) => ({ ...prev, [id]: value }));
    setCreateErrors((prev) => ({ ...prev, [id]: undefined }));
  };

  const handleCreateSubmit = async () => {
    if (!validate(createForm, fields, setCreateErrors)) return;
    setCreateLoading(true);
    try {
      await createIndividualCup(formToPayload(createForm));
      toast.success('Cupo individual creado correctamente.');
      setCreateForm(emptyForm);
      setCreateOpen(false);
    } catch (err: unknown) {
      const data = (err as { response?: { data?: Record<string, string> } })?.response?.data;
      if (data && typeof data === 'object') {
        const fieldErrors: FormErrors = {};
        for (const [key, msg] of Object.entries(data)) {
          if (key in emptyForm) fieldErrors[key as keyof FormErrors] = msg;
        }
        if (Object.keys(fieldErrors).length > 0) {
          setCreateErrors(fieldErrors);
          return;
        }
      }
      toast.error('Error al crear el cupo individual. Intenta nuevamente.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCreateOpenChange = (val: boolean) => {
    if (!val) {
      setCreateOpen(false);
      setCreateForm(emptyForm);
      setCreateErrors({});
    }
  };

  return (
    <div className='flex flex-wrap gap-2'>
      <Button
        size='sm'
        className='gap-1.5 bg-[#fbba0e] text-black font-semibold hover:bg-[#fbba0e]/90 transition'
        onClick={openModal}
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
        title='Nuevo Cupo Individual'
        description='Asigna un límite de inscripciones a una universidad para una preventa.'
        icon={<Trophy className='h-4 w-4 text-black' />}
        onValueChange={handleCreateSelectChange}
      />
    </div>
  );
};

export default IndividualCupActionButtons;
