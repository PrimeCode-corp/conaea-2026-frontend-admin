# Listo: exportación masiva de participantes en `.zip`

**Para:** equipo frontend admin (`conaea-2026-frontend-admin`)
**De:** backend
**Fecha:** 2026-08-05
**Responde a:** `docs/SOLICITUD_EXPORT_PARTICIPANTES_ZIP.md`

Ya está implementado. Pueden armar el botón **Exportar**.

```
GET /api/participants/export/
Authorization: Bearer <access>
```

El contrato quedó **tal como lo pidieron**: mismos filtros, misma estructura
interna del `.zip`, mismos nombres de carpetas y de los `.txt`. No cambiamos
nada de lo que el equipo de acreditación va a usar en sitio.

El detalle completo (formato exacto de `datos.txt`, `estado.txt`, `_resumen.txt`,
reglas de sanitización, casos borde) está en
**`docs/RESPUESTA_EXPORT_PARTICIPANTES_ZIP.md`**. Este documento es solo lo que
necesitan para conectarlo.

---

## 1. Sus cuatro confirmaciones

| Pregunta | Respuesta |
|---|---|
| ¿Opción A (síncrona) u opción B (job asíncrono)? | **A.** Un solo `GET` que responde el `.zip`. Descargas de Cloudinary en paralelo y respuesta transmitida en chunks. |
| ¿Ruta final? | `/api/participants/export/` — la que propusieron. |
| ¿Resultado vacío: `200` con zip vacío o `204`? | **`204 No Content`**, sin cuerpo. |
| ¿Estructura condicional (§3.6) o anidada siempre? | **Condicional**, como la describieron. Con `pre_sale_id` plana; sin él, `datos/<preventa>/<cupo>/<universidad>/<documento>/`. |

**Sobre el QR** (§3.4): se genera **al vuelo**, no se persiste — hoy no hay URL
que devolverles. El payload es **texto plano** de cinco líneas
(`UUID`, `Documento`, `Número de identidad`, `Nombre`, `Universidad`), donde el
UUID es el de `Registration`. Lo arma una sola función que comparten el correo
de bienvenida y la exportación, así que no hay dos fuentes de verdad: si cambia
el del correo, cambia el del `.zip`. En el `.zip` el PNG sale a 684 px de lado.

---

## 2. Respuestas del endpoint

| Código | Cuándo | Cuerpo |
|---|---|---|
| `200` | Hay participantes | El `.zip`. `Content-Type: application/zip`, `Content-Disposition` con el nombre, y **`Content-Length` real** (pueden mostrar porcentaje, no spinner). |
| `204` | El filtro no arroja participantes | Vacío → muestren "No hay participantes con esos filtros". |
| `400` | Param inválido, o el filtro supera el tope de **1000 participantes** | `{"detail": "..."}` |
| `401` | Token vencido | Su interceptor lo maneja. |
| `403` | Autenticado pero **no staff** | `{"detail": "..."}` |

`Access-Control-Expose-Headers: Content-Disposition, Content-Length` ya está
configurado, así que pueden leer ambas desde JS para el diálogo "Guardar como".

Nombre del archivo: `participantes_preventa-1_20260805-1430.zip`, o
`participantes_todas_20260805-1430.zip` cuando no se filtra por preventa.

---

## 3. Cómo consumirlo

Su `participantService.exportZip` del §6 funciona sin cambios. Tres detalles
que sí conviene contemplar:

```ts
// src/services/participantService.ts
exportZip: async (filters: {
  pre_sale_id?: number;
  quota_type_id?: number;
  university_code?: string;
} = {}) => {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== ''),
  );

  const res = await api.get('/participants/export/', {
    params,
    responseType: 'blob',
    timeout: 0, // la exportación excede el timeout global de 5 s
  });

  // 1. Sin participantes → 204 sin cuerpo.
  if (res.status === 204) return null;

  // 2. El nombre viene en la cabecera (ya expuesta por CORS).
  const disposition = res.headers['content-disposition'] ?? '';
  const filename = /filename="([^"]+)"/.exec(disposition)?.[1] ?? 'participantes.zip';

  return { blob: res.data, filename };
},
```

**3. Los errores llegan como `Blob`, no como JSON.** Con
`responseType: 'blob'`, el cuerpo de un `400`/`403` también es un Blob, así que
para mostrar el mensaje hay que leerlo:

```ts
catch (error) {
  const data = error.response?.data;
  const detail = data instanceof Blob
    ? JSON.parse(await data.text()).detail
    : data?.detail;
  toast.error(detail ?? 'No se pudo generar la exportación');
}
```

Es el caso del tope de 1000: el `detail` ya trae el número encontrado
(*"La exportación supera el máximo de 1000 participantes (1240 encontrados).
Aplica más filtros."*), listo para mostrar tal cual.

### Sobre el `showSaveFilePicker` del §6.1

Va perfecto por su lado, pero ojo: con **axios + `responseType: 'blob'` el
`.zip` completo queda en RAM** antes de que puedan escribirlo, que es
justamente lo que querían evitar. Para el `response.body.pipeTo(writable)` de
su snippet necesitan `fetch` en vez de axios en esta llamada concreta (el
`Content-Length` que enviamos les sirve igual para el progreso). Con axios
funciona también, solo que pasando por memoria.

---

## 4. Dos detalles que van a ver en el `.zip`

1. **Las extensiones no son `.jpg`.** Las fotos y los vouchers se convierten a
   **WEBP** al subirse, así que dentro de cada carpeta llegan como `foto.webp`
   y `voucher_1.webp`. Las fichas siguen siendo `.pdf` y el QR `qr.png`.
   Conservamos la extensión real como pidieron; simplemente la real es `.webp`.

2. **Vouchers repetidos.** Si una inscripción tiene dos pagos con el mismo
   método (dos yapes, p. ej.), hoy ambos apuntan al mismo archivo en Cloudinary
   por cómo se arma la ruta de subida. Van a salir `voucher_1` y `voucher_2`
   con contenido idéntico. Es un tema anterior a este endpoint; lo tenemos
   anotado para corregirlo aparte.

---

## 5. Lo que necesitamos de ustedes

Está verificado con datos simulados (estructura plana y anidada, documentos
duplicados, cupo General sin ficha, descarga fallida, resultado vacío), pero
**falta la primera corrida real**.

Cuando la hagan con la preventa más grande, dos cosas:

1. **Cuánto tardó.** Es el go/no-go entre la opción A y la B. Si se pasa de
   ~60 s, migramos al job asíncrono con el contrato que propusieron
   (`POST` + polling) — la estructura del `.zip` no cambiaría en nada.
2. **La línea `Archivos omitidos` de `_resumen.txt`.** Si sale `0`, todos los
   archivos de Cloudinary se descargaron bien. Si no, pásennos el `.zip` y
   miramos qué falló en los `estado.txt`.

Cualquier ajuste al tope de 1000 registros, díganlo y lo movemos.
