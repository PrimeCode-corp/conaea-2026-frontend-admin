import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Download, FileSpreadsheet, Loader2, Package } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { participantService } from '@/services/participantService';
import { useParticipantStore } from '@/store/useParticipantStore';
import { extractApiError } from '@/utils/apiError';
import {
  downloadBlob,
  pickSaveDestination,
  streamToBlob,
  streamToFile,
  supportsSavePicker,
  XLSX_FILE_TYPE,
  ZIP_FILE_TYPE,
  type SaveFileHandle,
  type SaveFileType,
} from '@/utils/fileDownload';
import ModalExportProgress, {
  type ExportFormat,
  type ExportProgressState,
} from './modals/ModalExportProgress';
import type {
  ParticipantExportDownload,
  ParticipantExportStatus,
  ParticipantExportTask,
} from '@/types/participants.types';

interface ParticipantExportButtonProps {
  preSaleId?: number;
  quotaTypeId?: number;
  universityCode: string;
}

/**
 * Reparto de la barra entre las dos fases del `.zip`. Armarlo en el servidor
 * es lo lento (bajar de Cloudinary, generar QR, comprimir); la bajada del
 * archivo ya hecho es comparativamente corta.
 */
const PROCESS_WEIGHT = 0.9;

/** Estados en los que el backend ya no va a mover la tarea. */
const TERMINAL: ParticipantExportStatus[] = ['done', 'error', 'cancelled'];

/** Sondeo por defecto, por si la tarea llegara sin `retry_after`. */
const DEFAULT_RETRY_SECONDS = 2;

/**
 * Si el servidor se reinicia (un deploy en Railway), la tarea queda en
 * `processing` sin avanzar nunca. Cortamos el sondeo tras este tiempo sin que
 * `processed` se mueva, en vez de dejar el modal girando para siempre.
 */
const STALL_MS = 120_000;

const FILE_TYPES: Record<ExportFormat, SaveFileType> = {
  zip: ZIP_FILE_TYPE,
  xlsx: XLSX_FILE_TYPE,
};

/**
 * Avance 0-100 de una tarea. Preferimos el `progress` del backend, pero si no
 * llega utilizable (ausente, no numérico o todavía en 0 con expedientes ya
 * armados) lo derivamos de `processed/total`, que es el dato que el backend
 * garantiza que avanza de a uno.
 */
const taskPercent = (task: ParticipantExportTask) => {
  const reported = Number(task.progress);
  if (Number.isFinite(reported) && reported > 0) return Math.min(100, reported);

  return task.total > 0
    ? Math.min(100, (task.processed / task.total) * 100)
    : 0;
};

/** Espera abortable, para poder cancelar entre sondeo y sondeo. */
const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });

/** Marcas diacríticas que deja `normalize('NFD')` al separar las tildes. */
const DIACRITICS = new RegExp('[\\u0300-\\u036f]', 'g');

/** `Preventa 1` → `preventa-1`, para el nombre del archivo. */
const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/**
 * Nombre propuesto en el diálogo "Guardar como". Lo armamos en el cliente
 * aunque la respuesta traiga el suyo, porque el diálogo se abre al hacer click
 * —el navegador solo lo permite con una interacción reciente— y para entonces
 * la exportación ni siquiera arrancó.
 */
