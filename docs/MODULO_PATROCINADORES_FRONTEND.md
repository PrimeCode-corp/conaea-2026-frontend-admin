# Módulo de patrocinadores — guía de implementación para el frontend

Guía para consumir el módulo de auspiciadores del backend (app `apps.partner`). Cubre las dos partes:

- **Frontend público** — mostrar los auspiciadores en la landing. Es un solo `GET`, sin autenticación.
- **Frontend admin** — pantalla de gestión (crear/editar/desactivar auspiciadores, redes sociales y enlaces).

Todas las rutas son relativas a `VITE_API_URL` (por defecto `http://127.0.0.1:8000/api`).

---

## 1. El modelo de datos en 30 segundos

Son tres entidades:

- **Partner (auspiciador)** — la empresa/institución. Tiene `type` (`Socio`, `Colaborador` o `Patrocinador`), `name`, `description` y `logo` (imagen).
- **Network (red social)** — un **catálogo** compartido: Instagram, LinkedIn, Facebook… Se crea una sola vez y lo reusan todos los auspiciadores. Su campo `logo` **no es una imagen**, es el identificador del icono que el frontend renderiza (ej. `"instagram"`).
- **PartnerNetwork (enlace)** — une un auspiciador con una red social y guarda la URL del perfil (`link`).

```
Partner ──< PartnerNetwork >── Network
"Bayer"      link: ig.com/bayer     "Instagram"
```

La consecuencia práctica para la UI: **un auspiciador no se crea con sus redes en un solo request**. Primero se crea el `Partner`, y después se agregan sus enlaces uno por uno (ver §5.4).

---

## 2. Tipos TypeScript

Coloca esto en `src/types/partner.ts` (o donde tengas los tipos del proyecto).

```ts
export type PartnerType = 'Socio' | 'Colaborador' | 'Patrocinador';

/** Catálogo de redes sociales. `logo` es el nombre del icono, no una URL. */
export interface Network {
  id: number;
  name: string;
  logo: string | null;
  is_active: boolean;
}

/** Enlace visto desde su auspiciador (respuesta aplanada). */
export interface PartnerNetworkNested {
  id: number;
  network_id: number;
  name: string;        // nombre de la red social
  logo: string | null; // icono de la red social
  link: string;
  is_active: boolean;
}

/** Auspiciador tal como lo devuelve el listado/detalle del admin. */
export interface Partner {
  id: number;
  type: PartnerType;
  name: string;
  description: string;
  logo: string;                     // URL de Cloudinary (.webp)
  networks: PartnerNetworkNested[]; // solo en GET, ver §5.2
  is_active: boolean;
}

/** Enlace tal como lo devuelve el listado del admin (relaciones anidadas). */
export interface PartnerNetworkDetail {
  id: number;
  network: Network;
  partner: Omit<Partner, 'networks'>;
  link: string;
  is_active: boolean;
}

/** Vista pública: sin `is_active`, sin IDs de relaciones. */
export interface Sponsor {
  id: number;
  type: PartnerType;
  name: string;
  description: string;
  logo: string;
  networks: Array<{ name: string; logo: string | null; link: string }>;
}
```

---

## 3. Frontend público

### 3.1 El endpoint

```
GET /sponsors/
```

Sin token. Devuelve un array de auspiciadores **activos**, ya ordenados por tipo (**Patrocinador → Colaborador → Socio**) y luego alfabéticamente. Solo incluye enlaces cuya red social también esté activa.

```json
[
  {
    "id": 1,
    "type": "Patrocinador",
    "name": "Bayer Perú",
    "description": "Patrocinador principal",
    "logo": "https://res.cloudinary.com/…/partners/bayer_peru.webp",
    "networks": [
      { "name": "Instagram", "logo": "instagram", "link": "https://instagram.com/bayer" }
    ]
  }
]
```

### 3.2 El servicio

Mismo patrón que `scheduleService` (cacheado en sesión, porque los auspiciadores casi no cambian durante una visita):

```ts
// src/services/sponsorService.ts
import api from '@/lib/axios';
import type { Sponsor, PartnerType } from '@/types/partner';

const CACHE_KEY = 'conaea:sponsors';

export const sponsorService = {
  async getSponsors(): Promise<Sponsor[]> {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) return JSON.parse(cached);

    const { data } = await api.get<Sponsor[]>('/sponsors/');
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
    return data;
  },
};
```

### 3.3 Agrupar por tipo para renderizar las secciones

El endpoint devuelve una lista plana, ya en el orden correcto. Si la landing muestra secciones separadas ("Patrocinadores", "Colaboradores", "Socios"), agrupa en el cliente — **no hagas tres requests**:

