import { useState } from 'react';
import { toast } from 'sonner';

import { validate } from '@/utils/validations';
import { extractApiError, mapFieldErrors } from '@/utils/apiError';
import type { Field } from '@/pages/panel/components/FormFields/formFields.types';

type FormErrors<T> = Partial<Record<keyof T, string>>;

interface UseResourceFormOptions<
  TForm extends Record<string, unknown>,
  TPayload,
> {
  /** Estado inicial del formulario (también usado al resetear). */
  emptyForm: TForm;
  /** Definición de campos, usada para validar antes de enviar. */
  fields: Field[];
  /** Modo de validación: 'create' incluye los campos `requiredOnCreate`. */
  mode?: 'create' | 'edit';
  /** Transforma el formulario al payload que espera el servicio. */
  toPayload: (form: TForm) => TPayload;
  /** Acción asíncrona que persiste el payload (crear o actualizar). */
  submit: (payload: TPayload) => Promise<unknown>;
  /** Mensajes de toast. */
  messages: { success: string; error: string };
  /** Callback opcional tras un envío exitoso. */
  onSuccess?: () => void;
  /**
   * Si es `true`, ante un error de la API se intentan mapear los errores por
   * campo al formulario (dejándolo abierto) antes de caer en el toast genérico.
   */
  fieldErrors?: boolean;
}

/**
 * Encapsula el estado y los handlers de un formulario de recurso (crear o
 * editar): apertura del modal, cambios de inputs/selects/archivos, validación,
 * envío y notificaciones. Comparte exactamente la misma lógica entre las
 * acciones de "Crear" (en los ActionButtons) y "Editar" (en useCrudPanel).
 */
export function useResourceForm<
  TForm extends Record<string, unknown>,
  TPayload,
>({
  emptyForm,
  fields,
  mode = 'create',
  toPayload,
  submit,
  messages,
  onSuccess,
  fieldErrors = false,
}: UseResourceFormOptions<TForm, TPayload>) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TForm>(emptyForm);
  const [errors, setErrors] = useState<FormErrors<TForm>>({});
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setForm(emptyForm);
    setErrors({});
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) reset();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleValueChange = (id: string, value: string) => {
    setForm((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: undefined }));
  };

  const handleFile = (id: string, file: File | null) => {
    setForm((prev) => ({ ...prev, [id]: file }));
    setErrors((prev) => ({ ...prev, [id]: undefined }));
  };

  const handleSubmit = async () => {
    if (!validate(form, fields, setErrors, mode)) return;
    setLoading(true);
    try {
      await submit(toPayload(form));
      toast.success(messages.success);
      handleOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      if (fieldErrors) {
        const mapped = mapFieldErrors(err, emptyForm);
        if (mapped) {
          setErrors(mapped);
          return;
        }
      }
      toast.error(extractApiError(err, messages.error));
    } finally {
      setLoading(false);
    }
  };

  return {
    open,
    setOpen,
    form,
    setForm,
    errors,
    setErrors,
    loading,
    reset,
    handleOpenChange,
    handleChange,
    handleValueChange,
    handleFile,
    handleSubmit,
  };
}
