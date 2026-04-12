import { useState } from 'react';
import { FileText, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ParticipantTableItem } from '@/types/participants.types';

interface ModalDocumentsProps {
  open: boolean;
  onClose: () => void;
  participant: ParticipantTableItem | null;
}

const STEPS = [
  { id: 1, label: 'Ficha de matrícula', icon: FileText },
  { id: 2, label: 'Voucher de pago', icon: CreditCard },
];

const ModalDocuments = ({
  open,
  onClose,
  participant,
}: ModalDocumentsProps) => {
  const [step, setStep] = useState(1);
  const [voucherIndex, setVoucherIndex] = useState(0);

  if (!participant) return null;

  const enrollment = participant.enrollments?.[0];

  const handleClose = () => {
    setStep(1);
    setVoucherIndex(0);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='bg-[#1a1a1a] border border-white/10 text-slate-200 max-w-2xl md:min-w-3xl'>
        <DialogHeader>
          <DialogTitle className='text-slate-100 font-bold'>
            {participant.identity_document} - {participant.full_name}
          </DialogTitle>
        </DialogHeader>

        {/* Steps indicator */}
        <div className='flex items-center gap-2 mb-4'>
          {STEPS.map((s, i) => (
            <div key={s.id} className='flex items-center gap-2'>
              <button
                onClick={() => setStep(s.id)}
                className={[
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                  step === s.id
                    ? 'bg-[#fbba0e] text-black'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10',
                ].join(' ')}
              >
                <s.icon className='w-3.5 h-3.5' />
                {s.label}
              </button>
              {i < STEPS.length - 1 && (
                <ChevronRight className='w-3.5 h-3.5 text-slate-600' />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className='min-h-[400px] flex flex-col items-center justify-center bg-black/20 rounded-xl border border-white/5 p-4'>
          {step === 1 &&
            (enrollment ? (
              <iframe
                src={enrollment.archive}
                className='w-full h-[400px] rounded-lg'
                title='Ficha de matrícula'
              />
            ) : (
              <p className='text-slate-500 text-sm'>Sin ficha de matrícula</p>
            ))}

          {step === 2 &&
            (participant.vouchers?.length > 0 ? (
              <div className='flex gap-3 w-full h-full'>
                {/* ── Lista de pagos (solo si hay más de uno) ── */}
                {participant.vouchers.length > 1 && (
                  <div className='flex flex-col gap-2 w-36 shrink-0'>
                    {participant.vouchers.map((v, i) => (
                      <button
                        key={v.id}
                        onClick={() => setVoucherIndex(i)}
                        className={[
                          'flex flex-col px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer',
                          voucherIndex === i
                            ? 'bg-[#fbba0e]/10 border border-[#fbba0e]/30 text-[#fbba0e]'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10',
                        ].join(' ')}
                      >
                        <span className='capitalize'>{v.payment_method}</span>
                        <span className='font-bold text-green-400'>
                          S/ {v.mount}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* ── Imagen del voucher ── */}
                <div className='flex-1 flex flex-col items-center gap-3'>
                  <img
                    src={participant.vouchers[voucherIndex].voucher}
                    alt='Voucher'
                    className='max-h-[420px] object-contain rounded-lg'
                  />
                  <div className='flex items-center gap-4 text-xs text-slate-400'>
                    <span className='capitalize'>
                      {participant.vouchers[voucherIndex].payment_method}
                    </span>
                    <span className='font-bold text-green-400'>
                      S/ {participant.vouchers[voucherIndex].mount}
                    </span>
                    <span>
                      {new Date(
                        participant.vouchers[voucherIndex].created_at,
                      ).toLocaleDateString('es-PE')}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className='text-slate-500 text-sm'>Sin voucher de pago</p>
            ))}
        </div>

        {/* Navigation */}
        <div className='flex items-center justify-between mt-2'>
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className='flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer'
          >
            <ChevronLeft className='w-3.5 h-3.5' />
            Anterior
          </button>
          <span className='text-xs text-slate-500'>
            {step} / {STEPS.length}
          </span>
          <button
            onClick={() => setStep((s) => Math.min(STEPS.length, s + 1))}
            disabled={step === STEPS.length}
            className='flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer'
          >
            Siguiente
            <ChevronRight className='w-3.5 h-3.5' />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalDocuments;
