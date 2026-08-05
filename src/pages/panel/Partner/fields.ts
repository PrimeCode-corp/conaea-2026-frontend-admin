import type { Field } from '../components/FormFields/formFields.types';
import { PARTNER_TYPES } from '@/types/partners.types';
import { validateLogo } from '@/utils/validations';

const normalize = (value: string) => value.trim().toLowerCase();

/**
 * Campos del auspiciador. Recibe los nombres ya ocupados porque el backend
 * deriva el archivo del logo del `name`: dos auspiciadores homónimos se
 * pisarían la imagen en Cloudinary. Al editar se pasan todos menos el propio.
 */
export const getPartnerFields = (takenNames: string[] = []): Field[] => {
  const taken = takenNames.map(normalize);

  return [
    {
      kind: 'photo',
      id: 'logo',
      fullWidth: true,
      requiredOnCreate: true,
      validate: validateLogo,
      condition: (_form, currentPhoto) => !!currentPhoto,
    },
    {
      kind: 'select',
      id: 'type',
      label: 'Tipo',
      placeholder: 'Selecciona un tipo',
      fullWidth: true,
      required: true,
      options: PARTNER_TYPES.map((type) => ({ label: type, value: type })),
    },
    {
      kind: 'input',
      id: 'name',
      label: 'Nombre',
      placeholder: 'Bayer Perú',
      type: 'text',
      maxLength: 50,
      fullWidth: true,
      required: true,
      validate: (value) =>
        taken.includes(normalize(String(value ?? '')))
          ? 'Ya existe un auspiciador con ese nombre.'
          : null,
    },
    {
      kind: 'input',
      id: 'description',
      label: 'Descripción',
      placeholder: 'Patrocinador principal',
      type: 'text',
      fullWidth: true,
      required: true,
    },
    {
      kind: 'file',
      id: 'logo',
      label: 'Logo (JPG o PNG, máx. 1024 KB)',
      fullWidth: true,
      requiredOnCreate: true,
      validate: validateLogo,
      condition: (_form, currentPhoto) => !currentPhoto,
    },
  ];
};
