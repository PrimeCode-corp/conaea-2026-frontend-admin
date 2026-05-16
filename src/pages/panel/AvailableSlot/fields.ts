import type { Field } from '../components/FormFields/formFields.types';
import type { QuotaTypes } from '@/types/quotaTypes.types';

type PreSaleOption = { id: number; name: string };

export const getAvailableSlotFields = (
  preSales: PreSaleOption[],
  quotaTypes: QuotaTypes[],
): Field[] => [
  {
    kind: 'select',
    id: 'pre_sale',
    label: 'Preventa',
    fullWidth: true,
    required: true,
    options: preSales.map((d) => ({ label: d.name, value: d.id.toString() })),
  },
  {
    kind: 'select',
    id: 'quota_type',
    label: 'Tipo de cuota',
    fullWidth: true,
    required: true,
    options: quotaTypes.map((s) => ({ label: s.name, value: s.id.toString() })),
  },
  {
    kind: 'input',
    id: 'mount',
    label: 'Monto',
    type: 'number',
    min: 1,
    fullWidth: false,
    required: true,
  },
  {
    kind: 'input',
    id: 'amount',
    label: 'Cantidad',
    type: 'number',
    min: 1,
    fullWidth: false,
    required: true,
  },
];
