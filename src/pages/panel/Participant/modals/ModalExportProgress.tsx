import { Download } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatBytes } from '@/utils/fileDownload';

/** Etapa del lado del cliente, no la `phase` que manda el backend. */
export type ExportStage = 'starting' | 'processing' | 'downloading';

export type ExportFormat = 'zip' | 'xlsx';

export interface ExportProgressState {
  stage: ExportStage;
  format: ExportFormat;
  /** Avance real de 0 a 100. */
  percent: number;
  /** Milisegundos restantes estimados con el ritmo medido, o `null`. */
  etaMs: number | null;
  /** Expedientes ya armados por el servidor. */
  processed: number;
  /** Participantes que entran en la exportación. */
  total: number | null;
  /** Etapa que reporta el backend (`Descargando archivos`). */
  phaseLabel: string | null;
  /** Bytes recibidos del `.zip` (solo en `downloading`). */
  written: number;
  /** Tamaño del `.zip`, si vino `Content-Length`. */
  size: number | null;
}

interface ModalExportProgressProps {
  open: boolean;
  progress: ExportProgressState;
  cancelling: boolean;
  onCancel: () => void;
}

/** `195000` → `≈ 3 min 15 s restantes`. */
const formatEta = (ms: number) => {
  const seconds = Math.max(0, Math.round(ms / 1000));
  if (seconds < 60) return `≈ ${seconds} s restantes`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest === 0
    ? `≈ ${minutes} min restantes`
    : `≈ ${minutes} min ${rest} s restantes`;
};

/**
 * Progreso de la exportación en `.zip`. No se puede cerrar con Escape ni
 * haciendo clic fuera: la única salida es cancelar, que detiene el trabajo en
 * el servidor.
 */
const ModalExportProgress = ({
  open,
  progress,
  cancelling,
  onCancel,
}: ModalExportProgressProps) => {
  const {
    stage,
    format,
    percent,
    etaMs,
    processed,
    total,
    phaseLabel,
    written,
    size,
  } = progress;

  // El Excel es síncrono: no hay avance que reportar hasta que llega el
  // archivo. Mientras tanto, y mientras el .zip no tenga un solo expediente
  // armado, una barra clavada en 0% no distingue "arrancando" de "colgado", así
  // que ahí mostramos la animación indeterminada.
  const indeterminate =
    stage === 'starting' || (stage === 'processing' && processed === 0);
  const rounded = Math.min(100, Math.round(percent));

  const description =
    stage === 'downloading'
      ? 'Descargando el archivo. No cierres esta ventana hasta que termine.'
      : format === 'xlsx'
        ? 'Generando la hoja de cálculo con los datos y los enlaces...'
        : stage === 'starting'
          ? 'Iniciando la exportación...'
          : (phaseLabel ??
            'El servidor está armando el .zip con las fotos, los QR y los documentos.');

  const detail =
    stage === 'downloading'
      ? size
        ? `${formatBytes(written)} de ${formatBytes(size)}`
        : `${formatBytes(written)} descargados`
      : total
        ? `${processed} de ${total} expedientes`
        : format === 'xlsx'
          ? 'Sin archivos que descargar: solo datos y enlaces'
          : 'Preparando...';

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className='bg-[#1a1a1a] border border-white/10 text-slate-200 sm:max-w-md'
      >
        <DialogHeader>
          <div className='flex items-center gap-3 mb-1'>
            <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-[#fbba0e]/10 border border-[#fbba0e]/20'>
              <Download className='h-4 w-4 text-[#fbba0e]' />
            </div>
            <DialogTitle className='text-slate-100 text-lg font-semibold'>
              Exportando participantes
            </DialogTitle>
          </div>
          <p className='text-sm text-slate-400 pl-12'>
            {cancelling ? 'Cancelando la exportación...' : description}
          </p>
        </DialogHeader>

        <div className='flex flex-col gap-2'>
          <div className='relative h-6 w-full overflow-hidden rounded-full bg-white/5 border border-white/10'>
            {indeterminate ? (
              <div className='h-full w-1/3 bg-[#fbba0e]/70 animate-progress-loop' />
            ) : (
              <div
                className='h-full bg-[#fbba0e] transition-[width] duration-300 ease-linear'
                style={{ width: `${rounded}%` }}
              />
            )}

            {/* El texto va centrado sobre la barra: a partir del 50% queda
                encima del relleno amarillo y pasa a negro para que se lea. */}
            <span
              className={[
                'absolute inset-0 flex items-center justify-center text-[11px] font-bold tabular-nums',
                !indeterminate && rounded >= 50
                  ? 'text-black'
                  : 'text-slate-200',
              ].join(' ')}
            >
              {indeterminate
                ? format === 'xlsx'
                  ? 'Generando...'
                  : stage === 'starting'
                    ? 'Iniciando...'
                    : 'Preparando...'
                : `${rounded}%`}
            </span>
          </div>

          <div className='flex items-center justify-between gap-3 text-xs text-slate-400'>
            <span>{detail}</span>
            {etaMs !== null && !cancelling && (
              <span className='shrink-0 tabular-nums'>{formatEta(etaMs)}</span>
            )}
          </div>
        </div>

        <DialogFooter className='pt-1'>
          <Button
            variant='outline'
            size='sm'
            disabled={cancelling}
            className='border-white/10 bg-transparent text-slate-400 hover:bg-white/5 hover:text-white transition cursor-pointer disabled:cursor-not-allowed'
            onClick={onCancel}
          >
            {cancelling ? 'Cancelando...' : 'Cancelar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModalExportProgress;
