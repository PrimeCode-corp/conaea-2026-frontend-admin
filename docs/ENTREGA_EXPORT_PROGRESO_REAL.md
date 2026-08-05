# Listo: progreso real en la exportación de participantes

**Para:** equipo frontend admin (`conaea-2026-frontend-admin`)
**De:** backend
**Fecha:** 2026-08-05
**Responde a:** `docs/SOLICITUD_EXPORT_PROGRESO_REAL.md`

Ya está implementada la **opción B**, con los nombres que propusieron y el
`DELETE` de cancelar incluido. Pueden reemplazar la estimación por tiempo.

Lo importante: **`processed` avanza de a un expediente**, no por tandas ni de
0 → 100. Es el dato que pedían.

El contrato completo (todos los códigos de respuesta, el detalle de cada campo,
cómo está montado por dentro) está en
**`docs/RESPUESTA_EXPORT_PROGRESO_REAL.md`**. Esto es lo que necesitan para
conectarlo.

---

## 1. Los cuatro endpoints

Todos con `Authorization: Bearer <access>`, solo staff.

| Método | Ruta | Devuelve |
|---|---|---|
| `POST` | `/api/participants/export/` | `202 { task_id, total, … }` — arranca el trabajo |
| `GET` | `/api/participants/export/{task_id}/` | El avance (objeto de §2) |
| `DELETE` | `/api/participants/export/{task_id}/` | `200` con el avance ya en `cancelled` |
| `GET` | `/api/participants/export/{task_id}/download/` | El `.zip` |

Los filtros del `POST` son los de siempre (`pre_sale_id`, `quota_type_id`,
`university_code`) y los aceptamos **en query string o en el body JSON**, como
les quede más cómodo.

**El `GET /participants/export/` síncrono sigue funcionando igual.** Migren
cuando quieran; avísennos cuando ya no lo usen y lo retiramos.

---

## 2. El objeto de avance

Es el mismo que devuelven el `POST`, el `GET` y el `DELETE`, así que pueden
pintar el modal desde el `202` sin esperar al primer sondeo.

```ts
type ExportStatus = 'pending' | 'processing' | 'done' | 'error' | 'cancelled';

interface ExportTask {
  task_id: string;
  status: ExportStatus;
  processed: number;        // 89
  total: number;            // 148
  progress: number;         // 0-100; no llega a 100 hasta status === 'done'
  phase: string | null;     // 'Descargando archivos'
  download_url: string | null;  // absoluta, solo con status 'done' y no vencida
  detail: string | null;    // solo con 'error' o 'cancelled'
  filename: string | null;  // nombre sugerido del .zip, con 'done'
  file_size: number | null; // bytes, con 'done'
  expires_at: string | null;// ISO 8601: cuándo se borra el archivo
  retry_after: number;      // segundos de sondeo que les pedimos (2)
}
```

Las `phase` son tres, en orden: `"Preparando la exportación"`,
`"Descargando archivos"` (ahí se va el 95% del tiempo) y
`"Finalizando el archivo"`.

---

## 3. Sus cuatro confirmaciones

| Pregunta | Respuesta |
|---|---|
| ¿`download_url` lleva `Bearer` o es URL firmada? | **`Bearer`.** Es ruta de la API, no URL firmada. Viene absoluta, lista para `fetch`. |
| ¿Cuánto vive el archivo? | **1 hora** desde que pasa a `done`. Lo tienen exacto en `expires_at`. |
| ¿Se mantiene el tope de 1000? | **Sí.** Ya no por timeout sino por disco (~800 MB de `.zip` en contenedor efímero). Es una constante; si hace falta subirlo, díganlo. |
| ¿Intervalo de polling? | **2 s**, y se lo mandamos en `retry_after` en cada respuesta para que no lo hardcodeen. |

---

## 4. El flujo completo

```ts
// src/services/participantService.ts
export const participantService = {
  /** Arranca la exportación. Devuelve null si el filtro no arroja participantes (204). */
  startExport: async (filters: ExportFilters = {}): Promise<ExportTask | null> => {
    const res = await api.post<ExportTask>('/participants/export/', filters);
    return res.status === 204 ? null : res.data;
  },

  getExportStatus: (taskId: string) =>
    api.get<ExportTask>(`/participants/export/${taskId}/`).then((r) => r.data),

  cancelExport: (taskId: string) =>
    api.delete<ExportTask>(`/participants/export/${taskId}/`).then((r) => r.data),
};
```

