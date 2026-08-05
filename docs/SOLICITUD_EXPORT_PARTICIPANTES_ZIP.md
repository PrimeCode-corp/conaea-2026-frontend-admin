# Solicitud al backend — Exportación masiva de participantes en `.zip`

**Solicita:** equipo frontend admin (`conaea-2026-frontend-admin`)
**Módulo afectado:** `apps.participant` (panel *Gestión de Participantes*)
**Fecha:** 2026-08-05

> ✅ **Resuelto.** El backend lo implementó tal cual: ver `docs/ENTREGA_EXPORT_PARTICIPANTES_ZIP.md` para el contrato final y las cuatro confirmaciones. Este documento queda como referencia del diseño acordado.

---

## 1. Qué necesitamos y por qué

En el panel de **Gestión de Participantes** (`src/pages/panel/Participant/`) queremos agregar un botón **“Exportar”** que descargue un único archivo `.zip` con el expediente completo de cada participante: su foto, su QR, su ficha de matrícula, sus vouchers de pago y dos `.txt` (datos personales y estado de validaciones).

Hoy el frontend solo puede armar eso pidiendo participante por participante y descargando cada archivo de Cloudinary desde el navegador — inviable para cientos de registros, y además el **QR no existe en ninguna respuesta de la API**: se genera únicamente dentro del correo de bienvenida, en backend. Por eso pedimos que el empaquetado se haga **íntegramente en el servidor** y el frontend solo dispare la descarga.

**Pedido concreto:** un endpoint que reciba los filtros del panel y devuelva el `.zip` ya armado.

---

## 2. Endpoint propuesto

```
GET /participants/export/
```

- **Autenticación:** igual que el resto del panel — `Authorization: Bearer <access>` (JWT). Solo staff/admin.
- **Respuesta OK:** `200` con `Content-Type: application/zip` y
  `Content-Disposition: attachment; filename="participantes_<preventa>_<YYYYMMDD-HHMM>.zip"`.

> Si el nombre o la ruta no encajan con sus convenciones, cámbienlo sin problema: solo avísennos el definitivo para ajustar `participantService`. Lo que sí necesitamos fijo es el **contrato de parámetros** y la **estructura interna del `.zip`**.

### 2.1 Parámetros (query string)

Son **los mismos filtros que ya acepta `GET /participants/table/`**, para reutilizar la barra de filtros del panel sin cambios:

| Param | Tipo | Requerido | Notas |
|---|---|---|---|
| `pre_sale_id` | int | No | Id de preventa. Mismo valor que en `/participants/table/`. |
| `quota_type_id` | int | No | Tipo de cupo / categoría. |
| `university_code` | string | No | Código de universidad (el mismo `code` que devuelve `/participants/partner-universities/select/`). |

Reglas:

- Los tres son **opcionales y combinables** (AND entre ellos). Sin ningún parámetro ⇒ exporta **todos** los participantes activos.
- **No** se envía `search`, `document_type` ni `page`: la exportación no pagina y no depende del texto buscado.
- La semántica de cada filtro debe ser **idéntica** a la de `/participants/table/`; si en la tabla un filtro devuelve N registros, el `.zip` debe traer esos mismos N.

### 2.2 Alcance de los registros

- **Solo participantes activos** (`is_active = True`). Recordar que el panel usa *soft-delete* (`PATCH /participants/participant/{id}/deactivate/`), así que los desactivados deben quedar fuera.
- Se exportan **independientemente de si están validados o no**. El estado de validación no filtra, solo se reporta en `estado.txt` (§3.3).
- Sin límite de página: el `.zip` incluye el universo completo que arroja el filtro.

---

## 3. Estructura del `.zip`

> **La estructura depende del filtro de preventa.** Lo que sigue (§3.1–§3.2) aplica cuando se exporta **una preventa concreta**. Si el filtro está en *“todas las preventas”*, el `.zip` se organiza en carpetas anidadas — ver **§3.6**. El contenido de la carpeta de cada participante es idéntico en ambos casos.

Una carpeta por participante, nombrada con su **documento de identidad**:

```
participantes_preventa-1_20260805-1430.zip
│
├── 72345678/
│   ├── foto.jpg
│   ├── qr.png
│   ├── ficha_matricula.pdf
│   ├── voucher_1.jpg
│   ├── voucher_2.jpg          ← solo si tiene más de un pago
│   ├── datos.txt
│   └── estado.txt
│
├── 71234567/
│   └── …
│
└── _resumen.txt               ← opcional, ver §3.5
```

### 3.1 Nombre de la carpeta

