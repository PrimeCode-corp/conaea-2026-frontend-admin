export function watchEmailStatus(
  participantId: number,
  onResult: (status: string, error: string | null) => void,
): EventSource {
  const es = new EventSource(
    `${import.meta.env.VITE_API_URL}/security/email-status/sse/?participant_id=${participantId}`,
  );

  es.onmessage = ({ data }: MessageEvent) => {
    const { status, error } = JSON.parse(data) as {
      status: string;
      error: string | null;
    };
    onResult(status, error);
    es.close();
  };

  es.onerror = () => {
    onResult('failed', 'Error de conexión con el servidor');
    es.close();
  };

  return es;
}
