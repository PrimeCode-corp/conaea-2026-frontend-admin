export function watchEmailStatus(
  participantId: number,
  onResult: (status: string, error: string | null) => void,
  options?: { timeoutMs?: number },
): EventSource {
  // El correo puede tardar en enviarse; damos un margen amplio antes de rendirnos.
  const timeoutMs = options?.timeoutMs ?? 120_000;

  const es = new EventSource(
    `${import.meta.env.VITE_API_URL}/security/email-status/sse/?participant_id=${participantId}`,
  );

  let settled = false;

  const finish = (status: string, error: string | null) => {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
    es.close();
    onResult(status, error);
  };

  const timer = setTimeout(() => {
    finish(
      'timeout',
      'El correo sigue enviándose. Actualiza en unos segundos para ver el estado.',
    );
  }, timeoutMs);

  // Si el consumidor cierra el stream manualmente, evitamos que el timeout
  // dispare onResult sobre un componente ya desmontado.
  const nativeClose = es.close.bind(es);
  es.close = () => {
    settled = true;
    clearTimeout(timer);
    nativeClose();
  };

  es.onmessage = ({ data }: MessageEvent) => {
    let payload: { status: string; error: string | null };
    try {
      payload = JSON.parse(data);
    } catch {
      // Frames de keep-alive u otros mensajes no-JSON: los ignoramos.
      return;
    }
    // "pending" es un estado intermedio: seguimos esperando el resultado final.
    if (payload.status === 'pending') return;
    finish(payload.status, payload.error);
  };

  es.onerror = () => {
    // onerror NO implica que el correo falló. EventSource lo dispara también
    // durante reconexiones automáticas (readyState === CONNECTING) mientras el
    // envío está en curso. Solo lo tratamos como fallo si el navegador cerró la
    // conexión de forma definitiva; en cualquier otro caso dejamos que reintente
    // hasta que llegue el estado real o venza el timeout.
    if (es.readyState === EventSource.CLOSED) {
      finish('failed', 'Error de conexión con el servidor');
    }
  };

  return es;
}