- Usar `identity_document` tal cual (aplica a **DNI y pasaporte**; el pasaporte puede traer letras).
- Sanitizar caracteres no válidos para nombre de archivo (`/ \ : * ? " < > |` → `_`).
- Si por datos sucios hubiera **documentos duplicados**, desambiguar con el id: `72345678_id-412`. No queremos que una carpeta pise a la otra.

### 3.2 Archivos por carpeta

| Archivo | Origen | Si no existe |
|---|---|---|
| `foto.<ext>` | `participant.photograph` (Cloudinary) | Omitir el archivo y anotarlo en `estado.txt`. |
| `qr.png` | **Generado en backend**, ver §3.4 | Nunca debería faltar. |
| `ficha_matricula.<ext>` | `enrollment.archive` (normalmente PDF) | Omitir. Ojo: los participantes de cupo **General** no tienen ficha por diseño — no es un error. |
| `voucher_N.<ext>` | `transaction.voucher` de cada voucher activo, numerados desde 1 en el mismo orden que devuelve `/participants/table/` | Omitir. |
| `datos.txt` | Datos personales, ver §3.3 | Siempre presente. |
| `estado.txt` | Validaciones, ver §3.3 | Siempre presente. |

Conservar la **extensión real** del archivo remoto (`.jpg`, `.png`, `.webp`, `.pdf`), no forzar una.

### 3.3 Contenido de los `.txt`

Ambos en **UTF-8** (idealmente con BOM, para que Notepad en Windows no rompa las tildes) y saltos de línea `CRLF`.

**`datos.txt`** — todos los datos personales que hoy expone `ParticipantTableItem`:

```
========================================
DATOS DEL PARTICIPANTE
========================================
Nombres            : JUAN CARLOS
Apellido paterno   : PEREZ
Apellido materno   : GOMEZ
Nombre completo    : JUAN CARLOS PEREZ GOMEZ
Tipo de documento  : DNI
N° de documento    : 72345678
Fecha de nacimiento: 1999-04-12
Celular            : (+51) 987654321
Correo             : juan.perez@gmail.com

--- ACADÉMICO ---
Universidad        : UNIVERSIDAD NACIONAL DE INGENIERÍA
Abreviatura        : UNI
Código universidad : 1234
Tipo de universidad: Referido
Ciclo académico    : VII
País               : PERÚ

--- INSCRIPCIÓN ---
Preventa           : Preventa 1
Tipo de cupo       : Delegación
Fecha de registro  : 2026-03-14
Hora de registro   : 15:42

--- SALUD ---
Discapacidad       : Ninguna
Alergia            : Penicilina
```

Si un campo viene vacío/`null`, imprimir `—` en vez de omitir la línea (facilita el diff y la lectura manual).

**`estado.txt`** — exactamente los tres estados que el panel muestra hoy (ver `ModalDocuments.tsx` y la columna `is_validated`):

```
========================================
ESTADO DE VALIDACIÓN
========================================
Voucher verificado           : SÍ
Ficha de matrícula verificada: NO
Inscripción verificada       : NO

--- DETALLE DE PAGOS ---
voucher_1.jpg : yape | S/ 150.00 | 2026-03-14 | VALIDADO
voucher_2.jpg : bcp  | S/ 50.00  | 2026-03-20 | SIN VALIDAR

--- ARCHIVOS FALTANTES ---
- Fotografía
```

Mapeo de cada línea (para que no quede ambigüedad):

| Línea | Campo backend | Regla |
|---|---|---|
| `Voucher verificado` | `transaction.is_validated` | `SÍ` si **todos** los vouchers activos están validados. `PARCIAL` si algunos sí y otros no. `NO` si ninguno. `SIN VOUCHER` si no tiene pagos. |
| `Ficha de matrícula verificada` | `enrollment.is_validated` | `SIN FICHA` cuando el cupo es *General* (no aplica). |
| `Inscripción verificada` | `participant.is_validated` | El mismo booleano del semáforo de la tabla. |

La sección `--- ARCHIVOS FALTANTES ---` puede omitirse si no falta nada.

### 3.4 El QR — importante

El QR debe llevar **exactamente el mismo contenido (payload) que el QR embebido en el correo de bienvenida** que ya envía el backend. No queremos una segunda fuente de verdad: si mañana cambia el payload del correo, el del `.zip` debe cambiar solo.

Concretamente: **reutilizar la misma función/servicio que genera el QR del correo**, no reimplementarla. Formato `PNG`, tamaño legible para escaneo en pantalla o impreso (sugerido ≥ 512 px de lado, con margen).

