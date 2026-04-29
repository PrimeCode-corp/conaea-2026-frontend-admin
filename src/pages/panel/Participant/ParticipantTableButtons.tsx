import { Button } from '@/components/ui/button';
import { CheckCheck, Folder, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { ParticipantTableItem } from '@/types/participants.types';
import { useParticipantStore } from '@/store/useParticipantStore';

interface ParticipantTableButtonsProps {
  row: ParticipantTableItem;
  onDocuments?: (row: ParticipantTableItem) => void;
  onDelete?: (row: ParticipantTableItem) => void;
  onEdit?: (row: ParticipantTableItem) => void; // 👈
}

const ParticipantTableButtons = ({
  row,
  onDocuments,
  onDelete,
  onEdit,
}: ParticipantTableButtonsProps) => {
  const { toggleRegistrationValidation } = useParticipantStore();
  const [validating, setValidating] = useState(false);

  const isGeneral = row.quota_type === 'General';

  const allEnrollmentsValidated =
    isGeneral ||
    (row.enrollments.length > 0 &&
      row.enrollments.every((e) => e.is_validated));

  const allVouchersValidated =
    row.vouchers.length > 0 && row.vouchers.every((v) => v.is_validated);

  const canValidate = allEnrollmentsValidated && allVouchersValidated;

  const handleValidate = async () => {
    setValidating(true);
    try {
      await toggleRegistrationValidation(row.id);
      toast.success(
        row.is_validated
          ? 'Validación removida correctamente.'
          : 'Participante validado correctamente.',
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error al validar';
      toast.error(message);
    } finally {
      setValidating(false);
    }
  };

  const tooltipMessage =
    !allEnrollmentsValidated && !allVouchersValidated
      ? 'Valida la ficha y el voucher primero'
      : !allEnrollmentsValidated
        ? 'Valida la ficha primero'
        : !allVouchersValidated
          ? 'Valida el voucher primero'
          : null;

  return (
    <div className='flex items-center justify-end gap-1'>
      {/* Validar */}
      <div className='relative group'>
        <Button
          size='sm'
          variant='ghost'
          disabled={!canValidate || validating}
          className={[
            'h-8 w-8 p-0 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer',
            row.is_validated
              ? 'text-green-400 hover:bg-green-500/10 hover:text-green-300'
              : 'text-slate-400 hover:bg-green-500/10 hover:text-green-400',
          ].join(' ')}
          onClick={handleValidate}
        >
          <CheckCheck className='h-3.5 w-3.5' />
        </Button>

        {tooltipMessage && (
          <div className='absolute bottom-full right-0 mb-1.5 px-2 py-1 rounded-md text-xs font-semibold whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-[#111] border border-white/10 text-slate-200 z-10'>
            {tooltipMessage}
          </div>
        )}
      </div>

      {/* Editar */}
      <Button
        size='sm'
        variant='ghost'
        className='h-8 w-8 p-0 text-slate-400 hover:bg-yellow-500/10 hover:text-yellow-400 transition cursor-pointer'
        onClick={() => onEdit?.(row)}
      >
        <Pencil className='h-3.5 w-3.5' />
      </Button>

      {/* Documentos */}
      <Button
        size='sm'
        variant='ghost'
        className='h-8 w-8 p-0 text-slate-400 hover:bg-blue-500/10 hover:text-blue-400 transition cursor-pointer'
        onClick={() => onDocuments?.(row)}
      >
        <Folder className='h-3.5 w-3.5' />
      </Button>

      {/* Eliminar */}
      <Button
        size='sm'
        variant='ghost'
        className='h-8 w-8 p-0 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition cursor-pointer'
        onClick={() => onDelete?.(row)}
      >
        <Trash2 className='h-3.5 w-3.5' />
      </Button>
    </div>
  );
};

export default ParticipantTableButtons;
