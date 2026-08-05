# Solicitud al backend — Progreso real en la exportación de participantes

**Solicita:** equipo frontend admin (`conaea-2026-frontend-admin`)
**Módulo afectado:** `apps.participant` — `GET /participants/export/`
**Fecha:** 2026-08-05
**Contexto previo:** `docs/SOLICITUD_EXPORT_PARTICIPANTES_ZIP.md` (§5, opción B) y `docs/ENTREGA_EXPORT_PARTICIPANTES_ZIP.md`

> ✅ **Resuelto.** Implementado y ya consumido por el panel: ver `docs/ENTREGA_EXPORT_PROGRESO_REAL.md`. El `GET /participants/export/` síncrono **ya no se usa desde el frontend**; el backend puede retirarlo.

---

## 1. Qué pedimos

Que la exportación reporte **avance real** mientras el servidor arma el `.zip`, para poder mostrar una barra de progreso que signifique algo. Es exactamente la **opción B** que ustedes ya dejaron contratada en §5 de la solicitud original (`POST` + polling); venimos a pedir que se implemente.

El endpoint actual funciona bien y no hay que tocar nada de lo que ya entregaron: misma estructura del `.zip`, mismos filtros, mismos `.txt`. Lo único que cambia es **cómo se dispara y cómo se sigue** la exportación.

---

## 2. Por qué

El botón ya está en producción en el panel, con un modal de progreso. El problema es que, siendo el endpoint síncrono, **entre el request y la respuesta no llega nada**: el primer byte que ve el navegador es el `.zip` ya terminado. Durante la fase larga —bajar los archivos de Cloudinary, generar los QR, comprimir— no tenemos ni un dato que mostrar.

Hoy lo tapamos con una **estimación**: contamos los participantes con los filtros aplicados y proyectamos el avance por tiempo (`participantes × segundos por participante`, calibrado con la duración de la última exportación). Funciona, pero:

- Es una proyección, no una medición. El `60%` no significa que haya 89 expedientes listos.
- Si el servidor tarda más de lo previsto, la barra se frena en 97% y ahí se queda.
- La primera exportación de cada usuario usa una constante inventada, así que puede errar por mucho.
- Nadie puede saber si el proceso avanza o se colgó, que es justo lo que un usuario mira una barra para averiguar.

Con avance real podemos borrar toda esa heurística y mostrar `89 de 148 expedientes`.

---

## 3. Contrato propuesto

Tres piezas. Los nombres son los que ustedes mismos propusieron; si prefieren otros, sin problema — solo necesitamos el contrato cerrado.

### 3.1 Iniciar la exportación

```
POST /participants/export/
Authorization: Bearer <access>
```

Mismos filtros que hoy, en query string o en el body (nos da igual): `pre_sale_id`, `quota_type_id`, `university_code`.

```
202 Accepted
{
  "task_id": "9f2c1b7a-…",
  "total": 148          // participantes que entran en la exportación
}
```

`total` en la respuesta inicial nos evita la consulta extra que hoy hacemos a `/participants/table/` solo para contar.

Los errores actuales se mantienen tal cual: `400` si el filtro supera el tope, `403` si no es staff, y **`204`** (o un `400` con mensaje claro, como prefieran) si el filtro no arroja participantes.

### 3.2 Consultar el avance

```
GET /participants/export/{task_id}/
Authorization: Bearer <access>
```

```json
{
  "status": "processing",
  "processed": 89,
  "total": 148,
  "progress": 60,
  "phase": "Descargando archivos",
  "download_url": null,
  "detail": null
}
```

| Campo | Tipo | Para qué lo usamos |
|---|---|---|
| `status` | `pending` \| `processing` \| `done` \| `error` | Corta el polling en `done`/`error`. |
| `processed` / `total` | int | El texto `89 de 148 expedientes`. **Es el dato que más nos importa.** |
| `progress` | int 0-100 | La barra. Si lo calculan ustedes evitamos discrepancias; si no, lo derivamos de `processed/total`. |
| `phase` | string \| null | Opcional. Un texto corto (`"Descargando archivos"`, `"Comprimiendo"`) para el subtítulo del modal. |
| `download_url` | string \| null | Solo con `status: "done"`. Ver §3.3. |
| `detail` | string \| null | Solo con `status: "error"`. Lo mostramos tal cual, como hacemos hoy con el tope de 1000. |