Dos preguntas para ustedes:

1. ¿El QR se genera al vuelo en cada envío de correo, o se persiste (Cloudinary / campo en el modelo)? Si se persiste, con devolver la URL en la API nos bastaría incluso para otros usos.
2. ¿El payload es un texto plano (código/DNI), una URL de verificación, o un JSON firmado? Nos sirve saberlo para documentarlo, aunque el frontend no lo procese.

### 3.5 `_resumen.txt` (opcional pero muy útil)

Un archivo en la raíz del `.zip` con el contexto de la exportación:

```
Exportación generada: 2026-08-05 14:30:12
Filtros aplicados   : preventa=Preventa 1 | cupo=Delegación | universidad=UNI
Participantes       : 148
Con foto            : 145
Con ficha           : 132
Con voucher         : 148
Inscripciones validadas: 120 / 148
```

Sirve para auditar la descarga sin abrir carpeta por carpeta.

### 3.6 Estructura anidada cuando **no** se filtra por preventa

Cuando el usuario deja el filtro de preventa en *“todas las preventas”* — es decir, cuando **`pre_sale_id` no viene en el request** — un solo nivel de carpetas por DNI mezclaría participantes de todas las preventas y universidades en una lista plana de cientos de carpetas, imposible de navegar. En ese caso el `.zip` debe agruparse así:

```
datos/
├── Preventa 1/
│   ├── Delegación/
│   │   ├── UNI/
│   │   │   ├── 72345678/
│   │   │   │   ├── foto.jpg
│   │   │   │   ├── qr.png
│   │   │   │   ├── ficha_matricula.pdf
│   │   │   │   ├── voucher_1.jpg
│   │   │   │   ├── datos.txt
│   │   │   │   └── estado.txt
│   │   │   └── 71234567/
│   │   │       └── …
│   │   └── UNMSM/
│   │       └── 70112233/
│   │           └── …
│   └── General/
│       └── UPC/
│           └── 73344556/
│               └── …
└── Preventa 2/
    └── General/             ← "Delegación" no aparece: nadie se inscribió en ese cupo
        └── UNI/
            └── 70998877/
                └── …
```

Es decir: **`datos/` → `<preventa>/` → `<tipo de cupo>/` → `<universidad>/` → `<documento>/`**, y dentro de esa última carpeta exactamente los mismos archivos descritos en §3.2–§3.4. **Nada del contenido por participante cambia**; lo único que cambia es la ruta donde vive esa carpeta.

Reglas de los niveles nuevos:

| Nivel | Nombre | Reglas |
|---|---|---|
| Raíz | `datos` | Literal, siempre ese nombre. |
| Preventa | `pre_sale` | El nombre de la preventa tal como lo devuelve la API (ej. `Preventa 1`). Sanitizar caracteres inválidos como en §3.1. |
| Tipo de cupo | `quota_type` | El nombre del tipo de cupo del participante (ej. `Delegación`, `General`). |
| Universidad | `university_abbreviation` | **Preferimos la abreviatura** (`UNI`, `UNMSM`) por el límite de longitud de ruta en Windows — ver nota abajo. Si el participante no tiene abreviatura, usar `university_name` truncado; si tampoco tiene universidad, agrupar todo bajo `SIN_UNIVERSIDAD`. |
| Documento | `identity_document` | Idénticas reglas que §3.1, incluida la desambiguación por id en caso de duplicados. |

#### Sin carpetas vacías

**Una carpeta se crea solo si tiene al menos un participante dentro.** Si una preventa no tiene inscritos, no aparece; si dentro de una preventa un tipo de cupo está vacío, ese nivel no aparece; lo mismo con las universidades.

Dicho de otro modo: **el árbol se deriva de los participantes exportados**, no del catálogo. No hay que recorrer preventas × cupos × universidades para pre-crear ramas — basta con agrupar el queryset ya filtrado y escribir la ruta de cada participante. Es también la implementación más simple: el `.zip` no lleva ninguna entrada de directorio explícita, cada archivo se escribe con su ruta completa y los niveles quedan implícitos.

Notas:

