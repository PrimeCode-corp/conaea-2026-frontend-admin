import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { Toaster, toast } from 'sonner';

import HeaderPanel from '../components/HeaderPanel';
import TablePanel from '../components/TablePanel';
import SearchPanel from '../components/SearchPanel';
import LoadingControl from '@/components/LoadingControl';
import ModalDelete from '../components/modals/ModalDelete';

import { useParticipantStore } from '@/store/useParticipantStore';
import ParticipantFilters from './ParticipantFilters';
import { getParticipantColumns } from './columns';
import ParticipantTableButtons from './ParticipantTableButtons';
import type { ParticipantTableItem } from '@/types/participants.types';
import ModalDocuments from './modals/ModalDocuments';
import ModalEditParticipant from './modals/ModalEditParticipant';

type Row = Record<string, unknown>;

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

  const [search, setSearch] = useState('');
  const [selectedPreSaleId, setSelectedPreSaleId] = useState<
    number | undefined
  >(undefined);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('');
  const [selectedQuotaTypeId, setSelectedQuotaTypeId] = useState<
    number | undefined
  >(undefined);
  const [selectedUniversityType, setSelectedUniversityType] =
    useState<string>('');
  const [documentsOpen, setDocumentsOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] =
    useState<ParticipantTableItem | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [selectedEditParticipant, setSelectedEditParticipant] =
    useState<ParticipantTableItem | null>(null);

  // --- Modal Eliminar ---
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState(false);

  const params = {
    search: search || undefined,
    pre_sale_id: selectedPreSaleId,
    document_type: selectedDocumentType as 'DNI' | 'PASAPORTE' | undefined,
    quota_type_id: selectedQuotaTypeId,
    university_type: selectedUniversityType as
      | 'Referido'
      | 'General'
      | undefined,
  };

  useEffect(() => {
    const timeout = setTimeout(
      () => fetchParticipants(1, params),
      search ? 400 : 0,
    );
    return () => clearTimeout(timeout);
  }, [
    search,
    selectedPreSaleId,
    selectedDocumentType,
    selectedQuotaTypeId,
    selectedUniversityType,
  ]);

  const handleDeleteRequest = (row: ParticipantTableItem) => {
    setRowToDelete(row as unknown as Row);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!rowToDelete) return;
    setDeleting(true);
    try {
      await removeParticipant(rowToDelete.id as number);
      toast.success('Participante eliminado correctamente.');
      setConfirmOpen(false);
      setRowToDelete(null);
      fetchParticipants(page, params);
    } catch {
      toast.error('Error al eliminar el participante. Intenta nuevamente.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setConfirmOpen(false);
    setRowToDelete(null);
  };

  const handleDocumentsRequest = (row: ParticipantTableItem) => {
    setSelectedParticipant(row);
    setDocumentsOpen(true);
  };

  const handleEditRequest = (row: ParticipantTableItem) => {
    setSelectedEditParticipant(row);
    setEditOpen(true);
  };

  const columns = getParticipantColumns();

  if (loading) return <LoadingControl />;
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
            universityType={selectedUniversityType}
            onPreSaleChange={(val) =>
              setSelectedPreSaleId(val ? Number(val) : undefined)
            }
            onDocumentTypeChange={setSelectedDocumentType}
            onQuotaTypeChange={(val) =>
              setSelectedQuotaTypeId(val ? Number(val) : undefined)
            }
            onUniversityTypeChange={setSelectedUniversityType}
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
              onEdit={handleEditRequest}
              onDocuments={handleDocumentsRequest}
              onDelete={handleDeleteRequest}
            />
          )}
        </TablePanel>
      </div>

      <ModalDelete
        open={confirmOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title='Eliminar participante'
        description={rowToDelete?.full_name as string}
      />

      <ModalDocuments
        open={documentsOpen}
        onClose={() => {
          setDocumentsOpen(false);
          setSelectedParticipant(null);
        }}
        participant={selectedParticipant}
      />

      <ModalEditParticipant
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setSelectedEditParticipant(null);
        }}
        participant={selectedEditParticipant}
      />

      <Toaster position='bottom-right' richColors theme='dark' />
    </>
  );
};

export default Participant;
