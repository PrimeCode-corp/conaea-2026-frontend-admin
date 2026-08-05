import type { Field } from '../components/FormFields/formFields.types';
import { NETWORK_ICON_OPTIONS } from '../components/NetworkIcon';

export const fields: Field[] = [
  {
    kind: 'input',
    id: 'name',
    label: 'Nombre',
    placeholder: 'Instagram',
    type: 'text',
    maxLength: 50,
    fullWidth: true,
    required: true,
  },
  {
    // Select y no texto libre: el icono tiene que ser uno que el frontend
    // sepa pintar (`Network.logo` admite máx. 20 caracteres).
    kind: 'select',
    id: 'logo',
    label: 'Icono',
    placeholder: 'Selecciona un icono',
    fullWidth: true,
    required: true,
    options: NETWORK_ICON_OPTIONS.map((o) => ({
      label: o.label,
      value: o.value,
    })),
  },
];
