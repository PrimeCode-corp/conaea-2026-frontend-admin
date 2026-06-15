/**
 * Extrae un mensaje de error legible de una respuesta de Axios/DRF.
 * Prioriza `detail`, luego el primer `non_field_errors`, y si no hay nada
 * usable devuelve el `fallback` indicado.
 */
export const extractApiError = (err: unknown, fallback: string): string => {
  const data = (
    err as {
      response?: {
        data?: { detail?: string; non_field_errors?: string[] };
      };
    }
  )?.response?.data;

  return data?.detail ?? data?.non_field_errors?.[0] ?? fallback;
};

/**
 * Mapea los errores por campo de una respuesta de DRF a la forma de errores
 * del formulario, quedándose solo con las claves presentes en `emptyForm`.
 * Devuelve `null` si no hay errores de campo aplicables (para caer en un
 * toast genérico).
 */
export const mapFieldErrors = <T extends Record<string, unknown>>(
  err: unknown,
  emptyForm: T,
): Partial<Record<keyof T, string>> | null => {
  const data = (err as { response?: { data?: Record<string, string> } })
    ?.response?.data;

  if (!data || typeof data !== 'object') return null;

  const fieldErrors: Partial<Record<keyof T, string>> = {};
  for (const [key, msg] of Object.entries(data)) {
    if (key in emptyForm) fieldErrors[key as keyof T] = msg;
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : null;
};
