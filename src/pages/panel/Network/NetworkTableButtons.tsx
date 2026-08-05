import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import type { Network } from '@/types/partners.types';

interface NetworkTableButtonsProps {
  row: Network;
  onEdit?: (row: Network) => void;
  onDelete?: (row: Network) => void;
}

const NetworkTableButtons = ({
  row,
  onEdit,
  onDelete,
}: NetworkTableButtonsProps) => {
  return (
    <div className='flex items-center justify-end gap-1'>
      <Button
        size='sm'
        variant='ghost'
        className='h-8 w-8 p-0 text-slate-400 hover:bg-yellow-500/10 hover:text-yellow-400 transition cursor-pointer'
        onClick={() => onEdit?.(row)}
      >
        <Pencil className='h-3.5 w-3.5' />
      </Button>
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

export default NetworkTableButtons;