```ts
const ORDER: PartnerType[] = ['Patrocinador', 'Colaborador', 'Socio'];

export function groupByType(sponsors: Sponsor[]) {
  return ORDER
    .map((type) => ({
      type,
      title: { Patrocinador: 'Patrocinadores', Colaborador: 'Colaboradores', Socio: 'Socios' }[type],
      items: sponsors.filter((s) => s.type === type),
    }))
    .filter((group) => group.items.length > 0); // no pintes secciones vacías
}
```

> Existe `GET /sponsors/?type=patrocinador` (case-insensitive) por si alguna vista necesita un solo tipo, pero para la landing completa una sola llamada es lo correcto.

### 3.4 Notas de renderizado

- `logo` ya viene optimizado: es un **WEBP** servido por Cloudinary. Úsalo directo en el `src`, con `loading="lazy"`.
- `networks[].logo` es un **identificador de icono** (`"instagram"`, `"linkedin"`…), no una imagen. Mapéalo a tu set de iconos y deja un fallback por si llega un valor desconocido o `null`.
- `networks` puede ser un array vacío: el auspiciador simplemente no tiene redes cargadas.
- Los enlaces son externos → `target="_blank" rel="noopener noreferrer"`.

---

## 4. Autenticación del admin

Todos los endpoints de `/partners/…` requieren JWT. Si ya usas la instancia de `src/lib/axios.ts`, no hay nada que hacer: el interceptor adjunta `Authorization: Bearer <access>` y refresca ante un `401`.

Sin token la respuesta es `401`.

---

## 5. Frontend admin

### 5.1 Redes sociales (catálogo)

```ts
// src/services/networkService.ts
import api from '@/lib/axios';
import type { Network } from '@/types/partner';

export const networkService = {
  getAll: () => api.get<Network[]>('/partners/network/').then((r) => r.data),
  getById: (id: number) => api.get<Network>(`/partners/network/${id}/`).then((r) => r.data),
  create: (payload: { name: string; logo?: string }) =>
    api.post<Network>('/partners/network/', payload).then((r) => r.data),
  update: (id: number, payload: Partial<{ name: string; logo: string }>) =>
    api.patch<Network>(`/partners/network/${id}/`, payload).then((r) => r.data),
  remove: (id: number) =>
    api.patch(`/partners/network/${id}/`, { is_active: false }).then((r) => r.data),
};
```

JSON normal (no hay archivos). `logo` es texto de máximo **20 caracteres**: el identificador del icono. Lo ideal es que el formulario ofrezca un **select** con los iconos que el frontend sabe pintar, no un input libre.

⚠️ **Desactivar una red que todavía tiene enlaces devuelve `400`** — ver §6.2.

### 5.2 Auspiciadores

```ts
// src/services/partnerService.ts
import api from '@/lib/axios';
import type { Partner, PartnerType, PartnerNetworkNested } from '@/types/partner';

export interface PartnerPayload {
  type: PartnerType;
  name: string;
  description: string;
  logo?: File; // obligatorio al crear, opcional al editar
}

function toFormData(payload: Partial<PartnerPayload>): FormData {
  const fd = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) fd.append(key, value as string | Blob);
  });
  return fd;
}

export const partnerService = {
  getAll: (type?: PartnerType) =>
    api.get<Partner[]>('/partners/partner/', { params: type ? { type } : undefined })
       .then((r) => r.data),

  getById: (id: number) => api.get<Partner>(`/partners/partner/${id}/`).then((r) => r.data),

  create: (payload: PartnerPayload) =>
    api.post<Partner>('/partners/partner/', toFormData(payload)).then((r) => r.data),

  update: (id: number, payload: Partial<PartnerPayload>) =>
    api.patch<Partner>(`/partners/partner/${id}/`, toFormData(payload)).then((r) => r.data),

  remove: (id: number) =>
    api.patch(`/partners/partner/${id}/`, { is_active: false }).then((r) => r.data),

  getNetworks: (id: number) =>
    api.get<PartnerNetworkNested[]>(`/partners/partner/${id}/networks/`).then((r) => r.data),
};
```

Tres cosas que suelen tropezar acá:

1. **`multipart/form-data`, no JSON.** Al pasar un `FormData` axios pone el `Content-Type` con el boundary correcto solo. **No lo escribas a mano.**
2. **Al editar sin cambiar el logo, no mandes el campo `logo`.** El backend detecta que la imagen no cambió y no la reprocesa. Si mandas el string de la URL actual, la petición falla (espera un archivo).
3. **La respuesta de `POST`/`PATCH` no trae `networks`** (solo la traen los `GET`). Si tu store espera un `Partner` completo, vuelve a pedir el detalle o inicializa `networks: []`.

El listado acepta `?type=` para filtrar por tipo — útil si la pantalla tiene tabs.

