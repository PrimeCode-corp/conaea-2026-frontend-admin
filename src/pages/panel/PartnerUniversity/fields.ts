import type { Field } from '../components/FormFields/formFields.types';
import type { QuotaTypeOption } from '@/types/partnerUniversties.types';

export const getAvailableSlotFields = (quotaTypes: QuotaTypeOption[]): Field[] => [
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
    id: 'name',
    label: 'Nombre',
    type: 'text',
    fullWidth: true,
    required: true,
  },
  {
    kind: 'input',
    id: 'abbreviation',
    label: 'Abreviación',
    type: 'text',
    fullWidth: false,
    required: true,
  },
  {
    kind: 'input',
    id: 'country',
    label: 'País',
    type: 'text',
    fullWidth: false,
    required: true,
  },
  {
    kind: 'input',
    id: 'region',
    label: 'Región',
    type: 'text',
    fullWidth: false,
    required: true,
  },
  {
    kind: 'input',
    id: 'place',
    label: 'Ciudad',
    type: 'text',
    fullWidth: false,
    required: true,
  },
];