Lo importante: **que `processed` avance a medida que cada expediente se termina de armar**, no en saltos de 0 → 100. Esa granularidad es todo el objetivo del pedido.

### 3.3 Descargar el resultado

Con `status: "done"`, `download_url` apunta al `.zip`. Dos preguntas:

1. **¿Lleva autenticación?** Si es una ruta de la API, seguimos mandando el `Bearer` (ya lo hacemos con `fetch`). Si es una URL firmada de Cloudinary/S3, mejor todavía: descargamos directo. Solo necesitamos saber cuál de las dos es.
2. **¿Cuánto vive el archivo?** Necesitamos saber el tiempo de retención para avisar al usuario si el enlace ya venció (por ejemplo, si dejó la pestaña abierta y volvió al día siguiente).

Lo que sí pedimos igual que hoy: `Content-Disposition` con el nombre, `Content-Length`, y `Access-Control-Expose-Headers` para poder leer ambas.

### 3.4 Cancelar (deseable, no bloqueante)

```
DELETE /participants/export/{task_id}/
```

El modal ya tiene botón **Cancelar**. Hoy solo aborta la petición del navegador; el servidor sigue trabajando para nadie. Con un job, poder cancelarlo de verdad evita quemar recursos en exportaciones que ya nadie espera. Si no entra en este alcance, lo dejamos para después — solo díganlo para que el botón siga siendo honesto sobre lo que hace.

---

## 4. Detalles que nos importan

**Polling, no SSE.** Nos vamos a quedar con un sondeo cada 1-2 s. No propongan `EventSource`: en este panel ya nos pasó que no puede enviar el header `Authorization` y falla cross-origin en producción — está documentado en `src/utils/watchEmailStatus.ts`, donde tuvimos que reemplazarlo por polling con axios. Si el intervalo que planteamos les parece agresivo para el servidor, díganlo o mándennos un `retry_after` en la respuesta y lo respetamos.

**El tope de 1000.** Con un job asíncrono el límite existe por otras razones (espacio en disco, tiempo del worker), pero deja de ser un problema de timeout HTTP. ¿Se mantiene, sube, desaparece? Nos sirve saberlo para el mensaje de la UI.

**Convivencia con el endpoint actual.** Pedimos que **`GET /participants/export/` siga funcionando** mientras migramos. Así no hay que sincronizar un despliegue de los dos lados: soltamos el flujo nuevo cuando esté probado y recién ahí pueden retirar el viejo. Avísennos con tiempo cuando lo vayan a quitar.

**Si no hay infraestructura para jobs.** Si montar Celery/RQ con un broker es demasiado para este alcance, díganlo y lo conversamos: preferimos saberlo a que quede trabado. Una alternativa más barata es que el `.zip` se siga armando en el request pero escribiendo el avance en algún lado que el `GET {task_id}` pueda leer (caché/DB). No es tan limpio, pero nos da el mismo dato.

---

## 5. Qué hacemos nosotros cuando esté

- Reemplazamos la estimación por tiempo (`readRate`/`saveRate` en `ParticipantExportButton.tsx`) por el `progress` real.
- Quitamos la consulta extra de conteo a `/participants/table/`, porque `total` ya viene en el `202`.
- El modal pasa a mostrar `89 de 148 expedientes` y el tiempo restante calculado con el ritmo real.
- Mantenemos el diálogo "Guardar como" y la escritura en streaming al disco: eso no cambia.

El modal ya recibe un porcentaje y un tiempo restante como props, así que del lado nuestro es cambiar de dónde salen esos dos números.

---

## 6. Resumen del pedido

- [ ] `POST /participants/export/` → `202 { task_id, total }`, con los filtros actuales.
- [ ] `GET /participants/export/{task_id}/` → `status`, `processed`, `total`, `progress`, `download_url`, `detail`.
- [ ] Que `processed` avance **por expediente terminado**, no en saltos.
- [ ] `download_url` con el `.zip` ya armado (misma estructura interna de siempre).
- [ ] `DELETE /participants/export/{task_id}/` para cancelar *(deseable)*.
- [ ] Mantener `GET /participants/export/` operativo durante la migración.
- [ ] Confirmar: ¿`download_url` requiere `Bearer` o es una URL firmada?
- [ ] Confirmar: ¿cuánto tiempo se conserva el archivo generado?
- [ ] Confirmar: ¿el tope de 1000 participantes se mantiene?
- [ ] Confirmar: ¿intervalo de polling recomendado?
