import type React from 'react';

interface Field {
  kind: 'input' | 'select' | 'file' | 'photo' | 'input-checkbox' | 'university-select' | 'search-select';
  id?: string;
  label?: string;
  type?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  maxLength?: number;
  options?: { label: string; value: string }[];
  fullWidth?: boolean;
  disabled?: boolean;
  required?: boolean;
  requiredOnCreate?: boolean;
  condition?: (form: Record<string, unknown>, currentPhoto?: string) => boolean;
  /**
   * Validación propia del campo, más allá de `required`. Devuelve el mensaje
   * de error o `null` si el valor es válido (p. ej. formato y peso de una
   * imagen). Se ejecuta solo si el campo pasó la validación de requerido.
   */
  validate?: (value: unknown, form: Record<string, unknown>) => string | null;
  hint?: (form: Record<string, unknown>) => React.ReactNode;
}

export type { Field };