### 5.3 Enlaces a redes sociales

```ts
// src/services/partnerNetworkService.ts
import api from '@/lib/axios';
import type { PartnerNetworkDetail } from '@/types/partner';

export const partnerNetworkService = {
  getAll: (params?: { partner_id?: number; network_id?: number }) =>
    api.get<PartnerNetworkDetail[]>('/partners/partner-network/', { params }).then((r) => r.data),

  create: (payload: { partner: number; network: number; link: string }) =>
    api.post('/partners/partner-network/', payload).then((r) => r.data),

  update: (id: number, payload: Partial<{ partner: number; network: number; link: string }>) =>
    api.patch(`/partners/partner-network/${id}/`, payload).then((r) => r.data),

  remove: (id: number) =>
    api.patch(`/partners/partner-network/${id}/`, { is_active: false }).then((r) => r.data),
};
```

Ojo con la asimetría (es la misma de toda la API):

- En **lectura** (`GET`) `network` y `partner` vienen como **objetos anidados**.
- En **escritura** (`POST`/`PATCH`) se mandan como **IDs numéricos**.

Para listar las redes de un auspiciador tienes dos caminos equivalentes; usa el que te acomode:

- `partnerService.getNetworks(id)` → respuesta **aplanada** (`{id, network_id, name, logo, link}`), ideal para pintar la lista directo.
- `partnerNetworkService.getAll({ partner_id: id })` → respuesta con objetos anidados, útil si necesitas el objeto `Network` completo.

### 5.4 Flujo recomendado de la UI

Como el auspiciador y sus enlaces se guardan por separado:

**Crear**
1. Formulario con `type`, `name`, `description` y el archivo del logo → `partnerService.create()`.
2. Con el `id` que devuelve, muestra la sección "Redes sociales" y agrega los enlaces con `partnerNetworkService.create()`.

> Si prefieres un formulario único, junta las redes en el estado local y dispara los `POST` de enlaces en secuencia después del `POST` del auspiciador. Recuerda que **no son atómicos**: si falla un enlace, el auspiciador ya quedó creado. Muestra el error sobre esa fila y deja reintentar, en lugar de dar todo el formulario por fallido.

**Editar**
1. `partnerService.getById(id)` ya trae `networks` — con eso pintas el formulario y la tabla de enlaces sin una segunda llamada.
2. Los datos del auspiciador y cada enlace se guardan con requests independientes.

**Eliminar**
- Siempre `PATCH { is_active: false }`. Ver §6.

---

## 6. Borrado y errores

### 6.1 Es soft-delete: usa PATCH, nunca DELETE

Como en el resto del panel, "eliminar" es `PATCH { is_active: false }`. Los listados solo devuelven registros activos, así que el elemento desaparece igual.

⚠️ **No uses el método `DELETE`.** La ruta existe pero borra de verdad, y sobre un auspiciador con enlaces revienta con un error del servidor por la restricción de la base de datos.

⚠️ **Un registro desactivado ya no es accesible por la API** (los `GET` por id devuelven `404`). No hay endpoint para reactivarlo, así que **el botón de eliminar debe pedir confirmación**: no existe un "deshacer" desde el panel.

### 6.2 Al desactivar un auspiciador, sus enlaces caen con él

Desactivar un `Partner` desactiva automáticamente sus `PartnerNetwork`. No tienes que borrarlos antes ni hacer limpieza después.

En cambio, **desactivar una `Network` que todavía tiene enlaces activos se bloquea** con `400`, porque es un catálogo compartido entre auspiciadores:

```json
{ "detail": "No se puede desactivar la red social porque tiene 3 enlaces asociados." }
```

El mensaje viene listo para mostrarse en un toast. La forma de destrabarlo es quitar primero esos enlaces (`partnerNetworkService.remove`).

### 6.3 Formato de los errores

Son los dos formatos de siempre:

```ts
// Validación de campos → 400
{ "logo": ["Solo se permiten imágenes JPG o PNG"], "name": ["Este campo es requerido."] }

// Regla de negocio → 400
{ "detail": "No se puede desactivar la red social porque tiene 3 enlaces asociados." }
```

Un helper para pintarlos:

```ts
export function toErrorMessage(error: unknown): string {
  const data = (error as AxiosError<Record<string, unknown>>)?.response?.data;
  if (!data) return 'Ocurrió un error inesperado.';
  if (typeof data.detail === 'string') return data.detail;
  const first = Object.values(data)[0];              // errores por campo
  return Array.isArray(first) ? String(first[0]) : String(first);
}
```

Para los errores por campo, lo ideal es mapearlos a su input (la clave del objeto es el nombre del campo) en vez de mostrar solo el primero.

---

