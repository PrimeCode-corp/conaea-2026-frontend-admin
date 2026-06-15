import { useEffect, useRef, useState } from 'react';
import { Users } from 'lucide-react';
import { Toaster, toast } from 'sonner';

import HeaderPanel from '../components/HeaderPanel';
import TablePanel from '../components/TablePanel';
import FooterPanel from '../components/FooterPanel';
import SearchPanel from '../components/SearchPanel';
import ModalDelete from '../components/modals/ModalDelete';
import { getServerFooterProps } from '@/utils/pagination';

import { useParticipantStore } from '@/store/useParticipantStore';
import { useDisclosure } from '@/hooks/useDisclosure';
import ParticipantFilters from './ParticipantFilters';
import { getParticipantColumns } from './columns';
import ParticipantTableButtons from './ParticipantTableButtons';
import type { ParticipantTableItem } from '@/types/participants.types';
import ModalDocuments from './modals/ModalDocuments';
import ModalEditParticipant from './modals/ModalEditParticipant';
import ModalEmailLogs from './modals/ModalEmailLogs';
import ModalImage from '../components/modals/ModalImage';

const Participant = () => {
  const {
    participants,
    meta,
    page,
    loading,
    error,
    fetchParticipants,
    removeParticipant,
  } = useParticipantStore();

  const [initialized, setInitialized] = useState(false);
  const initializedRef = useRef(false);

  const [search, setSearch] = useState('');
  const [selectedPreSaleId, setSelectedPreSaleId] = useState<
    number | undefined
  >(undefined);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('');
  const [selectedQuotaTypeId, setSelectedQuotaTypeId] = useState<
    number | undefined
  >(undefined);
  const [selectedUniversityCode, setSelectedUniversityCode] =
    useState<string>('');
  const documents = useDisclosure<ParticipantTableItem>();
  const edit = useDisclosure<ParticipantTableItem>();
  const emailLogs = useDisclosure<ParticipantTableItem>();
  const preview = useDisclosure<string>();

  // --- Modal Eliminar ---
  const del = useDisclosure<ParticipantTableItem>();
  const [deleting, setDeleting] = useState(false);

  const params = {
    search: search || undefined,
    pre_sale_id: selectedPreSaleId,
    document_type: selectedDocumentType as 'DNI' | 'PASAPORTE' | undefined,
    quota_type_id: selectedQuotaTypeId,
    university_code: selectedUniversityCode || undefined,
  };

  useEffect(() => {
    const init = async () => {
      await fetchParticipants(1);
      const { preSales } = useParticipantStore.getState();
      const def = preSales.find((p) => p.is_default);
      if (def) {
        setSelectedPreSaleId(def.id);
        await fetchParticipants(1, { pre_sale_id: def.id });
      }
      initializedRef.current = true;
      setInitialized(true);
    };
    init();
  }, [fetchParticipants]);

  useEffect(() => {
    if (!initializedRef.current) return;
    const timeout = setTimeout(
      () => fetchParticipants(1, params),
      search ? 400 : 0,
    );
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    search,
    selectedPreSaleId,
    selectedDocumentType,
    selectedQuotaTypeId,
    selectedUniversityCode,
  ]);

  const handleDeleteConfirm = async () => {
    if (!del.data) return;
    setDeleting(true);
    try {
      await removeParticipant(del.data.id);
      toast.success('Participante eliminado correctamente.');
      del.hide();
    } catch {
      toast.error('Error al eliminar el participante. Intenta nuevamente.');
    } finally {
      setDeleting(false);
    }
  };

  const columns = getParticipantColumns((url) => preview.show(url));

  if (error) return <p className='text-red-400 p-8'>{error}</p>;

  return (
    <>
      <HeaderPanel
        title='Panel de Control'
        description='Gestión de Participantes'
        icon={<Users className='h-5 w-5 text-black' />}
      />

      <div className='rounded-2xl border border-white/10 bg-[#1a1a1a] shadow-xl'>
        <div className='flex flex-col gap-3 border-b border-white/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between'>
          <ParticipantFilters
            preSaleId={selectedPreSaleId?.toString() ?? ''}
            documentType={selectedDocumentType}
            quotaTypeId={selectedQuotaTypeId?.toString() ?? ''}
            universityCode={selectedUniversityCode}
            onPreSaleChange={(val) =>
              setSelectedPreSaleId(val ? Number(val) : undefined)
            }
            onDocumentTypeChange={setSelectedDocumentType}
            onQuotaTypeChange={(val) =>
              setSelectedQuotaTypeId(val ? Number(val) : undefined)
            }
            onUniversityCodeChange={setSelectedUniversityCode}
          />
          <SearchPanel
            search={search}
            setSearch={setSearch}
            placeholder='Buscar participantes...'
          />
        </div>

        <TablePanel
          columns={columns}
          data={participants as unknown as Record<string, unknown>[]}
          loading={loading || !initialized}
          pagination={
            meta
              ? {
                  count: meta.count,
                  next: meta.next,
                  previous: meta.previous,
                  page,
                  onPageChange: (p) => fetchParticipants(p, params),
                  pageSize: 10,
                }
              : undefined
          }
        >
          {(row) => (
            <ParticipantTableButtons
              row={row as unknown as ParticipantTableItem}
              onEdit={edit.show}
              onDocuments={documents.show}
              onDelete={del.show}
              onEmailLogs={emailLogs.show}
            />
          )}
        </TablePanel>

        <FooterPanel
          {...getServerFooterProps(meta, page, (p) =>
            fetchParticipants(p, params),
          )}
        />
      </div>

      <ModalDelete
        open={del.open}
        onClose={del.hide}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title='Eliminar participante'
        description={del.data?.full_name}
      />

      <ModalDocuments
        open={documents.open}
        onClose={documents.hide}
        participant={documents.data}
      />

      <ModalEditParticipant
        open={edit.open}
        onClose={edit.hide}
        participant={edit.data}
      />

      <ModalEmailLogs
        open={emailLogs.open}
        onClose={emailLogs.hide}
        participant={emailLogs.data}
      />

      <ModalImage
        previewOpen={preview.open}
        setPreviewOpen={preview.setOpen}
        previewImage={preview.data}
      />

      <Toaster position='bottom-right' richColors theme='dark' />
    </>
  );
};

export default Participant;
