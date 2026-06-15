import { useState } from 'react';
import { toast } from 'sonner';

import { useResourceForm } from './useResourceForm';
import { extractApiError } from '@/utils/apiError';
import type { Field } from '@/pages/panel/components/FormFields/formFields.types';

type Row = Record<string, unknown>;

interface UseCrudPanelOptions<
  TItem extends { id: number },
  TForm extends Record<string, unknown>,
  TUpdatePayload,
> {
  /** Lista completa de elementos (para localizar el original al editar). */
  items: TItem[];

  // --- Eliminar ---
  /** Acción asíncrona que elimina por id. */
  remove: (id: number) => Promise<unknown>;
  /** Etiqueta mostrada en el modal de confirmación. */
  getRowLabel?: (row: Row) => string | undefined;

  // --- Editar ---
  /** Estado inicial del formulario de edición. */
  emptyForm: TForm;
  /** Definición de campos, usada para validar. */
  fields: Field[];
  /**
   * Campos de edición calculados a partir del elemento en edición (p. ej. para
   * añadir `hint` dinámicos). Si se omite, se usan `fields`. El resultado se
   * usa tanto para validar como para renderizar (`editFields` en el retorno).
   */
  getEditFields?: (item: TItem) => Field[];
  /** Mapea el elemento original a los valores del formulario. */
  mapToForm: (item: TItem) => TForm;
  /** Transforma el formulario al payload de actualización. */
  toPayload: (form: TForm) => TUpdatePayload;
  /** Acción asíncrona que actualiza por id. */
  update: (id: number, payload: TUpdatePayload) => Promise<unknown>;
  /**
   * Si es `true`, los errores por campo del backend se mapean al formulario de
   * edición (dejándolo abierto) antes de caer en el toast genérico.
   */
  fieldErrors?: boolean;

  /** Mensajes de toast para cada operación. */
  messages: {
    deleteSuccess: string;
    deleteError: string;
    editSuccess: string;
    editError: string;
  };
}

/**
 * Encapsula la lógica repetida de editar + eliminar de un panel CRUD:
 * estado de ambos modales, prellenado del formulario de edición y los
 * handlers que conectan la tabla con cada acción. Devuelve `onEdit`/`onDelete`
 * para los botones de fila y los bundles `deleteModal`/`editModal` listos para
 * pasarse a `CrudPanelLayout`.
 */
export function useCrudPanel<
  TItem extends { id: number },
  TForm extends Record<string, unknown>,
  TUpdatePayload,
>({
  items,
  remove,
  getRowLabel = (row) => row.name as string | undefined,
  emptyForm,
  fields,
  getEditFields,
  mapToForm,
  toPayload,
  update,
  fieldErrors,
  messages,
}: UseCrudPanelOptions<TItem, TForm, TUpdatePayload>) {
  // --- Eliminar ---
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState(false);

  const onDelete = (row: Row) => {
    setRowToDelete(row);
    setConfirmOpen(true);
  };

  const handleDeleteCancel = () => {
    setConfirmOpen(false);
    setRowToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!rowToDelete) return;
    setDeleting(true);
    try {
      await remove(rowToDelete.id as number);
      toast.success(messages.deleteSuccess);
      setConfirmOpen(false);
      setRowToDelete(null);
    } catch (err: unknown) {
      toast.error(extractApiError(err, messages.deleteError));
    } finally {
      setDeleting(false);
    }
  };

  // --- Editar ---
  const [rowToEdit, setRowToEdit] = useState<TItem | null>(null);

  // Campos del formulario de edición: dinámicos según la fila si se provee
  // `getEditFields`, si no los estáticos. Usados para validar y renderizar.
  const editFields =
    rowToEdit && getEditFields ? getEditFields(rowToEdit) : fields;

  const editForm = useResourceForm<TForm, TUpdatePayload>({
    emptyForm,
    fields: editFields,
    mode: 'edit',
    toPayload,
    submit: (payload) => {
      if (!rowToEdit) return Promise.resolve();
      return update(rowToEdit.id, payload);
    },
    messages: { success: messages.editSuccess, error: messages.editError },
    fieldErrors,
  });

  const onEdit = (row: Row) => {
    const original = items.find((d) => d.id === (row.id as number));
    if (!original) return;
    setRowToEdit(original);
    editForm.setForm(mapToForm(original));
    editForm.setErrors({});
    editForm.setOpen(true);
  };

  return {
    /** Handlers para los botones de fila de la tabla. */
    onEdit,
    onDelete,
    /** Elemento original en edición (p. ej. para `currentPhoto`). */
    rowToEdit,
    /** Campos calculados del formulario de edición (para pasar a `ModalForm`). */
    editFields,
    /** Props listas para `<ModalDelete>` / `CrudPanelLayout`. */
    deleteModal: {
      open: confirmOpen,
      onClose: handleDeleteCancel,
      onConfirm: handleDeleteConfirm,
      loading: deleting,
      description: rowToDelete ? getRowLabel(rowToDelete) : undefined,
    },
    /** Props listas para `<ModalForm mode='edit'>` / `CrudPanelLayout`. */
    editModal: {
      open: editForm.open,
      onOpenChange: editForm.handleOpenChange,
      form: editForm.form,
      errors: editForm.errors,
      onChange: editForm.handleChange,
      onValueChange: editForm.handleValueChange,
      onFile: editForm.handleFile,
      onSubmit: editForm.handleSubmit,
      loading: editForm.loading,
    },
  };
}