- **Solo cuando `pre_sale_id` está ausente.** Si viene una preventa concreta, se mantiene la estructura plana de §3 (una carpeta por DNI en la raíz), que es la que ya usa el equipo de acreditación.
- Los filtros `quota_type_id` y `university_code` **no** cambian la forma del árbol: siguen filtrando el universo de registros, nada más. Si se filtra por un tipo de cupo y no por preventa, cada preventa tendrá un solo nivel de cupo debajo — es correcto, y las preventas que no tengan a nadie con ese cupo simplemente no aparecen.
- El `_resumen.txt` (§3.5) va **en la raíz del `.zip`**, al lado de `datos/`, no dentro.
- **Longitud de ruta en Windows:** el explorador de Windows todavía corta en 260 caracteres al descomprimir. Con cinco niveles más el nombre del archivo, un nombre de universidad completo (`UNIVERSIDAD NACIONAL DE SAN ANTONIO ABAD DEL CUSCO`) pasa del límite. Por eso pedimos la abreviatura, y sugerimos **truncar cualquier nombre de carpeta a ~40 caracteres**.
- Si prefieren **anidar siempre** (también con preventa filtrada, quedando `datos/Preventa 1/Delegación/UNI/72345678/`) para tener una sola implementación, díganlo y lo adoptamos: nos sirve igual y les ahorra la rama condicional. Solo necesitamos saber cuál de las dos quedó.

---

## 4. Comportamiento esperado en casos borde

| Caso | Comportamiento pedido |
|---|---|
| El filtro no arroja participantes | `200` con un `.zip` que solo contenga `_resumen.txt`, **o** `204 No Content`. Nos acomodamos a lo que prefieran; solo necesitamos poder distinguirlo para mostrar “No hay participantes con esos filtros”. |
| Un archivo de Cloudinary da 404 / timeout | **No abortar la exportación.** Omitir ese archivo, anotarlo en `--- ARCHIVOS FALTANTES ---` y seguir con el resto. |
| Participante sin ficha por ser cupo *General* | No es error. `ficha_matricula` ausente y `estado.txt` con `SIN FICHA`. |
| Participante con varios vouchers | Un archivo por voucher, `voucher_1`, `voucher_2`, … y una línea por cada uno en el detalle de pagos. |
| Token vencido | `401` normal; nuestro interceptor de Axios refresca y reintenta solo. |
| Sin permisos | `403` con `{ "detail": "..." }`. |

---

## 5. Rendimiento — el punto que más nos preocupa

Con ~150 participantes el backend tiene que descargar **~500 archivos de Cloudinary**, generar 150 QR y comprimir todo. Eso puede tardar minutos, y nuestro cliente Axios tiene un **timeout global de 5 s** (`VITE_API_TIMEOUT` en `src/lib/axios.ts`). Vamos a subir el timeout solo para esta llamada, pero igual necesitamos acordar el enfoque:

**Opción A — descarga síncrona (preferida si el tiempo es razonable)**

Un solo `GET` que responde el `.zip`. Simple de consumir. Viable si el servidor puede responder en **menos de ~60 s** (paralelizar la descarga de Cloudinary y transmitir con `StreamingHttpResponse` ayuda mucho, y evita cargar todo el `.zip` en memoria).

**Opción B — job asíncrono (si A no es viable a este volumen)**

```
POST /participants/export/          → 202 { "task_id": "abc123" }
GET  /participants/export/abc123/   → { "status": "pending|done|error",
                                        "progress": 42,
                                        "download_url": "https://…" }
```

Nosotros hacemos polling y mostramos una barra de progreso. Es más trabajo de ambos lados, pero es lo correcto si la exportación pasa del minuto.

**Nuestra recomendación:** empezar con **A** y medir con la preventa más grande. Si se pasa de ~60 s, migramos a **B**. Solo necesitamos que nos digan cuál implementaron antes de que armemos el botón.

Otras consideraciones que agradecemos:

- **Streaming** de la respuesta en vez de armar el `.zip` completo en RAM.
- **Compresión** `ZIP_DEFLATED` (las fotos y PDFs ya vienen comprimidos, pero los `.txt` sí se benefician).
- Un **límite duro** de registros por exportación, si lo consideran necesario — avísennos el número para mostrarlo en la UI.

---

## 6. Cómo lo vamos a consumir (referencia)

Para que quede claro el contrato desde nuestro lado:

```ts
// src/services/participantService.ts
export const participantService = {
  // …

  /** Descarga el .zip con el expediente de los participantes activos filtrados. */
  exportZip: (filters: {
    pre_sale_id?: number;
    quota_type_id?: number;
    university_code?: string;
  } = {}) => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== ''),
    );
    return api
      .get<Blob>('/participants/export/', {
        params,
        responseType: 'blob',
        timeout: 0, // la exportación excede el timeout global de 5 s
      })
      .then((res) => res.data);
  },
};
```

El botón vivirá junto a `ParticipantFilters`, reutilizando el estado que ya mantiene `Participant.tsx` (`selectedPreSaleId`, `selectedQuotaTypeId`, `selectedUniversityCode`).

