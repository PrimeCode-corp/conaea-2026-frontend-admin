import type { Field } from '../components/FormFields/formFields.types';
import type { DelegateUniversityOption } from '@/types/delegates.types';

export const getDelegateFields = (
  universities: DelegateUniversityOption[],
): Field[] => [
  {
    kind: 'input',
    id: 'fullname',
    label: 'Nombre completo',
    placeholder: 'Nombre completo del delegado',
    type: 'text',
    fullWidth: true,
    required: true,
  },
  {
    kind: 'select',
    id: 'type_delegate',
    label: 'Tipo de delegado',
    fullWidth: false,
    required: true,
    options: [
      { label: 'Titular', value: 'Titular' },
      { label: 'Alterno', value: 'Alterno' },
    ],
  },
  {
    kind: 'input',
    id: 'cellphone',
    label: 'Teléfono',
    placeholder: '(+51)999999999',
    type: 'text',
    fullWidth: false,
    required: true,
  },
  {
    kind: 'search-select',
    id: 'partner_university',
    label: 'Universidad',
    placeholder: 'Buscar universidad...',
    fullWidth: true,
    required: true,
    options: universities.map((u) => ({
      label: `${u.abbreviation} — ${u.name}`,
      value: u.id.toString(),
    })),
  },
];
