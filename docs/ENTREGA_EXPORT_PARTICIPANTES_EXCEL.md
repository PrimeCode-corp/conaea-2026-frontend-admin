# Nuevo: exportación de participantes a Excel

**Para:** equipo frontend admin (`conaea-2026-frontend-admin`)
**De:** backend
**Fecha:** 2026-08-05
**Relacionado:** `docs/ENTREGA_EXPORT_PARTICIPANTES_ZIP.md`, `docs/ENTREGA_EXPORT_PROGRESO_REAL.md`

Esto **no** sale de una solicitud suya: lo pidió el equipo interno y se lo
avisamos para que puedan sumarlo al panel cuando quieran. No obliga a cambiar
nada de lo que ya tienen — el `.zip` sigue exactamente igual.

Es una alternativa ligera al `.zip`: en vez de bajar los archivos, devuelve una
tabla con los datos de cada participante y los **enlaces** a su foto, su ficha
y sus vouchers.

```
GET /api/participants/export/excel/
Authorization: Bearer <access>
```

---

## 1. Contrato

Filtros idénticos a los del `.zip` y a los de `/participants/table/`:
`pre_sale_id`, `quota_type_id`, `university_code`. Los tres opcionales y
combinables.

| Código | Cuándo |
|---|---|
| `200` | El `.xlsx`, con `Content-Disposition`, `Content-Length` y `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`. |
| `204` | El filtro no arroja participantes. |
| `400` | Filtro inválido (`{"detail": "..."}`). |
| `403` | Autenticado pero no staff. |

Nombre del archivo: `participantes_preventa-1_20260805-1430.xlsx`, o
`participantes_todas_…` sin filtro de preventa. Mismo patrón que el `.zip`.

**No hay tope de participantes** y **no hace falta el flujo asíncrono**: al no
descargar nada de Cloudinary ni generar QR, la exportación tarda segundos.
Aun así súbanle el timeout a esta llamada (con ~1000 participantes puede rondar
unos segundos, y el global son 5 s).

---

## 2. Qué trae la hoja

Una sola hoja, `Participantes`, con cabecera fija y autofiltro. Una fila por
participante, en el mismo orden que el `.zip`.

Las columnas son **los mismos campos** que el `.zip` escribe en `datos.txt` y
`estado.txt` — comparten el código, así que no pueden desincronizarse:

| Bloque | Columnas |
|---|---|
| Personales | Nombres, Apellido paterno, Apellido materno, Nombre completo, Tipo de documento, N° de documento, Fecha de nacimiento, Celular, Correo |
| Académico | Universidad, Abreviatura, Código universidad, Tipo de universidad, Ciclo académico, País |
| Inscripción | Preventa, Tipo de cupo, Fecha de registro, Hora de registro |
| Salud | Discapacidad, Alergia |
| Validación | Voucher verificado, Ficha de matrícula verificada, Inscripción verificada |
| Enlaces | Fotografía (enlace), Ficha de matrícula (enlace), Voucher 1 (enlace), Voucher 2 (enlace), … |

Detalles:

- **No lleva QR.** El QR solo existe en el `.zip` y en el correo.
- **Las columnas de voucher se generan hasta el máximo de la exportación.** Si
  el participante con más pagos tiene 3, hay `Voucher 1..3` y a los demás les
  quedan celdas vacías.
- **Un archivo que no existe deja la celda vacía**, no una marca. Sirve para
  filtrar rápido "quiénes no subieron foto".
- Los estados de validación usan las mismas etiquetas que `estado.txt`:
  `SÍ` / `PARCIAL` / `NO`, más `SIN VOUCHER` y `SIN FICHA` cuando no aplica.

---

## 3. Dos cosas sobre los enlaces

**1. Van como texto plano, no como hipervínculo.** Es lo que se pidió. En Excel
se ven como texto y no son clicables hasta que el usuario los copia o los edita.
Si prefieren que se abran de un clic, es un cambio de una línea de nuestro lado
— díganlo y los convertimos en hipervínculos reales.

**2. Apuntan al archivo original de Cloudinary, que está en WEBP.** Ojo con
esto, porque **no coincide con el `.zip`**: ahí las imágenes se convierten a PNG
antes de empaquetarlas, pero el enlace del Excel lleva a la URL tal cual está
guardada, es decir `…/participants/72345678.webp`. La ficha de matrícula sí
coincide: es el mismo `.pdf` en los dos.

Son las mismas URLs que el panel ya muestra hoy en `ModalDocuments`, así que se
abren en el navegador sin autenticación y sin sesión del panel. Los `Bearer` no
hacen falta para estos enlaces: el token solo protege el endpoint que genera el
Excel, no los archivos.

---

## 4. Cómo consumirlo

```ts
// src/services/participantService.ts
exportExcel: async (filters: ExportFilters = {}) => {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== ''),
  );

  const res = await api.get('/participants/export/excel/', {
    params,
    responseType: 'blob',
    timeout: 60_000,   // rápido, pero por encima del global de 5 s
  });

  if (res.status === 204) return null;   // sin participantes

  const disposition = res.headers['content-disposition'] ?? '';
  const filename = /filename="([^"]+)"/.exec(disposition)?.[1] ?? 'participantes.xlsx';
  return { blob: res.data, filename };
},
```

Como va con `responseType: 'blob'`, vuelve a aplicar lo de siempre: **el cuerpo
de un `400`/`403` también llega como `Blob`**, así que para mostrar el `detail`
hay que leerlo con `JSON.parse(await data.text())`. (En el flujo asíncrono del
`.zip` esto no pasaba porque ahí las respuestas son JSON.)

Sirve el mismo `showSaveFilePicker` que ya usan, cambiando el `accept` a
`{ 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }`.

---

## 5. Estado

Verificado leyendo el `.xlsx` generado: columnas y valores correctos, enlaces
como texto, celdas vacías para un participante de cupo General sin foto ni
ficha ni voucher, columnas de voucher hasta el máximo, estados de validación
coherentes con el `.zip`, y `204` en vacío.

Falta la corrida contra datos de producción, igual que con el `.zip`. Si al
abrirlo detectan algo raro en los enlaces, pásennos el archivo.
