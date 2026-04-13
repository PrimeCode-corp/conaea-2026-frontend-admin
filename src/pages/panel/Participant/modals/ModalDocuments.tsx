import { useRef, useState } from 'react';
import {
  FileText,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Pencil,
  CheckCircle,
  Trash,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ParticipantTableItem } from '@/types/participants.types';
import { useVoucherStore } from '@/store/useTransactionStore';
import { useEnrollmentStore } from '@/store/useEnrollmentStore';
import { useParticipantStore } from '@/store/useParticipantStore';
import { toast } from 'sonner';
import ModalPayDetail from './ModalPayDetail';

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
  const {
    updateVoucher,
    updateVoucherDetails,
    updating: updatingVoucher,
    updatingDetails,
  } = useVoucherStore();

  const { updateEnrollment, updating: updatingEnrollment } =
    useEnrollmentStore();

  const {
    invalidate,
    participants,
    toggleEnrollmentValidation,
    toggleTransactionValidation,
  } = useParticipantStore();

  const enrollmentInputRef = useRef<HTMLInputElement>(null);

  const voucherInputRef = useRef<HTMLInputElement>(null);

  const lastParticipantRef = useRef<ParticipantTableItem | null>(null); // 👈

  const [step, setStep] = useState(1);

  const [voucherIndex, setVoucherIndex] = useState(0);

  const [detailsOpen, setDetailsOpen] = useState(false);

  const [detailsForm, setDetailsForm] = useState({
    payment_method: '',
    mount: '',
    payment_date: '',
  });

  const [validatingEnrollment, setValidatingEnrollment] = useState(false);

  const [validatingTransaction, setValidatingTransaction] = useState(false);

  const liveParticipant =
    participants.find((p) => p.id === participant?.id) ?? participant;

  if (liveParticipant) {
    lastParticipantRef.current = liveParticipant; // 👈 guarda el último valor válido
  }

  const handleOpenDetails = () => {
    const v = stableParticipant?.vouchers[voucherIndex];
    setDetailsForm({
      payment_method: v?.payment_method || '',
      mount: v?.mount || '',
      payment_date: v?.payment_date || '',
    });
    setDetailsOpen(true);
  };

  const stableParticipant = lastParticipantRef.current;

  if (!stableParticipant) return null;

  const enrollment = stableParticipant.enrollments?.[0];

  const handleClose = () => {
    setStep(1);
    setVoucherIndex(0);
    onClose();
  };

  const handleReplaceEnrollment = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !enrollment) return;
    try {
      await updateEnrollment(enrollment.id, file);
      toast.success('Ficha actualizada correctamente.');
      await invalidate();
    } catch {
      toast.error('Error al actualizar la ficha.');
    } finally {
      e.target.value = '';
    }
  };

  const handleReplaceVoucher = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const currentVoucher = stableParticipant.vouchers[voucherIndex];
    try {
      await updateVoucher(currentVoucher.id, file);
      toast.success('Voucher actualizado correctamente.');
      await invalidate();
    } catch {
      toast.error('Error al actualizar el voucher.');
    } finally {
      e.target.value = '';
    }
  };

  const handleSaveDetails = async () => {
    const currentVoucher = stableParticipant.vouchers[voucherIndex];
    try {
      await updateVoucherDetails(currentVoucher.id, {
        payment_method: detailsForm.payment_method,
        mount: detailsForm.mount,
        payment_date: detailsForm.payment_date,
      });
      toast.success('Detalles actualizados correctamente.');
      setDetailsOpen(false);
      await invalidate();
    } catch {
      toast.error('Error al actualizar los detalles.');
    }
  };

  const handleValidateEnrollment = async () => {
    if (!enrollment) return;
    setValidatingEnrollment(true);
    try {
      await toggleEnrollmentValidation(enrollment.id);
      toast.success('Ficha validada correctamente.');
    } catch {
      toast.error('Error al validar la ficha.');
    } finally {
      setValidatingEnrollment(false);
    }
  };

  const handleValidateTransaction = async () => {
    const currentVoucher = stableParticipant.vouchers[voucherIndex];
    setValidatingTransaction(true);
    try {
      await toggleTransactionValidation(currentVoucher.id);
      toast.success('Voucher validado correctamente.');
    } catch {
      toast.error('Error al validar el voucher.');
    } finally {
      setValidatingTransaction(false);
    }
  };

  const hasVouchers = stableParticipant.vouchers?.length > 0;

  const currentVoucher = hasVouchers
    ? stableParticipant.vouchers[voucherIndex]
    : null;

  const buttonVoucher = stableParticipant?.vouchers[voucherIndex];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='bg-[#1a1a1a] border border-white/10 text-slate-200 max-w-2xl md:min-w-3xl'>
        <DialogHeader>
          <DialogTitle className='text-slate-100 font-bold'>
            {stableParticipant.identity_document} -{' '}
            {stableParticipant.full_name}
          </DialogTitle>
        </DialogHeader>

        {/* Steps indicator */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
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

          {/* Badge según el step activo */}
          {step === 1 && enrollment && (
            <div
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold',
                enrollment?.is_validated
                  ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                  : 'bg-red-500/10 border border-red-500/20 text-red-400',
              ].join(' ')}
            >
              <CheckCircle className='w-3.5 h-3.5' />
              {enrollment.is_validated ? 'Ficha validada' : 'Ficha sin validar'}
            </div>
          )}

          {step === 2 && currentVoucher && (
            <div
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold',
                currentVoucher.is_validated
                  ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                  : 'bg-red-500/10 border border-red-500/20 text-red-400',
              ].join(' ')}
            >
              <CheckCircle className='w-3.5 h-3.5' />
              {currentVoucher.is_validated
                ? 'Voucher validado'
                : 'Voucher sin validar'}
            </div>
          )}
        </div>

        {/* Content */}
        <div className='min-h-[400px] flex flex-col items-center justify-center bg-black/20 rounded-xl border border-white/5 p-4'>
          {/* Step 1 — Ficha de matrícula */}
          {step === 1 &&
            (enrollment ? (
              <div className='flex flex-col w-full gap-4'>
                <iframe
                  src={enrollment.archive}
                  className='w-full h-[400px] rounded-lg'
                  title='Ficha de matrícula'
                />
                <div className='flex items-center justify-between w-full'>
                  <input
                    ref={enrollmentInputRef}
                    type='file'
                    accept='.pdf'
                    className='hidden'
                    onChange={handleReplaceEnrollment}
                  />
                  <button
                    onClick={() => enrollmentInputRef.current?.click()}
                    disabled={updatingEnrollment}
                    className='cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-slate-400 hover:bg-white/10 transition-all disabled:opacity-50 w-fit'
                  >
                    <RefreshCw
                      className={[
                        'w-3.5 h-3.5',
                        updatingEnrollment ? 'animate-spin' : '',
                      ].join(' ')}
                    />
                    Reemplazar
                  </button>

                  <button
                    onClick={handleValidateEnrollment}
                    disabled={validatingEnrollment}
                    className={[
                      'cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 w-fit bg-blue-500/10 text-blue-400 hover:bg-blue-500/20',
                    ].join(' ')}
                  >
                    {validatingTransaction ? (
                      'Procesando...'
                    ) : buttonVoucher?.is_validated ? (
                      <p className='flex items-center gap-1'>
                        <Trash className='size-3' /> Invalidar
                      </p>
                    ) : (
                      <p className='flex items-center gap-1'>
                        <CheckCircle className='size-3' /> Validar
                      </p>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <p className='text-slate-500 text-sm'>Sin ficha de matrícula</p>
            ))}

          {/* Step 2 — Voucher de pago */}
          {step === 2 &&
            (stableParticipant.vouchers?.length > 0 ? (
              <div className='flex gap-3 w-full h-full'>
                {/* Lista de vouchers (solo si hay más de uno) */}
                {stableParticipant.vouchers.length > 1 && (
                  <div className='flex flex-col gap-2 w-36 shrink-0'>
                    {stableParticipant.vouchers.map((v, i) => (
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

                {/* Imagen del voucher */}
                <div className='flex-1 flex flex-col items-center gap-3'>
                  <div className='flex flex-col gap-3 justify-center items-center'>
                    <img
                      src={stableParticipant.vouchers[voucherIndex].voucher}
                      alt='Voucher'
                      className='max-h-[420px] object-contain rounded-lg'
                    />
                    <div className='flex items-center gap-4 text-xs text-slate-400'>
                      <span className='capitalize'>
                        {
                          stableParticipant.vouchers[voucherIndex]
                            .payment_method
                        }
                      </span>
                      <span className='font-bold text-green-400'>
                        S/ {stableParticipant.vouchers[voucherIndex].mount}
                      </span>
                      <span>
                        {(() => {
                          const raw =
                            stableParticipant.vouchers[voucherIndex]
                              .payment_date;
                          if (!raw) return '0/0/0000';
                          const [year, month, day] = raw
                            .slice(0, 10)
                            .split('-');
                          return `${day}/${month}/${year}`;
                        })()}
                      </span>
                      <button
                        onClick={handleOpenDetails}
                        className='cursor-pointer flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-all'
                      >
                        <Pencil className='w-3 h-3' />
                        Editar
                      </button>
                    </div>

                    <ModalPayDetail
                      open={detailsOpen}
                      onOpenChange={setDetailsOpen}
                      form={detailsForm}
                      onFormChange={setDetailsForm}
                      onSave={handleSaveDetails}
                      loading={updatingDetails}
                    />
                  </div>

                  <div className='w-full flex justify-between'>
                    <input
                      ref={voucherInputRef}
                      type='file'
                      accept='.jpg,.jpeg,.png'
                      className='hidden'
                      onChange={handleReplaceVoucher}
                    />
                    <button
                      onClick={() => voucherInputRef.current?.click()}
                      disabled={updatingVoucher}
                      className='cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-slate-400 hover:bg-white/10 transition-all disabled:opacity-50 w-fit'
                    >
                      <RefreshCw
                        className={[
                          'w-3.5 h-3.5',
                          updatingVoucher ? 'animate-spin' : '',
                        ].join(' ')}
                      />
                      Reemplazar
                    </button>

                    <button
                      onClick={handleValidateTransaction}
                      disabled={validatingTransaction}
                      className={[
                        'cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 w-fit bg-blue-500/10 text-blue-400 hover:bg-blue-500/20',
                      ].join(' ')}
                    >
                      {validatingTransaction ? (
                        'Procesando...'
                      ) : stableParticipant.vouchers[voucherIndex]
                          .is_validated ? (
                        <p className='flex items-center gap-1'>
                          <Trash className='size-3' /> Invalidar
                        </p>
                      ) : (
                        <p className='flex items-center gap-1'>
                          <CheckCircle className='size-3' /> Validar
                        </p>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className='text-slate-500 text-sm'>
                No se han realizado pagos
              </p>
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
            className='cursor-pointer flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all'
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
