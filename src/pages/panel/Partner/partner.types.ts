import type { PartnerType } from '@/types/partners.types';

export type PartnerForm = {
  type: PartnerType | '';
  name: string;
  description: string;
  logo: File | null;
};

export type FormErrors = Partial<Record<keyof PartnerForm, string>>;

export const emptyForm: PartnerForm = {
  type: '',
  name: '',
  description: '',
  logo: null,
};

/**
 * El auspiciador viaja como `multipart/form-data` por el archivo del logo.
 * Al editar sin elegir una imagen nueva el campo `logo` se omite: el backend
 * espera un archivo, no la URL actual, y así tampoco reprocesa la imagen.
 */
export const buildFormData = (form: PartnerForm): FormData => {
  const fd = new FormData();
  fd.append('type', form.type);
  fd.append('name', form.name.trim());
  fd.append('description', form.description.trim());
  if (form.logo) fd.append('logo', form.logo);
  return fd;
};
