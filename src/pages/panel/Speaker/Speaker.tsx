import { useEffect, useState } from 'react';
import { useClientPagination } from '@/hooks/useClientPagination';
import { useCrudPanel } from '@/hooks/useCrudPanel';
import { useDisclosure } from '@/hooks/useDisclosure';

import { Mic2 } from 'lucide-react';

import LoadingControl from '@/components/LoadingControl';
import CrudPanelLayout from '../components/CrudPanelLayout';
import ModalImage from '../components/modals/ModalImage';

import { useSpeakerStore } from '@/store/useSpeakerStore';
import type { Speakers } from '@/types/speakers.types';
import { type SpeakerForm, emptyForm, buildFormData } from './speaker.types';

import SpeakerActionButtons from './SpeakerActionButtons';
import SpeakerTableButtons from './SpeakerTableButtons';

import { getSpeakerColumns } from './columns';
import { fields } from './fields';

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

  const preview = useDisclosure<string>();

  useEffect(() => {
    fetchSpeakers();
  }, [fetchSpeakers]);

  const columns = getSpeakerColumns((url) => preview.show(url));

  const filtered = speakers.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()),
  );
  const pagination = useClientPagination(filtered);

  const crud = useCrudPanel<Speakers, SpeakerForm, FormData>({
    items: speakers,
    remove: removeSpeaker,
    update: updateSpeaker,
    emptyForm,
    fields,
    mapToForm: (s) => ({
      name: s.name,
      title: s.title,
      bio: s.bio,
      photo: null,
    }),
    toPayload: buildFormData,
    messages: {
      deleteSuccess: 'Speaker eliminado correctamente.',
      deleteError: 'Error al eliminar el speaker. Intenta nuevamente.',
      editSuccess: 'Speaker actualizado correctamente.',
      editError: 'Error al actualizar el speaker. Intenta nuevamente.',
    },
  });

  if (loading) return <LoadingControl />;
  if (error) return <p className='text-red-400 p-8'>{error}</p>;

  return (
    <CrudPanelLayout
      description='Gestión de Speakers'
      icon={<Mic2 className='h-5 w-5 text-black' />}
      toolbar={<SpeakerActionButtons />}
      search={search}
      setSearch={setSearch}
      searchPlaceholder='Buscar speaker...'
      columns={columns}
      data={pagination.paginated}
      renderRowActions={(row) => (
        <SpeakerTableButtons
          row={row as Speakers}
          onEdit={crud.onEdit}
          onDelete={crud.onDelete}
        />
      )}
      filtered={filtered.length}
      total={speakers.length}
      pagination={pagination}
      deleteModal={crud.deleteModal}
      deleteTitle='Eliminar speaker'
      editModal={crud.editModal}
      editTitle='Editar Speaker'
      editDescription='Edita los campos del speaker.'
      editIcon={<Mic2 className='h-4 w-4 text-black' />}
      editFields={fields}
      editCurrentPhoto={crud.rowToEdit?.photo ?? undefined}
    >
      <ModalImage
        previewOpen={preview.open}
        setPreviewOpen={preview.setOpen}
        previewImage={preview.data}
      />
    </CrudPanelLayout>
  );
};

export default Speaker;
