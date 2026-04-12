import { Button } from '@/components/ui/button';
import { Folder, Trash2 } from 'lucide-react';
import type { ParticipantTableItem } from '@/types/participants.types';

interface ParticipantTableButtonsProps {
  row: ParticipantTableItem;
  onDocuments?: (row: ParticipantTableItem) => void;
  onEdit?: (row: ParticipantTableItem) => void;
  onDelete?: (row: ParticipantTableItem) => void;
}

const ParticipantTableButtons = ({
  row,
  onDocuments,
  // onEdit,
  onDelete,
}: ParticipantTableButtonsProps) => {
  return (
    <div className='flex items-center justify-end gap-1'>
      {/* <Button
        size='sm'
        variant='ghost'
        className='h-8 w-8 p-0 text-slate-400 hover:bg-white/5 hover:text-slate-200 transition'
        onClick={() => onEdit?.(row)}
      >
        <Pencil className='h-3.5 w-3.5' />
      </Button> */}
      <Button
        size='sm'
        variant='ghost'
        className='h-8 w-8 p-0 text-slate-400 hover:bg-blue-500/10 hover:text-blue-400 transition'
        onClick={() => onDocuments?.(row)}
      >
        <Folder className='h-3.5 w-3.5' />
      </Button>
      <Button
        size='sm'
        variant='ghost'
        className='h-8 w-8 p-0 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition'
        onClick={() => onDelete?.(row)}
      >
        <Trash2 className='h-3.5 w-3.5' />
      </Button>
    </div>
  );
};

export default ParticipantTableButtons;
