interface SlotIndicatorProps {
  label: string;
  max: number;
  used: number;
  accent?: boolean;
}

/**
 * Indicador vertical "máximo / usado" para las cabeceras de estadísticas
 * (cupos). Usado en AvailableSlot e IndividualCup.
 */
const SlotIndicator = ({ label, max, used, accent = false }: SlotIndicatorProps) => (
  <div className='flex flex-col items-center gap-1'>
    <span className='text-[10px] font-semibold uppercase tracking-widest text-slate-500'>
      {label}
    </span>
    <div className='flex flex-col items-center gap-0.5'>
      <span
        className={`font-semibold text-sm ${accent ? 'text-[#fbba0e]' : 'text-slate-200'}`}
      >
        {max}
      </span>
      <div className={`w-6 h-px ${accent ? 'bg-[#fbba0e]/30' : 'bg-white/20'}`} />
      <span
        className={`text-xs ${accent ? 'text-[#fbba0e]/60' : 'text-slate-400'}`}
      >
        {used}
      </span>
    </div>
  </div>
);

export default SlotIndicator;
