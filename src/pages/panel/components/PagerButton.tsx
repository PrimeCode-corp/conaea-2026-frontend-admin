import type { LucideIcon } from 'lucide-react';

interface PagerButtonProps {
  icon: LucideIcon;
  onClick?: () => void;
  disabled?: boolean;
  title: string;
}

/**
 * Botón de navegación de paginación (primera/anterior/siguiente/última).
 * Estilo compartido por `FooterPanel` (client-side) y `TablePanel` (server-side).
 */
const PagerButton = ({ icon: Icon, onClick, disabled, title }: PagerButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className='flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer'
  >
    <Icon className='h-3.5 w-3.5' />
  </button>
);

export default PagerButton;
