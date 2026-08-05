import { Button } from '@/components/ui/button';
import { Pencil, Share2, Trash2 } from 'lucide-react';
import type { Partner } from '@/types/partners.types';

interface PartnerTableButtonsProps {
  row: Partner;
  onNetworks?: (row: Partner) => void;
  onEdit?: (row: Partner) => void;
  onDelete?: (row: Partner) => void;
}

const PartnerTableButtons = ({
  row,
  onNetworks,
  onEdit,
  onDelete,
}: PartnerTableButtonsProps) => {
  return (
    <div className='flex items-center justify-end gap-1'>
      {/* Redes sociales */}
      <Button
        size='sm'
        variant='ghost'
        className='h-8 w-8 p-0 text-slate-400 hover:bg-indigo-500/10 hover:text-indigo-400 transition cursor-pointer'
        onClick={() => onNetworks?.(row)}
      >
        <Share2 className='h-3.5 w-3.5' />
      </Button>

      {/* Editar */}
      <Button
        size='sm'
        variant='ghost'
        className='h-8 w-8 p-0 text-slate-400 hover:bg-yellow-500/10 hover:text-yellow-400 transition cursor-pointer'
        onClick={() => onEdit?.(row)}
      >
        <Pencil className='h-3.5 w-3.5' />
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

export default PartnerTableButtons;