## 7. Reglas del logo (validar en el cliente)

El backend acepta el logo del auspiciador con estas condiciones:

| Regla | Valor | Mensaje del backend |
|---|---|---|
| Formato | **JPG o PNG** únicamente | `Solo se permiten imágenes JPG o PNG` |
| Peso | máximo **1024 KB** | `El logo no debe superar los 1024 KB` |
| Obligatorio | sí, al crear | `Este campo es requerido.` |

Valídalo también en el cliente para dar feedback inmediato:

```ts
const MAX_KB = 1024;
const TYPES = ['image/jpeg', 'image/png'];

export function validateLogo(file: File): string | null {
  if (!TYPES.includes(file.type)) return 'Solo se permiten imágenes JPG o PNG.';
  if (file.size > MAX_KB * 1024) return `El logo no debe superar los ${MAX_KB} KB.`;
  return null;
}
```

El backend convierte la imagen a **WEBP** y la sube a Cloudinary, así que el `logo` que recibes de vuelta **siempre es una URL `.webp`**, no el archivo que subiste. Para la vista previa antes de guardar usa `URL.createObjectURL(file)`.

> El nombre del archivo se deriva del `name` del auspiciador (sin tildes, en minúsculas y con guiones bajos): "Bayér Perú" → `partners/bayer_peru.webp`. Dos auspiciadores con el mismo nombre se pisarían el archivo — no permitas nombres duplicados en el formulario.

---

## 8. Validaciones que aplica el backend

| Regla | Respuesta |
|---|---|
| `type` debe ser exactamente `Socio`, `Colaborador` o `Patrocinador` (con mayúscula inicial) | `400` — `"Inventado" is not a valid choice.` |
| `name` del auspiciador y de la red: máximo 50 caracteres | `400` |
| `Network.logo`: máximo 20 caracteres | `400` |
| `link`: máximo 500 caracteres | `400` |
| Un auspiciador **no puede tener dos enlaces activos en la misma red social** | `400` — `El auspiciador ya tiene un enlace activo en esta red social.` |

Sobre la última: filtra en el `<select>` de redes las que el auspiciador ya tiene, para que el usuario no llegue a chocar con el error.

---

## 9. Resumen de endpoints

### Público (sin token)

| Método | Endpoint | Uso |
|---|---|---|
| GET | `/sponsors/` | Auspiciadores para la landing. Opcional `?type=` |

### Admin (JWT)

| Método | Endpoint | Uso |
|---|---|---|
| GET | `/partners/network/` | Catálogo de redes sociales |
| POST | `/partners/network/` | Crear red social |
| GET | `/partners/network/{id}/` | Detalle |
| PATCH | `/partners/network/{id}/` | Editar / desactivar (`is_active:false`) |
| GET | `/partners/partner/` | Listado con `networks`. Opcional `?type=` |
| POST | `/partners/partner/` | Crear — `multipart/form-data` |
| GET | `/partners/partner/{id}/` | Detalle con `networks` |
| PATCH | `/partners/partner/{id}/` | Editar (`multipart` si cambia el logo) / desactivar |
| GET | `/partners/partner/{id}/networks/` | Redes del auspiciador (aplanadas) |
| GET | `/partners/partner-network/` | Enlaces. Opcional `?partner_id=`, `?network_id=` |
| POST | `/partners/partner-network/` | Crear enlace (`partner`, `network`, `link`) |
| GET | `/partners/partner-network/{id}/` | Detalle |
| PATCH | `/partners/partner-network/{id}/` | Editar / desactivar |

---

## 10. Checklist de implementación

**Frontend público**
- [ ] `sponsorService.getSponsors()` con caché en sesión
- [ ] Agrupar por tipo en el cliente y ocultar las secciones vacías
- [ ] Mapear `networks[].logo` al set de iconos, con fallback
- [ ] Enlaces externos con `rel="noopener noreferrer"`

**Frontend admin**
- [ ] Los tres servicios (`network`, `partner`, `partnerNetwork`)
- [ ] Formulario de auspiciador con `FormData` y validación del logo en cliente
- [ ] Al editar, omitir `logo` si no se eligió un archivo nuevo
- [ ] Sección de redes dentro del detalle del auspiciador (agregar/editar/quitar enlaces)
- [ ] Ocultar del `<select>` las redes que el auspiciador ya usa
- [ ] Eliminar siempre con `PATCH {is_active:false}` y con confirmación previa
- [ ] Mostrar el `detail` del `400` al intentar desactivar una red con enlaces
- [ ] Invalidar la caché del sitio público (o avisarlo) tras cambios, si comparten sesión

---

Referencia del backend: `apps/partner/README.md` (modelos, comportamiento de borrado y detalle de cada endpoint).
