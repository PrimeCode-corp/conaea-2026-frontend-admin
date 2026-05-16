import { useEffect, useState } from 'react';
import { useClientPagination } from '@/hooks/useClientPagination';

import { Mic2 } from 'lucide-react';

import HeaderPanel from '../components/HeaderPanel';
import TablePanel from '../components/TablePanel';
import FooterPanel from '../components/FooterPanel';
import SearchPanel from '../components/SearchPanel';
import LoadingControl from '@/components/LoadingControl';

import { useSpeakerStore } from '@/store/useSpeakerStore';
import type { Speakers } from '@/types/speakers.types';
import { type SpeakerForm, type FormErrors, emptyForm } from './speaker.types';

import SpeakerActionButtons from './SpeakerActionButtons';
import SpeakerTableButtons from './SpeakerTableButtons';

import ModalDelete from '../components/modals/ModalDelete';
import ModalForm from '../components/modals/ModalForm';
import ModalImage from '../components/modals/ModalImage';

import { getSpeakerColumns } from './columns';
import { fields } from './fields';
import { validate } from '@/utils/validations';

import { Toaster } from 'sonner'; // 👈 agregar
import { toast } from 'sonner';

type Row = Record<string, unknown>;

const buildFormData = (form: SpeakerForm): FormData => {
  const fd = new FormData();
  fd.append('name', form.name);
  fd.append('title', form.title);
  fd.append('bio', form.bio);
  if (form.photo) fd.append('photo', form.photo);
  return fd;
};

const Speaker = () => {
  const {
    speakers,
    loading,
    error,
    fetchSpeakers,
    removeSpeaker,
    updateSpeaker,
  } = useSpeakerStore();
  const [search, setSearch] = useState('');

  // --- Modal Eliminar ---
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState(false);

  // --- Modal Editar (el padre controla qué fila se edita) ---
  const [editOpen, setEditOpen] = useState(false);
  const [rowToEdit, setRowToEdit] = useState<Speakers | null>(null);
  const [editForm, setEditForm] = useState<SpeakerForm>(emptyForm);
  const [editErrors, setEditErrors] = useState<FormErrors>({});
  const [editLoading, setEditLoading] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    fetchSpeakers();
  }, []);

  useEffect(() => {
    if (editOpen && rowToEdit) {
      setEditForm({
        name: rowToEdit.name,
        title: rowToEdit.title,
        bio: rowToEdit.bio,
        photo: null,
      });
      setEditErrors({});
    }
  }, [editOpen, rowToEdit]);

  const columns = getSpeakerColumns((url) => {
    setPreviewImage(url);
    setPreviewOpen(true);
  });

  const filtered = speakers.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()),
  );
  const { page, totalPages, paginated, pageSize, hasPrev, hasNext, goNext, goPrev, goTo } =
    useClientPagination(filtered);

  // Abre el modal de editar con la fila seleccionada
  const handleEditRequest = (row: Row) => {
    const original = speakers.find((d) => d.id === (row.id as number));
    if (original) {
      setRowToEdit(original); // usa los datos originales (no formateados)
      setEditOpen(true);
    }
  };

  // Handlers eliminar
  const handleDeleteRequest = (row: Row) => {
    setRowToDelete(row);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!rowToDelete) return;
    setDeleting(true);
    try {
      await removeSpeaker(rowToDelete.id as number);
      toast.success('Speaker eliminado correctamente.');
      setConfirmOpen(false);
      setRowToDelete(null);
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(detail ?? 'Error al eliminar el speaker. Intenta nuevamente.');
    } finally {
      setDeleting(false);
    }
  };

  const handleEditOpen = (val: boolean) => {
    setEditOpen(val);
    if (!val) {
      setEditForm(emptyForm);
      setEditErrors({});
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setEditErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleEditSubmit = async () => {
    if (!rowToEdit) return;
    if (!validate(editForm, fields, setEditErrors, 'edit')) return;
    setEditLoading(true);
    try {
      await updateSpeaker(rowToEdit.id, buildFormData(editForm));
      toast.success('Speaker actualizado correctamente.');
      handleEditOpen(false);
    } catch {
      toast.error('Error al actualizar el speaker. Intenta nuevamente.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setConfirmOpen(false);
    setRowToDelete(null);
  };

  const handleEditFile = (id: string, file: File | null) => {
    setEditForm((prev) => ({ ...prev, [id]: file }));
    setEditErrors((prev) => ({ ...prev, [id]: undefined }));
  };

  if (loading) return <LoadingControl />;
  if (error) return <p className='text-red-400 p-8'>{error}</p>;

  return (
    <>
      <HeaderPanel
        title='Panel de Control'
        description='Gestión de Speakers'
        icon={<Mic2 className='h-5 w-5 text-black' />}
      />

      <div className='rounded-2xl border border-white/10 bg-[#1a1a1a] shadow-xl'>
        <div className='flex flex-col gap-3 border-b border-white/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between'>
          <SpeakerActionButtons />
          <SearchPanel
            search={search}
            setSearch={setSearch}
            placeholder='Buscar speaker...'
          />
        </div>

        <TablePanel columns={columns} data={paginated}>
          {(row) => (
            <SpeakerTableButtons
              row={row as Speakers}
              onEdit={handleEditRequest}
              onDelete={handleDeleteRequest}
            />
          )}
        </TablePanel>

        <FooterPanel
          filtered={filtered.length}
          elements={speakers.length}
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          hasPrev={hasPrev}
          hasNext={hasNext}
          onPrev={goPrev}
          onNext={goNext}
          onGoTo={goTo}
        />
      </div>

      {/* Modal Eliminar */}
      <ModalDelete
        open={confirmOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title='Eliminar speaker'
        description={rowToDelete?.name as string}
      />

      {/* Modal Editar */}
      <ModalForm
        mode='edit'
        open={editOpen}
        onOpenChange={handleEditOpen}
        fields={fields}
        form={editForm}
        errors={editErrors}
        onFile={handleEditFile}
        onChange={handleEditChange}
        onSubmit={handleEditSubmit}
        loading={editLoading}
        title='Editar Speaker'
        description='Edita los campos del speaker.'
        currentPhoto={rowToEdit?.photo ?? undefined}
        icon={<Mic2 className='h-4 w-4 text-black' />}
      />

      {/* Modal Preview Imagen */}
      <ModalImage
        previewOpen={previewOpen}
        setPreviewOpen={setPreviewOpen}
        previewImage={previewImage}
      />

      <Toaster position='bottom-right' richColors theme='dark' />
    </>
  );
};

export default Speaker;