const suggestFilename = (format: ExportFormat, preSaleName?: string) => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const stamp =
    `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
    `-${pad(now.getHours())}${pad(now.getMinutes())}`;
  const scope = preSaleName ? slugify(preSaleName) : 'todas';

  return `participantes_${scope}_${stamp}${FILE_TYPES[format].extension}`;
};

const idleProgress = (format: ExportFormat): ExportProgressState => ({
  stage: 'starting',
  format,
  percent: 0,
  etaMs: null,
  processed: 0,
  total: null,
  phaseLabel: null,
  written: 0,
  size: null,
});

const ParticipantExportButton = ({
  preSaleId,
  quotaTypeId,
  universityCode,
}: ParticipantExportButtonProps) => {
  const preSales = useParticipantStore((s) => s.preSales);

  const [exporting, setExporting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [progress, setProgress] = useState<ExportProgressState>(
    idleProgress('zip'),
  );
  const abortRef = useRef<AbortController | null>(null);
  const taskIdRef = useRef<string | null>(null);
  const userCancelledRef = useRef(false);

  // Si el usuario sale del panel a mitad de la exportación, cortamos la
  // descarga y liberamos el trabajo en el servidor: ya no hay quien lo reciba,
  // y solo caben dos exportaciones simultáneas.
  useEffect(
    () => () => {
      abortRef.current?.abort();
      const taskId = taskIdRef.current;
      if (taskId) void participantService.cancelExport(taskId).catch(() => {});
    },
    [],
  );

  const handleCancel = async () => {
    if (cancelling) return;
    userCancelledRef.current = true;
    setCancelling(true);

    const taskId = taskIdRef.current;
    if (taskId) {
      try {
        await participantService.cancelExport(taskId);
      } catch {
        // Si el backend no la pudo cancelar (ya terminó, por ejemplo),
        // igual cortamos del lado del cliente.
      }
    }
    abortRef.current?.abort();
  };

  const handleExport = async (format: ExportFormat) => {
    if (exporting) return;

    const preSaleName = preSales.find((p) => p.id === preSaleId)?.name;
    let handle: SaveFileHandle | null = null;

    // El diálogo va primero, sin ningún await de por medio: el navegador solo
    // lo permite mientras el click siga siendo reciente.
    if (supportsSavePicker()) {
      try {
        handle = await pickSaveDestination(
          suggestFilename(format, preSaleName),
          FILE_TYPES[format],
        );
      } catch {
        toast.error('No se pudo abrir el diálogo para guardar el archivo.');
        return;
      }
      if (!handle) return; // el usuario canceló
    }

    const filters = {
      pre_sale_id: preSaleId,
      quota_type_id: quotaTypeId,
      university_code: universityCode || undefined,
    };

    const controller = new AbortController();
    abortRef.current = controller;
    userCancelledRef.current = false;
    taskIdRef.current = null;
    setCancelling(false);
    setExporting(true);
    setProgress(idleProgress(format));

    const discardFile = () => handle?.remove?.().catch(() => {});

    /** Vuelca la respuesta a disco (o a Descargas) mostrando el avance. */
    const saveDownload = async (download: ParticipantExportDownload) => {
      const startedAt = Date.now();
      const size = download.size;
      const base = format === 'zip' ? PROCESS_WEIGHT : 0;

      setProgress((prev) => ({
        ...prev,
        stage: 'downloading',
        percent: base * 100,
        written: 0,
        size,
        etaMs: null,
      }));

      // El stream entrega miles de chunks; refrescamos como mucho cada 150 ms
      // para no re-renderizar en cada uno.
      let lastTick = 0;
      const reportProgress = (bytes: number) => {
        const now = Date.now();
        if (now - lastTick < 150) return;
        lastTick = now;

        const elapsed = now - startedAt;
        const bytesPerMs = elapsed > 0 ? bytes / elapsed : 0;

        setProgress((prev) => ({
          ...prev,
          written: bytes,
          percent: size
            ? (base + (bytes / size) * (1 - base)) * 100
            : prev.percent,
          etaMs: size && bytesPerMs > 0 ? (size - bytes) / bytesPerMs : null,
        }));
      };

      if (handle) {
        await streamToFile(download.body, handle, reportProgress);
      } else {
        // Firefox/Safari: sin diálogo de destino, el archivo va a la carpeta de
        // descargas y pasa completo por memoria.
        const blob = await streamToBlob(
          download.body,
          FILE_TYPES[format].mime,
          reportProgress,
        );
        downloadBlob(blob, download.filename);
      }

      // El progreso viene throttleado: cerramos la barra en 100% en vez de
      // dejarla clavada en el último tick.
      setProgress((prev) => ({
        ...prev,
        percent: 100,
        written: size ?? prev.written,
        etaMs: 0,
      }));
    };

    try {
      // ── Excel: síncrono, un solo request ──────────────────────────────
      if (format === 'xlsx') {
        const download = await participantService.exportExcel(
          filters,
          controller.signal,
        );

        if (!download) {
          toast.info('No hay participantes con esos filtros.');
          await discardFile();
          return;
        }

        await saveDownload(download);
        toast.success('Excel descargado correctamente.');
        return;
      }

      // ── ZIP: tarea en el servidor con avance real ─────────────────────
      // 1. Arrancar el trabajo. Responde al instante con la tarea a sondear.
      let task: ParticipantExportTask | null;
      try {
        task = await participantService.startExport(filters);
      } catch (err) {
        // El backend ya manda el mensaje listo para mostrar: el tope de 1000
        // participantes o el límite de exportaciones simultáneas (429).
        throw new Error(
          extractApiError(err, 'No se pudo iniciar la exportación.'),
        );
      }

      if (!task) {
        toast.info('No hay participantes con esos filtros.');
        // El diálogo ya creó el archivo vacío en el destino elegido: lo
        // borramos para no dejar basura (`remove` solo existe en Chromium
        // reciente; si no está, el archivo queda en 0 bytes).
        await discardFile();
        return;
      }

      taskIdRef.current = task.task_id;

      // 2. Sondear hasta que la tarea termine. `processed` avanza de a un
      //    expediente, así que el porcentaje y el tiempo restante son reales.
      const startedAt = Date.now();
      let lastProcessed = task.processed;
      let lastChangeAt = Date.now();

      const applyProgress = (current: ParticipantExportTask) => {
        const elapsed = Date.now() - startedAt;
        const perItem = current.processed > 0 ? elapsed / current.processed : 0;
        const pending = Math.max(0, current.total - current.processed);

        setProgress((prev) => ({
          ...prev,
          stage: 'processing',
          percent: taskPercent(current) * PROCESS_WEIGHT,
          processed: current.processed,
          total: current.total,
          phaseLabel: current.phase,
          etaMs: perItem > 0 ? pending * perItem : null,
        }));
      };

      while (!TERMINAL.includes(task.status)) {
        applyProgress(task);
        await sleep(
          (task.retry_after || DEFAULT_RETRY_SECONDS) * 1000,
          controller.signal,
        );
        task = await participantService.getExportStatus(task.task_id);

        if (task.processed !== lastProcessed) {
          lastProcessed = task.processed;
          lastChangeAt = Date.now();
        } else if (Date.now() - lastChangeAt > STALL_MS) {
          throw new Error(
            'La exportación dejó de avanzar. Puede que el servidor se haya reiniciado; vuelve a intentarlo.',
          );
        }
      }

      applyProgress(task);
      taskIdRef.current = null;

      if (task.status === 'cancelled') {
        toast.info('Exportación cancelada.');
        await discardFile();
        return;
      }

      if (task.status === 'error') {
        throw new Error(task.detail ?? 'La exportación falló en el servidor.');
      }

      if (!task.download_url) {
        throw new Error(
          'El archivo generado ya venció (se conserva 1 hora). Vuelve a exportar.',
        );
      }

      // 3. Descargar el `.zip`. Acá el avance son bytes recibidos.
      const download = await participantService.downloadExport(
        task.download_url,
        controller.signal,
      );
      await saveDownload({
        ...download,
        size: download.size ?? task.file_size,
        filename: task.filename ?? download.filename,
      });

      toast.success('Exportación descargada correctamente.');
    } catch (err) {
      if (controller.signal.aborted) {
        // También abortamos al desmontar el panel; ahí no hay a quién avisar.
        if (userCancelledRef.current) {
          toast.info('Exportación cancelada.');
          await discardFile();
        }
        return;
      }
      toast.error(
        err instanceof Error
          ? err.message
          : 'No se pudo generar la exportación.',
      );
      await discardFile();
    } finally {
      abortRef.current = null;
      taskIdRef.current = null;
      setCancelling(false);
      setExporting(false);
      setProgress(idleProgress(format));
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            disabled={exporting}
            className='h-9 gap-1.5 bg-[#fbba0e] text-black text-sm font-semibold hover:bg-[#fbba0e]/90 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer'
          >
            {exporting ? (
              <Loader2 className='h-3.5 w-3.5 animate-spin' />
            ) : (
              <Download className='h-3.5 w-3.5' />
            )}
            {exporting ? 'Exportando...' : 'Exportar'}
            {!exporting && <ChevronDown className='h-3.5 w-3.5' />}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align='end'
          className='w-72 bg-[#111] text-slate-200 border border-white/10'
        >
          <DropdownMenuItem
            className='cursor-pointer flex-col items-start gap-0.5 focus:bg-white/5 focus:text-slate-100'
            onClick={() => handleExport('zip')}
          >
            <span className='flex items-center gap-2 font-semibold'>
              <Package className='h-3.5 w-3.5 text-[#fbba0e]' />
              Expedientes (.zip)
            </span>
            <span className='pl-[22px] text-xs text-slate-400'>
              Una carpeta por participante con foto, QR, ficha y vouchers.
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className='cursor-pointer flex-col items-start gap-0.5 focus:bg-white/5 focus:text-slate-100'
            onClick={() => handleExport('xlsx')}
          >
            <span className='flex items-center gap-2 font-semibold'>
              <FileSpreadsheet className='h-3.5 w-3.5 text-[#fbba0e]' />
              Tabla de datos (.xlsx)
            </span>
            <span className='pl-[22px] text-xs text-slate-400'>
              Datos y estado de cada participante, con enlaces a sus archivos.
            </span>
          </DropdownMenuItem>

          <p className='px-2 py-1.5 text-[11px] leading-snug text-slate-500'>
            Ambos usan los filtros de preventa, cupo y universidad; ignoran la
            búsqueda y el tipo de documento.
          </p>
        </DropdownMenuContent>
      </DropdownMenu>

      <ModalExportProgress
        open={exporting}
        progress={progress}
        cancelling={cancelling}
        onCancel={handleCancel}
      />
    </>
  );
};

export default ParticipantExportButton;
