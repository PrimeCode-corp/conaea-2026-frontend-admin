/**
 * Utilidades para guardar en disco una descarga grande (la exportación de
 * participantes en `.zip`).
 *
 * En Chromium usamos la File System Access API: el usuario elige la carpeta de
 * destino en el diálogo nativo y el cuerpo de la respuesta se escribe a disco
 * en streaming, sin mantener el archivo completo en memoria. En navegadores sin
 * soporte (Firefox, Safari) se cae al `<a download>` de siempre, que deja el
 * archivo en la carpeta de descargas.
 */

interface SaveFilePickerOptions {
  suggestedName?: string;
  types?: { description: string; accept: Record<string, string[]> }[];
}

/** Stream de escritura devuelto por `handle.createWritable()`. */
interface WritableFileStream {
  write: (data: Uint8Array<ArrayBufferLike> | Blob) => Promise<void>;
  close: () => Promise<void>;
  abort?: (reason?: unknown) => Promise<void>;
}

/**
 * Handle del archivo elegido por el usuario. `remove` solo existe en versiones
 * recientes de Chromium; lo usamos para limpiar el archivo vacío que el diálogo
 * crea si la descarga termina fallando.
 */
export interface SaveFileHandle {
  createWritable: () => Promise<WritableFileStream>;
  remove?: () => Promise<void>;
}

type SavePickerWindow = Window & {
  showSaveFilePicker?: (
    options?: SaveFilePickerOptions,
  ) => Promise<SaveFileHandle>;
};

/** Tipo de archivo que se ofrece en el diálogo "Guardar como". */
export interface SaveFileType {
  description: string;
  mime: string;
  extension: string;
}

export const ZIP_FILE_TYPE: SaveFileType = {
  description: 'Archivo ZIP',
  mime: 'application/zip',
  extension: '.zip',
};

export const XLSX_FILE_TYPE: SaveFileType = {
  description: 'Libro de Excel',
  mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  extension: '.xlsx',
};

/** ¿El navegador permite elegir dónde guardar el archivo? */
export const supportsSavePicker = () =>
  typeof window !== 'undefined' &&
  typeof (window as SavePickerWindow).showSaveFilePicker === 'function';

/**
 * Abre el diálogo nativo "Guardar como".
 *
 * Devuelve `null` si el navegador no soporta la API o si el usuario cancela.
 *
 * ⚠️ Debe llamarse **dentro del handler del click**, antes de cualquier `await`
 * largo: el navegador exige una interacción reciente del usuario y la descarta
 * a los pocos segundos. Por eso el nombre sugerido se arma en el cliente en vez
 * de esperar la cabecera `Content-Disposition` de la respuesta.
 */
export const pickSaveDestination = async (
  suggestedName: string,
  type: SaveFileType,
): Promise<SaveFileHandle | null> => {
  const picker = (window as SavePickerWindow).showSaveFilePicker;
  if (!picker) return null;

  try {
    return await picker({
      suggestedName,
      types: [
        {
          description: type.description,
          accept: { [type.mime]: [type.extension] },
        },
      ],
    });
  } catch (err) {
    // El usuario cerró el diálogo: no es un error que debamos reportar.
    if (err instanceof DOMException && err.name === 'AbortError') return null;
    throw err;
  }
};

/**
 * Vuelca el cuerpo de la respuesta en el archivo elegido, informando los bytes
 * escritos para poder mostrar el progreso.
 */
export const streamToFile = async (
  body: ReadableStream<Uint8Array>,
  handle: SaveFileHandle,
  onProgress?: (bytesWritten: number) => void,
) => {
  const writable = await handle.createWritable();
  const reader = body.getReader();
  let written = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      await writable.write(value);
      written += value.byteLength;
      onProgress?.(written);
    }
    await writable.close();
  } catch (err) {
    await writable.abort?.(err);
    throw err;
  }
};

/**
 * Acumula el cuerpo de la respuesta en memoria. Solo para el camino de
 * respaldo: con exportaciones grandes esto sí carga el `.zip` completo en RAM.
 */
export const streamToBlob = async (
  body: ReadableStream<Uint8Array>,
  mime: string,
  onProgress?: (bytesRead: number) => void,
) => {
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let read = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    read += value.byteLength;
    onProgress?.(read);
  }

  return new Blob(chunks as BlobPart[], { type: mime });
};

/** Descarga un blob a la carpeta de descargas del navegador. */
export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

/** Bytes a un texto corto para la UI (`1.2 GB`, `340 MB`). */
export const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(1)} ${units[unit]}`;
};
