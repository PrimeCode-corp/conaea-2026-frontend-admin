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
}

export type { Field };
