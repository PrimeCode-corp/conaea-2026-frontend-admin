import type { Field } from '@/pages/panel/components/FormFields/formFields.types';

export const validate = <T extends Record<string, unknown>>(
  form: T,
  fields: Field[],
  setErrors: (errors: Partial<Record<keyof T, string>>) => void,
  mode: 'create' | 'edit' = 'create', // 👈
): boolean => {
  const errors: Partial<Record<keyof T, string>> = {};

  fields.forEach((field) => {
    if (!field.id) return;

    const key = field.id as keyof T;
    const value = form[field.id];

    const isRequired =
      field.required || (mode === 'create' && field.requiredOnCreate); // 👈

    if (isRequired) {
      if (typeof value === 'string' && !value.trim()) {
        errors[key] = `${field.label ?? field.id} es requerido.`;
      }

      if (value === null || value === undefined) {
        errors[key] = `${field.label ?? field.id} es requerido.`;
      }
    }

    // Validación propia del campo (formato, peso…), solo si no falló antes.
    if (!errors[key] && field.validate) {
      const message = field.validate(value, form);
      if (message) errors[key] = message;
    }
  });

  setErrors(errors);
  return Object.keys(errors).length === 0;
};

// ── Imágenes ───────────────────────────────────────────────────────────

const LOGO_MAX_KB = 1024;
const LOGO_TYPES = ['image/jpeg', 'image/png'];

/**
 * Reglas del logo de un auspiciador, replicadas del backend para dar feedback
 * inmediato. Ignora los valores que no son un archivo nuevo (al editar sin
 * cambiar el logo el campo va vacío y no se envía).
 */
export const validateLogo = (value: unknown): string | null => {
  if (!(value instanceof File)) return null;
  if (!LOGO_TYPES.includes(value.type))
    return 'Solo se permiten imágenes JPG o PNG.';
  if (value.size > LOGO_MAX_KB * 1024)
    return `El logo no debe superar los ${LOGO_MAX_KB} KB.`;
  return null;
};
