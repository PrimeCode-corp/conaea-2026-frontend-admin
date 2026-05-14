import { useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Mail,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Inbox,
} from 'lucide-react';
import type { ParticipantTableItem } from '@/types/participants.types';
import type { EmailLog } from '@/types/email-log.types';
import { emailLogService } from '@/services/emailLogService';

interface Props {
  open: boolean;
  onClose: () => void;
  participant: ParticipantTableItem | null;
}

type StatusFilter = '' | 'sent' | 'failed' | 'pending' | 'disabled';

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'sent', label: 'Enviados' },
  { value: 'failed', label: 'Fallidos' },
];

const statusConfig = {
  sent: {
    icon: CheckCircle2,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    border: 'border-green-400/20',
    label: 'Enviado',
  },
  failed: {
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/20',
    label: 'Fallido',
  },
};

const formatDate = (iso: string | null) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const SkeletonRow = () => (
  <div className='flex flex-col gap-2 p-4 border-b border-white/5'>
    <div className='flex items-center justify-between'>
      <div className='h-3 w-24 rounded bg-white/5 animate-pulse' />
      <div className='h-5 w-16 rounded bg-white/5 animate-pulse' />
    </div>
    <div className='h-3 w-48 rounded bg-white/5 animate-pulse' />
    <div className='h-3 w-32 rounded bg-white/5 animate-pulse' />
  </div>
);

const EmailLogItem = ({ log }: { log: EmailLog }) => {
  const cfg = log.status === 'sent' ? statusConfig.sent : statusConfig.failed;
  const Icon = cfg.icon;

  return (
    <div className='flex flex-col gap-2 p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors'>
      <div className='flex items-start justify-between gap-3'>
        <p className='text-sm text-slate-200 font-medium leading-snug flex-1'>
          {log.subject}
        </p>
        <span
          className={[
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0',
            cfg.bg,
            cfg.border,
            cfg.color,
          ].join(' ')}
        >
          <Icon className='w-2.5 h-2.5' />
          {cfg.label}
        </span>
      </div>

      <div className='flex items-center gap-3 text-xs text-slate-500'>
        <span className='bg-white/5 px-1.5 py-0.5 rounded text-slate-400'>
          {log.email_type_display}
        </span>
        <span>{formatDate(log.sent_at ?? log.created_at)}</span>
      </div>

      {log.error_message && (
        <div className='flex items-start gap-1.5 mt-1 p-2 rounded-lg bg-red-500/5 border border-red-500/20'>
          <AlertCircle className='w-3 h-3 text-red-400 shrink-0 mt-0.5' />
          <p className='text-xs text-red-400 leading-snug'>{log.error_message}</p>
        </div>
      )}
    </div>
  );
};

const ModalEmailLogs = ({ open, onClose, participant }: Props) => {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');

  useEffect(() => {
    if (!open || !participant) return;
    setLoading(true);
    setLogs([]);
    // "Fallidos" trae todo del backend y excluye los enviados en cliente,
    // para incluir disabled, pending y cualquier otro estado no-sent.
    const apiStatus = statusFilter === 'failed' ? undefined : (statusFilter || undefined);

    emailLogService
      .getByParticipant(participant.id, {
        status: apiStatus,
        page_size: 50,
      })
      .then((data) => {
        const results =
          statusFilter === 'failed'
            ? data.results.filter((log) => log.status !== 'sent')
            : data.results;
        setLogs(results);
        setCount(results.length);
      })
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [open, participant, statusFilter]);

  const handleClose = () => {
    setStatusFilter('');
    setLogs([]);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && handleClose()}>
      <SheetContent
        side='right'
        className='bg-[#111] border-white/10 text-slate-200 w-full sm:max-w-md flex flex-col p-0 gap-0'
      >
        {/* Header */}
        <SheetHeader className='px-5 pt-5 pb-4 border-b border-white/10 shrink-0'>
          <div className='flex items-center gap-2'>
            <div className='w-7 h-7 rounded-lg bg-blue-400/10 border border-blue-400/20 flex items-center justify-center'>
              <Mail className='w-3.5 h-3.5 text-blue-400' />
            </div>
            <SheetTitle className='text-slate-100 font-bold text-base'>
              Historial de emails
            </SheetTitle>
          </div>
          {participant && (
            <SheetDescription className='text-slate-500 text-xs mt-1'>
              <span className='text-slate-300 font-medium'>
                {participant.full_name}
              </span>
              {' · '}
              {participant.email}
            </SheetDescription>
          )}
        </SheetHeader>

        {/* Filtros */}
        <div className='flex items-center gap-1.5 px-5 py-3 border-b border-white/10 shrink-0'>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={[
                'px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors',
                statusFilter === f.value
                  ? 'bg-[#fbba0e] text-black'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
              ].join(' ')}
            >
              {f.label}
            </button>
          ))}
          {count > 0 && (
            <span className='ml-auto text-xs text-slate-600'>
              {count} registro{count !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Lista */}
        <div className='flex-1 overflow-y-auto min-h-0'>
          {loading && (
            <>
              {[1, 2, 3].map((i) => (
                <SkeletonRow key={i} />
              ))}
            </>
          )}

          {!loading && logs.length === 0 && (
            <div className='flex flex-col items-center justify-center py-16 text-center gap-3'>
              <div className='w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center'>
                <Inbox className='w-5 h-5 text-slate-600' />
              </div>
              <p className='text-sm text-slate-500'>Sin registros de email</p>
            </div>
          )}

          {!loading && logs.map((log) => <EmailLogItem key={log.id} log={log} />)}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ModalEmailLogs;