### 6.1 El botón deja elegir dónde guardar la exportación

Requisito de UX: al pulsar **Exportar**, el usuario debe poder **elegir la carpeta de destino** en vez de que el `.zip` caiga en la carpeta de descargas por defecto. Quien exporta suele hacerlo varias veces con filtros distintos y necesita dejar cada archivo en su sitio.

Esto se resuelve **del lado del frontend** con la File System Access API (`window.showSaveFilePicker`), que abre el diálogo nativo “Guardar como”. **No requiere trabajo del backend**, con dos salvedades que sí dependen de ustedes (§6.2). Lo anotamos aquí para que quede constancia del comportamiento acordado:

```ts
// Chromium (Chrome/Edge): diálogo nativo + escritura en streaming al disco.
const handle = await window.showSaveFilePicker({
  suggestedName: 'participantes_preventa-1_20260805-1430.zip',
  types: [{ description: 'Archivo ZIP', accept: { 'application/zip': ['.zip'] } }],
});
const writable = await handle.createWritable();
await response.body.pipeTo(writable); // se escribe directo a disco, sin pasar por RAM
```

- **Chrome / Edge:** diálogo nativo para elegir carpeta y nombre. Es el caso principal — el panel se usa en escritorio.
- **Firefox / Safari:** no soportan la API. Caemos al `<a download>` de siempre (va a la carpeta de descargas); el usuario puede activar *“Preguntar dónde guardar cada archivo”* en su navegador para obtener el mismo diálogo. Lo indicaremos en un tooltip.

### 6.2 Lo que sí necesitamos del backend para que esto funcione bien

1. **`Content-Disposition` expuesto por CORS.** Para proponer el nombre correcto en el diálogo tenemos que *leer* la cabecera desde JavaScript, y el navegador solo lo permite si el servidor la declara:

   ```
   Access-Control-Expose-Headers: Content-Disposition, Content-Length
   ```

   Sin eso, `Content-Disposition` llega pero el navegador nos lo oculta y tendríamos que inventar el nombre del archivo en el cliente.

2. **`Content-Length`**, si el `.zip` se arma completo antes de responder. Nos permite mostrar una barra de progreso real en vez de un spinner indeterminado. Si van por *streaming* (§5, opción A) es normal que no exista — no es bloqueante, solo nos hace mostrar “Descargando…” sin porcentaje.

Además, escribir en streaming al disco nos evita mantener el `.zip` completo como `Blob` en memoria, que con cientos de expedientes podría tumbar la pestaña. Ese es otro punto a favor de que la respuesta venga en streaming desde el servidor.

---

## 7. Resumen del pedido

- [ ] `GET /participants/export/` (o la ruta que definan), autenticado, respondiendo `application/zip`.
- [ ] Filtros `pre_sale_id`, `quota_type_id`, `university_code` con la **misma semántica** que `/participants/table/`.
- [ ] Solo participantes con `is_active = True`, sin paginar.
- [ ] Una carpeta por `identity_document`, con `foto`, `qr.png`, `ficha_matricula`, `voucher_N`, `datos.txt` y `estado.txt`.
- [ ] **Con `pre_sale_id`:** esa carpeta va en la raíz del `.zip` (§3).
- [ ] **Sin `pre_sale_id` (todas las preventas):** esa misma carpeta va anidada en `datos/<preventa>/<tipo de cupo>/<universidad>/<documento>/` (§3.6).
- [ ] Secciones sin inscripciones: **la carpeta no se crea**. El árbol se deriva de los participantes exportados, no del catálogo (§3.6).
- [ ] QR generado con **la misma función que el QR del correo de bienvenida**.
- [ ] Archivos faltantes no rompen la exportación; se reportan en `estado.txt`.
- [ ] `Access-Control-Expose-Headers: Content-Disposition, Content-Length` (§6.2), para poder proponer el nombre del archivo en el diálogo “Guardar como”.
- [ ] Confirmar: ¿opción A (síncrona) u opción B (job asíncrono)?
- [ ] Confirmar: nombre final de la ruta y comportamiento con resultado vacío (`200` con zip vacío vs `204`).
- [ ] Confirmar: ¿estructura condicional (§3.6) o anidada siempre?
- [ ] Responder las dos preguntas sobre el QR (§3.4).

Cualquier ajuste a la estructura interna del `.zip` lo podemos conversar — lo importante es que quede **estable**, porque el nombre de las carpetas y de los `.txt` los va a usar el equipo de acreditación en sitio.
