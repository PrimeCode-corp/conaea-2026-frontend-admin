# `src/hooks`

Hooks reutilizables que concentran la lógica repetida de las páginas del panel. Antes de duplicar estado/handlers en una página, revisa si uno de estos ya lo cubre.

| Hook | Rol | Opciones clave |
|---|---|---|
| `useResourceForm` | Estado y handlers de **un** formulario (crear o editar): apertura del modal, `onChange`/`onValueChange`/`onFile`, validación, envío y toasts. | `onSuccess` (p. ej. refetch tras crear), `fieldErrors` (mapea errores por campo del backend antes del toast), `mode` (`'create'`/`'edit'`). |
| `useCrudPanel` | Combina **editar + eliminar** sobre una lista. Devuelve `onEdit`/`onDelete` (para los botones de fila), `rowToEdit`, `editFields` y los bundles `deleteModal`/`editModal`. Internamente usa `useResourceForm` para la edición. | `getEditFields(item)` (campos de edición dinámicos por fila, p. ej. con `hint`), `fieldErrors`, `getRowLabel` (texto del modal de borrado). |
| `useClientPagination` | Paginación client-side sobre un array en memoria. Resetea a la página 1 cuando cambia el tamaño de la lista. | `pageSize` (def. 10). |
| `useServerTable` | Paginación de **servidor**: refetch con debounce al cambiar filtros/búsqueda + arma el objeto `pagination` de `TablePanel`. | `search` (controla el debounce), `debounceMs`, `enabled`. |
| `useDisclosure<T>` | Estado de un modal con dato asociado: `{ open, setOpen, data, show, hide }`. Reemplaza los pares `open`/`data` repetidos. | — |
| `useAuthInit`, `useScrollToTop` | Utilidades puntuales (init de auth al cargar, scroll al cambiar de ruta). | — |

## Convenciones

- El "Crear" vive en `*ActionButtons.tsx` con `useResourceForm`; el editar/eliminar en la página con `useCrudPanel`.
- Las acciones de los stores Zustand son referencias estables: es seguro incluirlas en los arrays de dependencias de los efectos.
- Para la paginación de servidor, combina `useServerTable` (refetch) con `getServerFooterProps` (`@/utils/pagination`) para el `FooterPanel`.

Ver también: `src/pages/panel/README.md`.
