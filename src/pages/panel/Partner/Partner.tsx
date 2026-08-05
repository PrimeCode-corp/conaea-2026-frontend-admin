import { useEffect, useState } from 'react';
import { Handshake } from 'lucide-react';

import { useClientPagination } from '@/hooks/useClientPagination';
import { useCrudPanel } from '@/hooks/useCrudPanel';
import { useDisclosure } from '@/hooks/useDisclosure';

import LoadingControl from '@/components/LoadingControl';
import CrudPanelLayout from '../components/CrudPanelLayout';
import ModalImage from '../components/modals/ModalImage';
import ModalPartnerNetworks from './modals/ModalPartnerNetworks';

import { usePartnerStore } from '@/store/usePartnerStore';
import type { Partner as PartnerEntity, PartnerType } from '@/types/partners.types';
import { type PartnerForm, emptyForm, buildFormData } from './partner.types';

import PartnerActionButtons from './PartnerActionButtons';
import PartnerTableButtons from './PartnerTableButtons';
import PartnerFilters from './PartnerFilters';

import { getPartnerColumns } from './columns';
import { getPartnerFields } from './fields';

const Partner = () => {
  const {
    partners,
    loading,
    error,
    fetchPartners,
    removePartner,
    updatePartner,
  } = usePartnerStore();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<PartnerType | undefined>(
    undefined,
  );

  const networks = useDisclosure<PartnerEntity>();
  const preview = useDisclosure<string>();

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const columns = getPartnerColumns((url) => preview.show(url));
  const fields = getPartnerFields(partners.map((p) => p.name));

  const filtered = partners.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchType = selectedType ? p.type === selectedType : true;
    return matchSearch && matchType;
  });
  const pagination = useClientPagination(filtered);

  const crud = useCrudPanel<PartnerEntity, PartnerForm, FormData>({
    items: partners,
    remove: removePartner,
    update: updatePartner,
    emptyForm,
    fields,
    // Al editar, su propio nombre no cuenta como duplicado.
    getEditFields: (partner) =>
      getPartnerFields(
        partners.filter((p) => p.id !== partner.id).map((p) => p.name),
      ),
    mapToForm: (p) => ({
      type: p.type,
      name: p.name,
      description: p.description,
      logo: null, // sin archivo nuevo el campo no se envía
    }),
    toPayload: buildFormData,
    fieldErrors: true,
    messages: {
      deleteSuccess: 'Auspiciador eliminado correctamente.',
      deleteError: 'Error al eliminar el auspiciador. Intenta nuevamente.',
      editSuccess: 'Auspiciador actualizado correctamente.',
      editError: 'Error al actualizar el auspiciador. Intenta nuevamente.',
    },
  });

  if (loading) return <LoadingControl />;
  if (error) return <p className='text-red-400 p-8'>{error}</p>;

  return (
    <CrudPanelLayout
      description='Gestión de Auspiciadores'
      icon={<Handshake className='h-5 w-5 text-black' />}
      toolbar={
        <>
          <PartnerActionButtons onCreated={networks.show} />
          <PartnerFilters
            selectedType={selectedType}
            onTypeChange={setSelectedType}
          />
        </>
      }
      search={search}
      setSearch={setSearch}
      searchPlaceholder='Buscar auspiciador...'
      columns={columns}
      data={pagination.paginated}
      renderRowActions={(row) => (
        <PartnerTableButtons
          row={row as PartnerEntity}
          onNetworks={networks.show}
          onEdit={crud.onEdit}
          onDelete={crud.onDelete}
        />
      )}
      filtered={filtered.length}
      total={partners.length}
      pagination={pagination}
      deleteModal={crud.deleteModal}
      deleteTitle='Eliminar auspiciador'
      editModal={crud.editModal}
      editTitle='Editar Auspiciador'
      editDescription='Edita los campos del auspiciador.'
      editIcon={<Handshake className='h-4 w-4 text-black' />}
      editFields={crud.editFields}
      editCurrentPhoto={crud.rowToEdit?.logo ?? undefined}
    >
      <ModalPartnerNetworks
        open={networks.open}
        onClose={networks.hide}
        partner={networks.data}
      />

      <ModalImage
        previewOpen={preview.open}
        setPreviewOpen={preview.setOpen}
        previewImage={preview.data}
      />
    </CrudPanelLayout>
  );
};

export default Partner;