```ts
// Sondeo. Ojo con los tres estados terminales (ver §5).
const TERMINAL: ExportStatus[] = ['done', 'error', 'cancelled'];

let task = await participantService.startExport(filters);
if (!task) return toast.info('No hay participantes con esos filtros');

while (!TERMINAL.includes(task.status)) {
  await sleep(task.retry_after * 1000);
  task = await participantService.getExportStatus(task.task_id);
  setProgress(task.progress);
  setLabel(`${task.processed} de ${task.total} expedientes`);
  setPhase(task.phase);
}

if (task.status !== 'done') return toast.error(task.detail ?? 'La exportación falló');
```

```ts
// Descarga con el diálogo "Guardar como" y escritura en streaming al disco.
const res = await fetch(task.download_url!, {
  headers: { Authorization: `Bearer ${accessToken}` },
});
const handle = await window.showSaveFilePicker({
  suggestedName: task.filename!,   // ya no hace falta parsear Content-Disposition
  types: [{ description: 'Archivo ZIP', accept: { 'application/zip': ['.zip'] } }],
});
await res.body!.pipeTo(await handle.createWritable());
```

### Lo que pueden borrar

- La heurística `readRate`/`saveRate` de `ParticipantExportButton.tsx`.
- La consulta extra de conteo a `/participants/table/`: `total` viene en el `202`.
- El parseo de `Content-Disposition`: el nombre viene en `filename`.
- El `timeout: 0`: `POST`, `GET` y `DELETE` responden al instante, así que
  entran de sobra en el timeout global de 5 s. Solo la descarga es larga, y
  esa va por `fetch`, que no usa el timeout de axios.
- El manejo de errores leyendo `Blob`: ahora `POST` y `GET` devuelven JSON
  normal, así que `error.response.data.detail` se lee directo.

---

## 5. Tres cosas nuevas que sí les afectan

**1. Hay un quinto estado: `cancelled`.** Su tabla contemplaba cuatro. Como
implementamos el `DELETE`, hace falta uno más. **Corten el sondeo en `done`,
`error` y `cancelled`** — si solo cortan en los dos primeros, una exportación
cancelada les deja el polling girando para siempre. Si prefieren no tocar el
enum, lo mapeamos a `error` con un `detail` explicativo: solo díganlo.

La cancelación no es instantánea: el trabajo va en tandas de 25 y comprueba la
cancelación al inicio de cada una, así que puede tardar unos segundos en
detenerse. El `.zip` a medio escribir se borra solo.

**2. `429` si ya hay 2 exportaciones en curso.** Cada exportación abre hasta 8
descargas simultáneas contra Cloudinary; sin tope, tres usuarios exportando a
la vez degradan el resto del panel. El `detail` viene listo para mostrar. Es un
límite global, no por usuario.

**3. `410` al descargar un archivo vencido.** Es el caso que les preocupaba
—dejar la pestaña abierta y volver al día siguiente—. Lo pueden anticipar sin
pedir la descarga: si una tarea en `done` trae `download_url: null`, ya venció.

### Y una advertencia sobre reinicios

El trabajo corre en el proceso del servidor, no en un worker aparte. Si Railway
reinicia el contenedor (un deploy, un reinicio automático), las exportaciones
en curso mueren y sus tareas **quedan en `processing` sin avanzar nunca**. No
es frecuente, pero para que la UI no se cuelgue esperando, un buen criterio es
**cortar el sondeo y mostrar error si `processed` no se mueve en ~2 minutos**.
Los `.zip` ya generados también se pierden en un reinicio; ahí la descarga
responde `410`.

---

## 6. Estado de la verificación

Probado de punta a punta con 60 participantes simulados: `202` con el `total`
correcto, avance granular (`processed` va de 1 a 60 sin huecos), descarga con
`Content-Length` exacto y el `.zip` completo, cancelación con borrado del
archivo a medias, `409` al cancelar algo ya terminado, `429` al pasarse de
exportaciones simultáneas, `410` y purga al vencer, y los casos borde (`204`,
`400`, `404`, `403`).

Lo que **no** está probado es una corrida real contra Cloudinary y la base de
producción — sigue pendiente igual que con el endpoint síncrono. Cuando la
hagan, nos sirven las dos mismas cosas de siempre: **cuánto tardó** y la línea
**`Archivos omitidos`** de `_resumen.txt`.
