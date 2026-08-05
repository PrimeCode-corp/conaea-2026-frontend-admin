import { useEffect, useRef, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { participantService } from '@/services/participantService';
import { useParticipantStore } from '@/store/useParticipantStore';
import { extractApiError } from '@/utils/apiError';
import {
  downloadBlob,
  pickZipDestination,
  streamToBlob,
  streamToFile,
  supportsSavePicker,
  type SaveFileHandle,
} from '@/utils/fileDownload';
import ModalExportProgress, {
  type ExportProgressState,
} from './modals/ModalExportProgress';
import type {
  ParticipantExportStatus,
  ParticipantExportTask,
} from '@/types/participants.types';

interface ParticipantExportButtonProps {
  preSaleId?: number;
  quotaTypeId?: number;
  universityCode: string;
}

/**
 * Reparto de la barra entre las dos fases. Armar el `.zip` en el servidor es
 * lo lento (bajar de Cloudinary, generar QR, comprimir); la bajada del archivo
 * ya hecho es comparativamente corta.
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
 * aunque la tarea traiga `filename`, porque el diálogo se abre al hacer click
 * —el navegador solo lo permite con una interacción reciente— y para entonces
 * la exportación ni siquiera arrancó.
 */
const suggestFilename = (preSaleName?: string) => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const stamp =
    `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
    `-${pad(now.getHours())}${pad(now.getMinutes())}`;

  return `participantes_${preSaleName ? slugify(preSaleName) : 'todas'}_${stamp}.zip`;
};

const IDLE_PROGRESS: ExportProgressState = {
  stage: 'starting',
  percent: 0,
  etaMs: null,
  processed: 0,
  total: null,
  phaseLabel: null,
  written: 0,
  size: null,
};

const ParticipantExportButton = ({
  preSaleId,
  quotaTypeId,
  universityCode,
}: ParticipantExportButtonProps) => {
  const preSales = useParticipantStore((s) => s.preSales);

  const [exporting, setExporting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [progress, setProgress] = useState<ExportProgressState>(IDLE_PROGRESS);
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

  const handleExport = async () => {
    if (exporting) return;

    const preSaleName = preSales.find((p) => p.id === preSaleId)?.name;
    let handle: SaveFileHandle | null = null;

    // El diálogo va primero, sin ningún await de por medio: el navegador solo
    // lo permite mientras el click siga siendo reciente.
    if (supportsSavePicker()) {
      try {
        handle = await pickZipDestination(suggestFilename(preSaleName));
      } catch {
        toast.error('No se pudo abrir el diálogo para guardar el archivo.');
        return;
      }
      if (!handle) return; // el usuario canceló
    }

    const controller = new AbortController();
    abortRef.current = controller;
    userCancelledRef.current = false;
    taskIdRef.current = null;
    setCancelling(false);
    setExporting(true);
    setProgress(IDLE_PROGRESS);

    const discardFile = () => handle?.remove?.().catch(() => {});

    try {
      // 1. Arrancar el trabajo. Responde al instante con la tarea a sondear.
      let task: ParticipantExportTask | null;
      try {
        task = await participantService.startExport({
          pre_sale_id: preSaleId,
          quota_type_id: quotaTypeId,
          university_code: universityCode || undefined,
        });
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
      const downloadStartedAt = Date.now();
      setProgress((prev) => ({
        ...prev,
        stage: 'downloading',
        percent: PROCESS_WEIGHT * 100,
        written: 0,
        size: task?.file_size ?? null,
        etaMs: null,
      }));

      const download = await participantService.downloadExport(
        task.download_url,
        controller.signal,
      );
      const size = download.size ?? task.file_size;

      // El stream entrega miles de chunks; refrescamos como mucho cada 150 ms
      // para no re-renderizar en cada uno.
      let lastTick = 0;
      const reportProgress = (bytes: number) => {
        const now = Date.now();
        if (now - lastTick < 150) return;
        lastTick = now;

        const elapsed = now - downloadStartedAt;
        const bytesPerMs = elapsed > 0 ? bytes / elapsed : 0;

        setProgress((prev) => ({
          ...prev,
          written: bytes,
          size,
          percent: size
            ? (PROCESS_WEIGHT + (bytes / size) * (1 - PROCESS_WEIGHT)) * 100
            : prev.percent,
          etaMs: size && bytesPerMs > 0 ? (size - bytes) / bytesPerMs : null,
        }));
      };

      if (handle) {
        await streamToFile(download.body, handle, reportProgress);
      } else {
        // Firefox/Safari: sin diálogo de destino, el archivo va a la carpeta de
        // descargas y pasa completo por memoria.
        const blob = await streamToBlob(download.body, reportProgress);
        downloadBlob(blob, task.filename ?? 'participantes.zip');
      }

      // El progreso viene throttleado: cerramos la barra en 100% en vez de
      // dejarla clavada en el último tick.
      setProgress((prev) => ({
        ...prev,
        percent: 100,
        written: size ?? prev.written,
        etaMs: 0,
      }));

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
      setProgress(IDLE_PROGRESS);
    }
  };

  return (
    <>
      <div className='relative group'>
        <Button
          onClick={handleExport}
          disabled={exporting}
          className='h-9 gap-1.5 bg-[#fbba0e] text-black text-sm font-semibold hover:bg-[#fbba0e]/90 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer'
        >
          {exporting ? (
            <Loader2 className='h-3.5 w-3.5 animate-spin' />
          ) : (
            <Download className='h-3.5 w-3.5' />
          )}
          {exporting ? 'Exportando...' : 'Exportar'}
        </Button>

        {!exporting && (
          <div className='absolute top-full right-0 mt-1.5 w-64 px-2 py-1.5 rounded-md text-xs whitespace-normal pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-[#111] border border-white/10 text-slate-300 z-20'>
            Descarga un .zip con el expediente de los participantes activos
            (foto, QR, ficha, vouchers y datos). Usa los filtros de preventa,
            cupo y universidad; ignora la búsqueda y el tipo de documento.
          </div>
        )}
      </div>

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
