import type { Field } from '../components/FormFields/formFields.types';
import type { PreSaleOption, UniversityOption } from '@/types/individualCups.types';

export const getIndividualCupFields = (
  preSales: PreSaleOption[],
  universities: UniversityOption[],
): Field[] => [
  {
    kind: 'select',
    id: 'pre_sale',
    label: 'Preventa',
    fullWidth: true,
    required: true,
    options: preSales.map((p) => ({ label: p.name, value: p.id.toString() })),
  },
  {
    kind: 'search-select',
    id: 'partner_university',
    label: 'Universidad',
    fullWidth: true,
    required: true,
    placeholder: 'Buscar universidad…',
    options: universities.map((u) => ({
      label: u.has_cup
        ? `${u.name} (${u.abbreviation}) · Ya asignada`
        : `${u.name} (${u.abbreviation})`,
      value: u.id.toString(),
    })),
  },
  {
    kind: 'input',
    id: 'currency',
    label: 'Cupos máx.',
    type: 'number',
    min: 1,
    fullWidth: true,
    required: true,
  },
];
