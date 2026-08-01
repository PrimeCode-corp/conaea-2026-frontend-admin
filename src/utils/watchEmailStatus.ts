import { emailLogService } from '@/services/emailLogService';

export interface EmailStatusWatcher {
  /** Detiene el sondeo. Seguro de llamar varias veces. */
  cancel: () => void;
}

interface WatchOptions {
  /** Tiempo máximo total antes de rendirse. Por defecto 2 min. */
  timeoutMs?: number;
  /** Intervalo entre sondeos. Por defecto 3 s. */
  intervalMs?: number;
  /**
   * Id del último log ANTES de reenviar. Permite distinguir el resultado
   * del reenvío actual de un estado final previo (evita falsos positivos).
   */
  baselineLogId?: number | null;
}

const TERMINAL = new Set(['sent', 'failed']);

/**
 * Observa el estado de entrega del correo de un participante sondeando la API
 * (vía axios, con el token de autenticación). Reemplaza al EventSource nativo,
 * que no puede enviar el header Authorization y fallaba en producción
 * (cross-origin + auth) lanzando un error inmediato aunque el correo se enviara
 * bien. Ver contexto en el historial de emails del panel de participantes.
 *
 * Resuelve cuando el correo llega a un estado final (`sent` / `failed`) que
 * corresponde al reenvío actual, o con `timeout` si se agota el tiempo.
 */
export function watchEmailStatus(
  participantId: number,
  onResult: (status: string, error: string | null) => void,
  options?: WatchOptions,
): EmailStatusWatcher {
  const timeoutMs = options?.timeoutMs ?? 120_000;
  const intervalMs = options?.intervalMs ?? 3_000;
  const baselineLogId = options?.baselineLogId ?? null;

  const deadline = Date.now() + timeoutMs;
  let cancelled = false;
  let sawNonTerminal = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const stop = () => {
    cancelled = true;
    if (timer) clearTimeout(timer);
  };

  const settle = (status: string, error: string | null) => {
    if (cancelled) return;
    stop();
    onResult(status, error);
  };

  const poll = async () => {
    if (cancelled) return;

    try {
      const data = await emailLogService.getByParticipant(participantId, {
        page_size: 1,
      });
      const latest = data.results[0];

      if (latest) {
        const isTerminal = TERMINAL.has(latest.status);
        // Aceptamos el estado final solo si corresponde al reenvío actual:
        // un log nuevo (id distinto al baseline) o un estado que ya pasó por
        // un intermedio (pending) durante esta observación. Así evitamos leer
        // el estado final viejo antes de que el backend registre el reenvío.
        const isCurrentAttempt =
          latest.id !== baselineLogId || sawNonTerminal;

        if (isTerminal && isCurrentAttempt) {
          settle(latest.status, latest.error_message);
          return;
        }

        if (!isTerminal) sawNonTerminal = true;
      }
    } catch {
      // Errores transitorios de red: seguimos intentando hasta el timeout.
    }

    if (cancelled) return;

    if (Date.now() >= deadline) {
      settle(
        'timeout',
        'El correo sigue enviándose. Actualiza en unos segundos para ver el estado.',
      );
      return;
    }

    timer = setTimeout(poll, intervalMs);
  };

  poll();

  return { cancel: stop };
}
