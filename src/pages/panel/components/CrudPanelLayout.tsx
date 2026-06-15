import type React from 'react';

import HeaderPanel from './HeaderPanel';
import TablePanel from './TablePanel';
import FooterPanel from './FooterPanel';
import SearchPanel from './SearchPanel';
import ModalDelete from './modals/ModalDelete';
import ModalForm from './modals/ModalForm';

import { Toaster } from 'sonner';

type Row = Record<string, unknown>;

type Column = {
  id: number;
  label: string;
  key: string;
  centered?: boolean;
  render?: (value: unknown, row: Row) => React.ReactNode;
};

/** Controles devueltos por `useClientPagination`. */
export interface PaginationControls {
  page: number;
  totalPages: number;
  pageSize: number;
  hasPrev: boolean;
  hasNext: boolean;
  goNext: () => void;
  goPrev: () => void;
  goTo: (page: number) => void;
}

interface CrudPanelLayoutProps<TForm extends Record<string, unknown>> {
  // --- Encabezado ---
  title?: string;
  description: string;
  icon: React.ReactNode;

  // --- Barra de herramientas ---
  /** Botones de acción (Nuevo, exportar…) y filtros, alineados a la izquierda. */
  toolbar?: React.ReactNode;
  search: string;
  setSearch: (value: string) => void;
  searchPlaceholder?: string;

  // --- Tabla ---
  columns: Column[];
  data: Row[];
  renderRowActions: (row: Row) => React.ReactNode;

  // --- Pie / paginación ---
  /** Total de elementos tras aplicar búsqueda y filtros. */
  filtered: number;
  /** Total de elementos sin filtrar. */
  total: number;
  pagination: PaginationControls;

  // --- Modal eliminar ---
  deleteModal: {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading: boolean;
    description?: string;
  };
  deleteTitle: string;

  // --- Modal editar ---
  editModal: {
    open: boolean;
    onOpenChange: (val: boolean) => void;
    form: TForm;
    errors: Partial<Record<keyof TForm, string>>;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onValueChange: (id: string, value: string) => void;
    onFile: (id: string, file: File | null) => void;
    onSubmit: () => void;
    loading: boolean;
  };
  editTitle: string;
  editDescription: string;
  editIcon: React.ReactNode;
  /** Campos del formulario de edición. */
  editFields: import('./FormFields/formFields.types').Field[];
  /** Foto actual del elemento en edición (para campos `photo`/`file`). */
  editCurrentPhoto?: string;

  /** Modales o elementos extra propios de la página (p. ej. preview de imagen). */
  children?: React.ReactNode;
}

/**
 * Esqueleto JSX común de las páginas CRUD del panel: encabezado, barra con
 * acciones + búsqueda, tabla paginada, pie y los modales de eliminar/editar.
 * Recibe los bundles `deleteModal`/`editModal` que produce `useCrudPanel`.
 */
const CrudPanelLayout = <TForm extends Record<string, unknown>>({
  title = 'Panel de Control',
  description,
  icon,
  toolbar,
  search,
  setSearch,
  searchPlaceholder,
  columns,
  data,
  renderRowActions,
  filtered,
  total,
  pagination,
  deleteModal,
  deleteTitle,
  editModal,
  editTitle,
  editDescription,
  editIcon,
  editFields,
  editCurrentPhoto,
  children,
}: CrudPanelLayoutProps<TForm>) => {
  return (
    <>
      <HeaderPanel title={title} description={description} icon={icon} />

      <div className='rounded-2xl border border-white/10 bg-[#1a1a1a] shadow-xl'>
        <div className='flex flex-col gap-3 border-b border-white/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex flex-wrap items-center gap-2'>{toolbar}</div>
          <SearchPanel
            search={search}
            setSearch={setSearch}
            placeholder={searchPlaceholder}
          />
        </div>

        <TablePanel columns={columns} data={data}>
          {renderRowActions}
        </TablePanel>

        <FooterPanel
          filtered={filtered}
          elements={total}
          page={pagination.page}
          totalPages={pagination.totalPages}
          pageSize={pagination.pageSize}
          hasPrev={pagination.hasPrev}
          hasNext={pagination.hasNext}
          onPrev={pagination.goPrev}
          onNext={pagination.goNext}
          onGoTo={pagination.goTo}
        />
      </div>

      <ModalDelete
        open={deleteModal.open}
        onClose={deleteModal.onClose}
        onConfirm={deleteModal.onConfirm}
        loading={deleteModal.loading}
        title={deleteTitle}
        description={deleteModal.description}
      />

      <ModalForm
        mode='edit'
        open={editModal.open}
        onOpenChange={editModal.onOpenChange}
        fields={editFields}
        form={editModal.form}
        errors={editModal.errors}
        onChange={editModal.onChange}
        onValueChange={editModal.onValueChange}
        onFile={editModal.onFile}
        onSubmit={editModal.onSubmit}
        loading={editModal.loading}
        title={editTitle}
        description={editDescription}
        icon={editIcon}
        currentPhoto={editCurrentPhoto}
      />

      {children}

      <Toaster position='bottom-right' richColors theme='dark' />
    </>
  );
};

export default CrudPanelLayout;
